const connection = require("../../config/database");

const getKategoriName = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getAllKategori = async (req, res) => {
  try {
    const sql = `
      SELECT 
        id_kategori,
        nama_kategori
      FROM ms_kategori
      ORDER BY nama_kategori ASC
    `;
    const [kategori] = await connection.query(sql);
    res.status(200).json(kategori);
  } catch (error) {
    console.error("Error GetKategori:", error);
    res.status(500).json({ message: "Gagal mengambil data kategori", error: error.message });
  }
};

const addKategori = async (req, res) => {
  try {
    const namaKategori = getKategoriName(req.body?.nama_kategori);

    if (!namaKategori) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const [existingKategori] = await connection.query(
      "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) LIMIT 1",
      [namaKategori],
    );

    if (existingKategori.length > 0) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const [result] = await connection.query(
      "INSERT INTO ms_kategori (nama_kategori) VALUES (?)",
      [namaKategori],
    );

    const [newKategori] = await connection.query(
      "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ?",
      [result.insertId],
    );

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      kategori: newKategori[0],
    });
  } catch (error) {
    console.error("Error AddKategori:", error);
    return res.status(500).json({ message: "Gagal menambahkan kategori", error: error.message });
  }
};

const updateKategori = async (req, res) => {
  try {
    const kategoriId = Number(req.params.id);
    const namaKategori = getKategoriName(req.body?.nama_kategori);

    if (!kategoriId) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    if (!namaKategori) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const [existingKategori] = await connection.query(
      "SELECT id_kategori FROM ms_kategori WHERE id_kategori = ? LIMIT 1",
      [kategoriId],
    );

    if (existingKategori.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    const [duplicateKategori] = await connection.query(
      "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) AND id_kategori != ? LIMIT 1",
      [namaKategori, kategoriId],
    );

    if (duplicateKategori.length > 0) {
      return res.status(400).json({ message: "Nama kategori sudah digunakan" });
    }

    await connection.query(
      "UPDATE ms_kategori SET nama_kategori = ? WHERE id_kategori = ?",
      [namaKategori, kategoriId],
    );

    const [updatedKategori] = await connection.query(
      "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ?",
      [kategoriId],
    );

    return res.status(200).json({
      message: "Kategori berhasil diperbarui",
      kategori: updatedKategori[0],
    });
  } catch (error) {
    console.error("Error UpdateKategori:", error);
    return res.status(500).json({ message: "Gagal memperbarui kategori", error: error.message });
  }
};

const deleteKategori = async (req, res) => {
  try {
    const kategoriId = Number(req.params.id);

    if (!kategoriId) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    const [existingKategori] = await connection.query(
      "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ? LIMIT 1",
      [kategoriId],
    );

    if (existingKategori.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    const [usedByProduk] = await connection.query(
      "SELECT id_produk FROM ms_produk WHERE ms_kategori_id_kategori = ? LIMIT 1",
      [kategoriId],
    );

    if (usedByProduk.length > 0) {
      return res.status(400).json({
        message: "Kategori tidak bisa dihapus karena masih digunakan oleh produk",
      });
    }

    await connection.query("DELETE FROM ms_kategori WHERE id_kategori = ?", [kategoriId]);

    return res.status(200).json({
      message: `Kategori "${existingKategori[0].nama_kategori}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error DeleteKategori:", error);
    return res.status(500).json({ message: "Gagal menghapus kategori", error: error.message });
  }
};

module.exports = { getAllKategori, addKategori, updateKategori, deleteKategori };
