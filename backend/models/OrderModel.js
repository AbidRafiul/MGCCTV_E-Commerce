const connection = require("../config/database");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const OrderModel = {
  getAll: async () => {
    const [rows] = await connection.query(
      `SELECT
        t.id_transaksi AS id_pesanan,
        t.tanggal_transaksi,
        t.created_at,
        t.updated_at,
        t.total_harga,
        t.metode_bayar,
        t.status_order,
        t.id_users,
        u.nama AS nama_pelanggan,
        u.alamat AS alamat_pelanggan,
        GROUP_CONCAT(
          CONCAT(p.nama_produk, ' (x', COALESCE(dt.quantity, 0), ')')
          ORDER BY dt.id_detail_transcation SEPARATOR ', '
        ) AS produk_ringkas,
        COALESCE(SUM(dt.quantity), 0) AS total_item
      FROM tr_transaksi t
      LEFT JOIN ms_users u ON u.id_users = t.id_users
      LEFT JOIN tr_detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
      LEFT JOIN ms_produk p ON p.id_produk = dt.id_produk
      GROUP BY
        t.id_transaksi,
        t.tanggal_transaksi,
        t.created_at,
        t.updated_at,
        t.total_harga,
        t.metode_bayar,
        t.status_order,
        t.id_users,
        u.nama,
        u.alamat
      ORDER BY t.tanggal_transaksi DESC`,
    );

    return rows;
  },

  getById: async (id) => {
    const [rows] = await connection.query(
      "SELECT id_transaksi, status_order FROM tr_transaksi WHERE id_transaksi = ? LIMIT 1",
      [id],
    );

    return rows;
  },

  updateStatus: async (id, statusOrder) => {
    const db = await connection.getConnection();

    try {
      await db.beginTransaction();

      const [orderRows] = await db.query(
        "SELECT id_transaksi, status_order FROM tr_transaksi WHERE id_transaksi = ? LIMIT 1 FOR UPDATE",
        [id],
      );

      if (orderRows.length === 0) {
        throw createHttpError(404, "Pesanan tidak ditemukan");
      }

      const currentStatus = orderRows[0].status_order;

      if (currentStatus === "selesai" && statusOrder !== "selesai") {
        throw createHttpError(
          400,
          "Pesanan yang sudah selesai tidak dapat diubah lagi agar stok tetap konsisten",
        );
      }

      await db.query(
        "UPDATE tr_transaksi SET status_order = ?, updated_at = NOW() WHERE id_transaksi = ?",
        [statusOrder, id],
      );

      await db.commit();
      return {
        id_transaksi: id,
        previous_status: currentStatus,
        current_status: statusOrder,
      };
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
    }
  },
};

module.exports = OrderModel;
