const db = require("../../config/database");

const getUserId = (req) => Number(req.user?.id || req.user?.id_users || 0);

const ensureAdminOrSuperadmin = async (idUser) => {
  const [userData] = await db.query(
    "SELECT role FROM ms_users WHERE id_users = ? LIMIT 1",
    [idUser],
  );

  if (userData.length === 0) {
    const error = new Error("User tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const roleUser = String(userData[0].role || "").toLowerCase();

  if (roleUser !== "admin" && roleUser !== "superadmin") {
    const error = new Error("Akses ditolak. Hanya Admin atau Superadmin yang bisa mengelola pembelian.");
    error.statusCode = 403;
    throw error;
  }
};

const getListProduk = async (req, res) => {
  try {
    const [results] = await db.query(
      `
        SELECT id_produk, nama_produk, stok, harga_produk
        FROM ms_produk
        ORDER BY nama_produk ASC
      `,
    );
    
    return res.status(200).json(results);
  } catch (err) {
    console.error("Error getListProduk:", err.message);
    return res.status(500).json({ error: "Gagal mengambil daftar produk" });
  }
};

const getPembelianOptions = async (req, res) => {
  try {
    const idUser = getUserId(req);

    if (!idUser) {
      return res.status(401).json({ message: "User tidak valid." });
    }

    await ensureAdminOrSuperadmin(idUser);

    const [products, suppliers] = await Promise.all([
      db.query(
        `
          SELECT id_produk, nama_produk, stok, harga_produk
          FROM ms_produk
          ORDER BY nama_produk ASC
        `,
      ),
      db.query(
        `
          SELECT id_supplier, nama_supplier
          FROM ms_supplier
          ORDER BY nama_supplier ASC
        `,
      ),
    ]);

    return res.status(200).json({
      products: products[0],
      suppliers: suppliers[0],
    });
  } catch (error) {
    console.error("Error getPembelianOptions:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Gagal mengambil pilihan pembelian",
    });
  }
};

const getPembelianList = async (req, res) => {
  try {
    const idUser = getUserId(req);

    if (!idUser) {
      return res.status(401).json({ message: "User tidak valid." });
    }

    await ensureAdminOrSuperadmin(idUser);

    const [rows] = await db.query(
      `
        SELECT
          mp.id_pembelian,
          mp.no_faktur,
          mp.tanggal,
          mp.total,
          mp.created_at,
          s.nama_supplier,
          u.nama AS nama_admin,
          COUNT(tp.id_tr_pembelian) AS jumlah_item,
          COALESCE(SUM(tp.jumlah), 0) AS total_barang,
          GROUP_CONCAT(
            CONCAT(p.nama_produk, ' x', COALESCE(tp.jumlah, 0))
            ORDER BY tp.id_tr_pembelian SEPARATOR ', '
          ) AS item_ringkas
        FROM ms_pembelian mp
        INNER JOIN tr_pembelian tp ON tp.id_pembelian = mp.id_pembelian
        INNER JOIN ms_produk p ON p.id_produk = tp.id_produk
        INNER JOIN ms_supplier s ON s.id_supplier = mp.id_supplier
        INNER JOIN ms_users u ON u.id_users = mp.id_users
        GROUP BY
          mp.id_pembelian,
          mp.no_faktur,
          mp.tanggal,
          mp.total,
          mp.created_at,
          s.nama_supplier,
          u.nama
        ORDER BY COALESCE(mp.tanggal, DATE(mp.created_at)) DESC, mp.id_pembelian DESC
        LIMIT 200
      `,
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Error getPembelianList:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Gagal mengambil data pembelian",
    });
  }
};

const getPembelianDetail = async (req, res) => {
  try {
    const idUser = getUserId(req);
    const idPembelian = Number(req.params.id || 0);

    if (!idUser) {
      return res.status(401).json({ message: "User tidak valid." });
    }

    await ensureAdminOrSuperadmin(idUser);

    if (!idPembelian) {
      return res.status(400).json({ message: "ID pembelian tidak valid." });
    }

    const [headerRows] = await db.query(
      `
        SELECT
          mp.id_pembelian,
          mp.no_faktur,
          mp.tanggal,
          mp.total,
          s.nama_supplier,
          u.nama AS nama_admin
        FROM ms_pembelian mp
        INNER JOIN ms_supplier s ON s.id_supplier = mp.id_supplier
        INNER JOIN ms_users u ON u.id_users = mp.id_users
        WHERE mp.id_pembelian = ?
        LIMIT 1
      `,
      [idPembelian],
    );

    if (headerRows.length === 0) {
      return res.status(404).json({ message: "Pembelian tidak ditemukan." });
    }

    const [items] = await db.query(
      `
        SELECT
          tp.id_tr_pembelian,
          tp.id_produk,
          tp.jumlah,
          tp.harga_beli,
          tp.sub_total,
          p.nama_produk
        FROM tr_pembelian tp
        INNER JOIN ms_produk p ON p.id_produk = tp.id_produk
        WHERE tp.id_pembelian = ?
        ORDER BY tp.id_tr_pembelian ASC
      `,
      [idPembelian],
    );

    return res.status(200).json({
      data: {
        ...headerRows[0],
        items,
      },
    });
  } catch (error) {
    console.error("Error getPembelianDetail:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Gagal mengambil detail pembelian",
    });
  }
};

