const db = require("../../config/database");

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

const tambahStok = async (req, res) => {
  const idUser = Number(req.user?.id || req.user?.id_users || 0);
  const idProduk = Number(req.body.id_produk || 0);
  const qtyMasuk = Number(req.body.qty_masuk || req.body.jumlah_masuk || 0);
  let connection;

  try {
    if (!idUser) {
      return res.status(401).json({ error: "User tidak valid." });
    }

    // 2. KUNCI OTOMATISNYA: Panggil NOW() langsung di dalam query SQL 👇
   await db.query(
      "INSERT INTO tr_stok_masuk (id_produk, id_users, qty_masuk) VALUES (?, ?, ?)",
      [id_produk, id_user, jumlah_masuk]
    );

    if (userData.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    const roleUser = String(userData[0].role || "").toLowerCase();

    if (roleUser !== "admin" && roleUser !== "superadmin") {
      return res.status(403).json({
        error: "Akses ditolak. Hanya Admin atau Superadmin yang bisa menambah stok.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [productRows] = await connection.query(
      `
        SELECT id_produk, nama_produk, stok
        FROM ms_produk
        WHERE id_produk = ?
        LIMIT 1
        FOR UPDATE
      `,
      [idProduk],
    );

    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    const stokSebelum = Number(productRows[0].stok || 0);

    const [insertResult] = await connection.query(
      `
        INSERT INTO tr_stok_masuk (id_produk, id_users, qty_masuk, tanggal_masuk)
        VALUES (?, ?, ?, NOW())
      `,
      [idProduk, idUser, qtyMasuk],
    );

    await connection.query(
      `
        UPDATE ms_produk
        SET stok = stok + ?, updated_at = NOW()
        WHERE id_produk = ?
      `,
      [qtyMasuk, idProduk],
    );

    await connection.commit();

    return res.status(200).json({
      message: "Stok masuk berhasil disimpan.",
      data: {
        id_stok_masuk: insertResult.insertId,
        id_produk: idProduk,
        nama_produk: productRows[0].nama_produk,
        qty_masuk: qtyMasuk,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSebelum + qtyMasuk,
      },
    });
  } catch (error) {
    console.error(" Terjadi Error:", error.message);
    return res.status(500).json({ error: "Gagal memproses restock", detail: error.message });
  }
};

module.exports = { getListProduk, tambahStok };
