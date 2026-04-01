const kategoriModel = require("../../models/kategoriModel");

const handleKategoriError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getAllKategori = async (req, res) => {
  try {
    const kategori = await kategoriModel.getAllKategori(req.query);
    return res.status(200).json(kategori);
  } catch (error) {
    return handleKategoriError(res, error, "Gagal mengambil data kategori");
  }
};

const addKategori = async (req, res) => {
  try {
    const kategori = await kategoriModel.addKategori(req.body);
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
    const kategori = await kategoriModel.updateKategori({
      id: req.params.id,
      body: req.body,
    });

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
    const result = await kategoriModel.deleteKategori(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleKategoriError(res, error, "Gagal menghapus kategori");
  }
};

module.exports = {
  getAllKategori,
  addKategori,
  updateKategori,
  deleteKategori,
};