const createPembelian = async (req, res) => {
  const idUser = getUserId(req);
  const idSupplier = Number(req.body.id_supplier || 0);
  const rawItems = Array.isArray(req.body.items) && req.body.items.length > 0
    ? req.body.items
    : [{ id_produk: req.body.id_produk, jumlah: req.body.jumlah || req.body.qty_masuk, harga_beli: req.body.harga_beli }];
  const noFaktur = String(req.body.no_faktur || "").trim();
  const tanggal = String(req.body.tanggal || "").trim() || new Date().toISOString().slice(0, 10);
  let connection;

  try {
    if (!idUser) {
      return res.status(401).json({ message: "User tidak valid." });
    }

    await ensureAdminOrSuperadmin(idUser);

    if (!idSupplier) {
      return res.status(400).json({ message: "Supplier wajib dipilih." });
    }

    const items = rawItems.map((item) => ({
      idProduk: Number(item.id_produk || 0),
      jumlah: Number(item.jumlah || 0),
      hargaBeli: Number(item.harga_beli || 0),
    }));

    if (items.length === 0) {
      return res.status(400).json({ message: "Minimal satu barang pembelian wajib diisi." });
    }

    for (const item of items) {
      if (!item.idProduk) {
        return res.status(400).json({ message: "Semua baris barang wajib memilih produk." });
      }

      if (!Number.isInteger(item.jumlah) || item.jumlah <= 0) {
        return res.status(400).json({ message: "Jumlah pembelian harus berupa angka bulat lebih dari 0." });
      }

      if (!Number.isInteger(item.hargaBeli) || item.hargaBeli <= 0) {
        return res.status(400).json({ message: "Harga beli harus berupa angka bulat lebih dari 0." });
      }
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [supplier] = await connection.query(
      "SELECT id_supplier FROM ms_supplier WHERE id_supplier = ? LIMIT 1",
      [idSupplier],
    );

    if (supplier.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Supplier tidak ditemukan." });
    }

    const productIds = [...new Set(items.map((item) => item.idProduk))];
    const [products] = await connection.query(
      `SELECT id_produk, nama_produk FROM ms_produk WHERE id_produk IN (?)`,
      [productIds],
    );

    if (products.length !== productIds.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Ada produk yang tidak ditemukan." });
    }

    const generatedNoFaktur = noFaktur || `PB-${Date.now()}`;
    const [headerResult] = await connection.query(
      `
        INSERT INTO ms_pembelian (id_supplier, id_users, no_faktur, tanggal, total, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, NOW(), NOW())
      `,
      [idSupplier, idUser, generatedNoFaktur, tanggal],
    );

    const idPembelian = headerResult.insertId;
    const insertedItems = [];

    for (const item of items) {
      const [detailResult] = await connection.query(
        `
          INSERT INTO tr_pembelian (id_pembelian, id_produk, jumlah, harga_beli, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `,
        [idPembelian, item.idProduk, item.jumlah, item.hargaBeli],
      );
      const product = products.find((row) => Number(row.id_produk) === item.idProduk);
      insertedItems.push({
        id_tr_pembelian: detailResult.insertId,
        id_produk: item.idProduk,
        nama_produk: product?.nama_produk || "-",
        jumlah: item.jumlah,
        harga_beli: item.hargaBeli,
        sub_total: item.jumlah * item.hargaBeli,
      });
    }

    await connection.query(
      `
        UPDATE ms_pembelian
        SET total = (
          SELECT COALESCE(SUM(sub_total), 0)
          FROM tr_pembelian
          WHERE id_pembelian = ?
        ),
        updated_at = NOW()
        WHERE id_pembelian = ?
      `,
      [idPembelian, idPembelian],
    );

    await connection.commit();

    return res.status(201).json({
      message: "Pembelian barang berhasil disimpan.",
      data: {
        id_pembelian: idPembelian,
        no_faktur: generatedNoFaktur,
        total_item: insertedItems.length,
        total_barang: insertedItems.reduce((total, item) => total + item.jumlah, 0),
        total: insertedItems.reduce((total, item) => total + item.sub_total, 0),
        items: insertedItems,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error createPembelian:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Gagal menyimpan pembelian barang",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const deletePembelian = async (req, res) => {
  const idUser = getUserId(req);
  const idPembelian = Number(req.params.id || 0);
  let connection;

  try {
    if (!idUser) {
      return res.status(401).json({ message: "User tidak valid." });
    }

    await ensureAdminOrSuperadmin(idUser);

    if (!idPembelian) {
      return res.status(400).json({ message: "ID pembelian tidak valid." });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [headerRows] = await connection.query(
      "SELECT id_pembelian, no_faktur FROM ms_pembelian WHERE id_pembelian = ? LIMIT 1",
      [idPembelian],
    );

    if (headerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Pembelian tidak ditemukan." });
    }

    await connection.query("DELETE FROM tr_pembelian WHERE id_pembelian = ?", [idPembelian]);
    await connection.query("DELETE FROM ms_pembelian WHERE id_pembelian = ?", [idPembelian]);

    await connection.commit();

    return res.status(200).json({
      message: "Pembelian berhasil dihapus.",
      data: headerRows[0],
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error deletePembelian:", error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Gagal menghapus pembelian",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const tambahStok = async (req, res) => {
  return res.status(410).json({
    message: "Endpoint tambah stok lama sudah tidak digunakan. Silakan simpan pembelian melalui POST /api/pembelian.",
  });
};

module.exports = {
  getListProduk,
  getPembelianOptions,
  getPembelianList,
  getPembelianDetail,
  createPembelian,
  deletePembelian,
  tambahStok,
};
