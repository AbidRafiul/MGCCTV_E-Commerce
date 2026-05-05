const ProdukModel = require("../../models/produkModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleProdukError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${filename}`;
  } catch (error) {
    return null;
  }
};

const uploadProductImage = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mgcctv_produk" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });

const normalizeStockInput = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsedValue));
};

const getAllProduk = async (req, res) => {
  try {
    const { search } = req.query; // 1. Tangkap kata kunci pencarian
    let produk = await ProdukModel.getAll();

    // 2. Jika ada query pencarian dari Navbar, filter datanya
    if (search) {
      const keyword = search.toLowerCase();
      produk = produk.filter(item => 
        item.nama_produk?.toLowerCase().includes(keyword) || 
        item.merek?.toLowerCase().includes(keyword)
      );
    }

    // 3. Kembalikan data (bentuknya tetap Array agar halaman Produk lain tidak error)
    return res.status(200).json(produk);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil data produk");
  }
};

const getProdukById = async (req, res) => {
  try {
    const produk = await ProdukModel.getById(req.params.id);

    if (produk.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    return res.status(200).json(produk[0]);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil produk");
  }
};

const addProduk = async (req, res) => {
  try {
    const {
      nama_produk,
      deskripsi_produk,
      harga_produk,
      stok,
      ms_kategori_id_kategori,
    } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await uploadProductImage(req.file);
      imageUrl = result.secure_url;
    }

    const insertResult = await ProdukModel.create({
      nama_produk,
      deskripsi_produk,
      imageUrl,
      harga_produk,
      stok: normalizeStockInput(stok),
      ms_kategori_id_kategori,
    });

    return res.status(201).json({
      message: "Produk dan gambar berhasil disimpan!",
      id_produk: insertResult.insertId,
      gambar_url: imageUrl,
    });
  } catch (error) {
    return handleProdukError(res, error, "Gagal menambahkan produk");
  }
};

const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_produk,
      deskripsi_produk,
      harga_produk,
      stok,
      ms_kategori_id_kategori,
    } = req.body;

    const oldProduct = await ProdukModel.getImageById(id);
    if (oldProduct.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    let imageUrl = oldProduct[0].gambar_produk;

    if (req.file) {
      if (imageUrl && imageUrl.includes("cloudinary")) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      const result = await uploadProductImage(req.file);
      imageUrl = result.secure_url;
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await ProdukModel.update(id, {
      nama_produk,
      deskripsi_produk,
      imageUrl,
      harga_produk,
      stok: normalizeStockInput(stok),
      ms_kategori_id_kategori,
      now,
    });

    return res.status(200).json({
      message: "Produk berhasil diperbarui!",
      gambar_url: imageUrl,
    });
  } catch (error) {
    return handleProdukError(res, error, "Gagal memperbarui produk");
  }
};

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await ProdukModel.getImageById(id);

    if (produk.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const imageUrl = produk[0].gambar_produk;

    if (imageUrl && imageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await ProdukModel.delete(id);

    return res.status(200).json({
      message: "Produk dan gambar berhasil dihapus!",
    });
  } catch (error) {
    return handleProdukError(res, error, "Gagal menghapus produk");
  }
};

const updateStatusProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_produk } = req.body;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await ProdukModel.updateStatus(id, status_produk, now);

    return res.status(200).json({
      message: "Status produk berhasil diperbarui!",
    });
  } catch (error) {
    return handleProdukError(res, error, "Gagal memperbarui status produk");
  }
};

const getProdukUnggulan = async (req, res) => {
  try {
    const results = await ProdukModel.getUnggulan();
    return res.status(200).json(results);
  } catch (error) {
    return handleProdukError(res, error, "Gagal mengambil produk unggulan");
  }
};

const toggleUnggulan = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_unggulan } = req.body;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await ProdukModel.toggleUnggulan(id, is_unggulan, now);

    return res.status(200).json({
      message: "Status unggulan berhasil diperbarui!",
    });
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
