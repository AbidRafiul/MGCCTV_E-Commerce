const KategoriModel = require("../../models/KategoriModel");

// Helper: Membersihkan input string
const getKategoriName = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const getAllKategori = async (req, res) => {
  try {
    const kategori = await KategoriModel.getAll();
    res.status(200).json(kategori);
  } catch (error) {
    return handleKategoriError(res, error, "Gagal mengambil data kategori");
  }
};

const addKategori = async (req, res) => {
  try {
    const namaKategori = getKategoriName(req.body?.nama_kategori);

    if (!namaKategori) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const existingKategori = await KategoriModel.findByName(namaKategori);
    if (existingKategori.length > 0) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const result = await KategoriModel.create(namaKategori);
    const newKategori = await KategoriModel.findById(result.insertId);

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      kategori,
    });
  } catch (error) {
    return handleKategoriError(res, error, "Gagal menambahkan kategori");
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

    const existingKategori = await KategoriModel.findById(kategoriId);
    if (existingKategori.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    const duplicateKategori = await KategoriModel.findDuplicateName(namaKategori, kategoriId);
    if (duplicateKategori.length > 0) {
      return res.status(400).json({ message: "Nama kategori sudah digunakan" });
    }

    await KategoriModel.update(kategoriId, namaKategori);
    const updatedKategori = await KategoriModel.findById(kategoriId);

    return res.status(200).json({
      message: "Kategori berhasil diperbarui",
      kategori,
    });
  } catch (error) {
    return handleKategoriError(res, error, "Gagal memperbarui kategori");
  }
};

const deleteKategori = async (req, res) => {
  try {
    const kategoriId = Number(req.params.id);

    if (!kategoriId) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    const existingKategori = await KategoriModel.findById(kategoriId);
    if (existingKategori.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    const usedByProduk = await KategoriModel.checkIfUsedByProduk(kategoriId);
    if (usedByProduk.length > 0) {
      return res.status(400).json({
        message: "Kategori tidak bisa dihapus karena masih digunakan oleh produk",
      });
    }

    await KategoriModel.delete(kategoriId);

    return res.status(200).json({
      message: `Kategori "${existingKategori[0].nama_kategori}" berhasil dihapus`,
    });
  } catch (error) {
    return handleKategoriError(res, error, "Gagal menghapus kategori");
  }
};

module.exports = { getAllKategori, addKategori, updateKategori, deleteKategori };
