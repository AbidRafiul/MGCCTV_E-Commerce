const crypto = require("crypto");
const midtransClient = require("midtrans-client");
const db = require("../config/database");

const mapMidtransStatus = (transactionStatus, fraudStatus) => {
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "paid" : "pending";
  }

  if (transactionStatus === "settlement") {
    return "paid";
  }

  if (transactionStatus === "cancel" || transactionStatus === "deny") {
    return "failed";
  }

  if (transactionStatus === "expire") {
    return "expired";
  }

  return "pending";
};

const RESTORE_STOCK_PAYMENT_STATUSES = new Set(["failed", "expired"]);
const DEDUCT_STOCK_PAYMENT_STATUSES = new Set(["paid"]);

const syncTransactionInventory = async ({ idTransaksi, nextPaymentStatus }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [transactionRows] = await connection.execute(
      `
        SELECT id_transaksi, status_bayar
        FROM tr_transaksi
        WHERE id_transaksi = ?
        LIMIT 1
        FOR UPDATE
      `,
      [idTransaksi],
    );

    if (transactionRows.length === 0) {
      const error = new Error("Transaksi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const currentPaymentStatus = String(transactionRows[0].status_bayar || "").toLowerCase();
    const normalizedNextStatus = String(nextPaymentStatus || "").toLowerCase();

    if (!normalizedNextStatus) {
      const error = new Error("Status pembayaran tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const shouldRestoreStock =
      RESTORE_STOCK_PAYMENT_STATUSES.has(normalizedNextStatus) &&
      DEDUCT_STOCK_PAYMENT_STATUSES.has(currentPaymentStatus);

    const shouldDeductStock =
      DEDUCT_STOCK_PAYMENT_STATUSES.has(normalizedNextStatus) &&
      !DEDUCT_STOCK_PAYMENT_STATUSES.has(currentPaymentStatus);

    if (shouldDeductStock) {
      const [detailRows] = await connection.execute(
        `
          SELECT id_produk, quantity
          FROM tr_detail_transaksi
          WHERE id_transaksi = ?
        `,
        [idTransaksi],
      );

      for (const detail of detailRows) {
        const productId = Number(detail.id_produk || 0);
        const quantity = Number(detail.quantity || 0);

        const [productRows] = await connection.execute(
          `
            SELECT stok
            FROM ms_produk
            WHERE id_produk = ?
            LIMIT 1
            FOR UPDATE
          `,
          [productId],
        );

        if (productRows.length === 0) {
          const error = new Error(`Produk dengan ID ${productId} tidak ditemukan`);
          error.statusCode = 404;
          throw error;
        }

        const currentStock = Number(productRows[0].stok || 0);
        if (currentStock < quantity) {
          const error = new Error("Stok barang tidak mencukupi untuk menyelesaikan pembayaran");
          error.statusCode = 409;
          throw error;
        }

        await connection.execute(
          `
            UPDATE ms_produk
            SET stok = stok - ?
            WHERE id_produk = ?
          `,
          [quantity, productId],
        );
      }
    }

    if (shouldRestoreStock) {
      const [detailRows] = await connection.execute(
        `
          SELECT id_produk, quantity
          FROM tr_detail_transaksi
          WHERE id_transaksi = ?
        `,
        [idTransaksi],
      );

      for (const detail of detailRows) {
        await connection.execute(
          `
            UPDATE ms_produk
            SET stok = stok + ?
            WHERE id_produk = ?
          `,
          [Number(detail.quantity || 0), Number(detail.id_produk || 0)],
        );
      }
    }

    await connection.execute(
      `
        UPDATE tr_transaksi
        SET status_bayar = ?
        WHERE id_transaksi = ?
      `,
      [normalizedNextStatus, idTransaksi],
    );

    await connection.commit();

    return {
      deductedStock: shouldDeductStock,
      restoredStock: shouldRestoreStock,
      previousStatus: currentPaymentStatus || "pending",
      nextStatus: normalizedNextStatus,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createMidtransTransaction = async (req, res) => {
  let connection;

  try {
    const bodyUserId = Number(req.body.id_users || 0);
    const authUserId = Number(req.user?.id || req.user?.id_users || 0);
    const id_users = authUserId || bodyUserId;
    const total_harga = Number(req.body.total_harga || 0);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const metode_bayar = req.body.payment_method === "qris" ? "qris" : "transfer_bank";

    if (!id_users || !total_harga) {
      return res.status(400).json({
        success: false,
        message: "id_users dan total_harga wajib diisi",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data items (barang) wajib diisi dan berupa array",
      });
    }

    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
      return res.status(500).json({
        success: false,
        message: "Konfigurasi Midtrans sandbox belum lengkap",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    for (const item of items) {
      const id_produk = Number(item.id_produk || 0);
      const quantity = Number(item.quantity || 0);

      if (!id_produk || quantity <= 0) {
        throw new Error("Data item transaksi tidak valid");
      }

      const [stockResult] = await connection.execute(
        "SELECT stok FROM ms_produk WHERE id_produk = ? FOR UPDATE",
        [id_produk],
      );

      if (stockResult.length === 0) {
        const error = new Error(`Produk dengan ID ${id_produk} tidak ditemukan`);
        error.statusCode = 404;
        throw error;
      }

      const currentStock = Number(stockResult[0].stok || 0);
      if (currentStock < quantity) {
        const error = new Error("Stok barang tidak mencukupi");
        error.statusCode = 400;
        throw error;
      }
    }

    const [insertResult] = await connection.execute(
      `
        INSERT INTO tr_transaksi (id_users, total_harga, metode_bayar, status_bayar, tanggal_transaksi)
        VALUES (?, ?, ?, 'pending', NOW())
      `,
      [id_users, total_harga, metode_bayar],
    );
    const insertId = insertResult.insertId;

    for (const item of items) {
      const id_produk = Number(item.id_produk || 0);
      const quantity = Number(item.quantity || 0);
      const harga = Number(item.harga || 0);
      const total = quantity * harga;

      await connection.execute(
        `
          INSERT INTO tr_detail_transaksi (id_transaksi, id_produk, quantity, harga, total)
          VALUES (?, ?, ?, ?, ?)
        `,
        [insertId, id_produk, quantity, harga, total],
      );
    }

    // const order_id = `MGCCTV-${insertId}`;
    const order_id = `MGCCTV-${insertId}-${Date.now()}`;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(total_harga),
      },
    };

    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;
    const redirect_url = transaction.redirect_url;

    await connection.execute(
      `
        UPDATE tr_transaksi
        SET url_bayar = ?, gateway_trx_id = ?
        WHERE id_transaksi = ?
      `,
      [redirect_url, token, insertId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Transaksi sandbox Midtrans berhasil dibuat",
      token,
      redirect_url,
      order_id,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error createMidtransTransaction:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Terjadi kesalahan saat memproses transaksi Midtrans",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const midtransWebhook = async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = req.body;

    console.log("Midtrans webhook payload:", {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
    });

    if (!order_id) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(500).json({
        success: false,
        message: "MIDTRANS_SERVER_KEY belum tersedia",
      });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("Midtrans webhook signature mismatch", {
        order_id,
        receivedSignature: signature_key,
        expectedSignature,
      });
      return res.status(403).json({
        success: false,
        message: "Signature Midtrans tidak valid",
      });
    }

    // const id_transaksi = order_id.replace("MGCCTV-", "");
    const id_transaksi = order_id.split("-")[1];
    const status_bayar = mapMidtransStatus(transaction_status, fraud_status);

    const syncResult = await syncTransactionInventory({
      idTransaksi: Number(id_transaksi),
      nextPaymentStatus: status_bayar,
    });

    console.log("Midtrans webhook updated transaction:", {
      id_transaksi,
      order_id,
      status_bayar,
      deducted_stock: syncResult.deductedStock,
      restored_stock: syncResult.restoredStock,
    });

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Error midtransWebhook:", error);
    return res.status(500).json({
      success: false,
      message: "Server error saat memproses webhook",
      error: error.message,
    });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const orderId = String(req.body.order_id || "").trim();
    const requestedStatus = String(req.body.status_bayar || "").trim().toLowerCase();
    const authUserId = Number(req.user?.id || req.user?.id_users || 0);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "order_id wajib diisi",
      });
    }

    if (requestedStatus !== "expired") {
      return res.status(400).json({
        success: false,
        message: "Status bayar yang diizinkan saat ini hanya expired",
      });
    }

    // const idTransaksi = Number(orderId.replace("MGCCTV-", ""));
    const idTransaksi = Number(orderId.split("-")[1]);

    if (!idTransaksi) {
      return res.status(400).json({
        success: false,
        message: "Format order_id tidak valid",
      });
    }

    const [transactionRows] = await db.execute(
      `
        SELECT id_transaksi, id_users, status_bayar
        FROM tr_transaksi
        WHERE id_transaksi = ?
        LIMIT 1
      `,
      [idTransaksi],
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    const transaction = transactionRows[0];

    if (Number(transaction.id_users) !== authUserId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke transaksi ini",
      });
    }

    if (transaction.status_bayar === "paid") {
      return res.status(409).json({
        success: false,
        message: "Transaksi yang sudah dibayar tidak bisa diubah menjadi expired",
      });
    }

    const syncResult = await syncTransactionInventory({
      idTransaksi,
      nextPaymentStatus: "expired",
    });

    return res.status(200).json({
      success: true,
      message: "Status bayar berhasil diperbarui menjadi expired",
      deducted_stock: syncResult.deductedStock,
      restored_stock: syncResult.restoredStock,
    });
  } catch (error) {
    console.error("Error updateTransactionStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui status transaksi",
      error: error.message,
    });
  }
};

module.exports = {
  createMidtransTransaction,
  midtransWebhook,
  updateTransactionStatus,
};
