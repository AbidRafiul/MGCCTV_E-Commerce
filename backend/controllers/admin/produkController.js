const produkModel = require("../../models/produkModel");

const handleProdukError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getAllProduk = async (req, res) => {
  try {
    const produk = await produkModel.getAllProduk();
    return res.status(200).json(produk);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil data produk");
  }
};

const getProdukById = async (req, res) => {
  try {
    const produk = await produkModel.getProdukById(req.params.id);
    return res.status(200).json(produk);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil produk");
  }
};

const addProduk = async (req, res) => {
  try {
    const result = await produkModel.addProduk({
      body: req.body,
      file: req.file,
    });

    return res.status(201).json(result);
  } catch (error) {
    return handleProdukError(res, error, "Gagal menambahkan produk");
  }
};

const updateProduk = async (req, res) => {
  try {
    const result = await produkModel.updateProduk({
      id: req.params.id,
      body: req.body,
      file: req.file,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleProdukError(res, error, "Gagal memperbarui produk");
  }
};

const deleteProduk = async (req, res) => {
  try {
    const result = await produkModel.deleteProduk(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return handleProdukError(res, error, "Gagal menghapus produk");
  }
};

const updateStatusProduk = async (req, res) => {
  try {
    const result = await produkModel.updateStatusProduk({
      id: req.params.id,
      statusProduk: req.body.status_produk,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleProdukError(res, error, "Gagal memperbarui status produk");
  }
};

const getProdukUnggulan = async (req, res) => {
  try {
    const produk = await produkModel.getProdukUnggulan();
    return res.status(200).json(produk);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil produk unggulan");
  }
};

const toggleUnggulan = async (req, res) => {
  try {
    const result = await produkModel.toggleUnggulan({
      id: req.params.id,
      isUnggulan: req.body.is_unggulan,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleProdukError(res, error, "Gagal memperbarui status unggulan");
  }
};

module.exports = {
  getAllProduk,
  getProdukById,
  addProduk,
  updateProduk,
  deleteProduk,
  updateStatusProduk,
  getProdukUnggulan,
  toggleUnggulan,
};
