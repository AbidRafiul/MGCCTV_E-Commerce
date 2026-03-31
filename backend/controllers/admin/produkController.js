const ProdukModel = require("../../models/ProdukModel");
const cloudinary = require("cloudinary").v2;

// ==========================================
// 1. KONFIGURASI CLOUDINARY
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// ==========================================
// 2. FUNGSI GET (Ambil Semua Produk)
// ==========================================
const getAllProduk = async (req, res) => {
  try {
    const produk = await ProdukModel.getAll();
    res.status(200).json(produk);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data produk", error: error.message });
  }
};

// ==========================================
// 3. FUNGSI POST (Tambah Produk & Upload Gambar)
// ==========================================
const addProduk = async (req, res) => {
  try {
    const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mgcctv_produk" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    // Panggil model untuk Insert Database
    const insertResult = await ProdukModel.create({
      nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori
    });

    res.status(201).json({
      message: "Produk dan gambar berhasil disimpan!",
      id_produk: insertResult.insertId,
      gambar_url: imageUrl
    });

  } catch (error) {
    console.error("Error Add Produk:", error);
    res.status(500).json({ message: "Gagal menambahkan produk", error: error.message });
  }
};

// ==========================================
// 4. FUNGSI GET 1 PRODUK (Untuk mengisi form Edit)
// ==========================================
const getProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await ProdukModel.getById(id);
    
    if (produk.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    res.status(200).json(produk[0]);
  } catch (error) {
    console.error("Error GetProdukById:", error);
    res.status(500).json({ message: "Gagal mengambil produk", error: error.message });
  }
};

// ==========================================
// 5. FUNGSI PUT (Edit Produk & Ganti Gambar)
// ==========================================
const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, deskripsi_produk, harga_produk, stok, ms_kategori_id_kategori } = req.body;
    
    const oldProduct = await ProdukModel.getImageById(id);
    if (oldProduct.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });

    let imageUrl = oldProduct[0].gambar_produk;

    if (req.file) {
      if (imageUrl && imageUrl.includes("cloudinary")) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mgcctv_produk" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      const result = await uploadPromise;
      imageUrl = result.secure_url;
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await ProdukModel.update(id, {
      nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori, now
    });

    res.status(200).json({ message: "Produk berhasil diperbarui!", gambar_url: imageUrl });
  } catch (error) {
    console.error("Error Update Produk:", error);
    res.status(500).json({ message: "Gagal memperbarui produk", error: error.message });
  }
};

// ==========================================
// 6. FUNGSI DELETE (Hapus Produk & Gambar Cloudinary)
// ==========================================
const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const produk = await ProdukModel.getImageById(id);
    if (produk.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const imageUrl = produk[0].gambar_produk;

    if (imageUrl && imageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    await ProdukModel.delete(id);

    res.status(200).json({ message: "Produk dan gambar berhasil dihapus!" });
  } catch (error) {
    console.error("Error Delete Produk:", error);
    res.status(500).json({ message: "Gagal menghapus produk", error: error.message });
  }
};

// ==========================================
// 7. FUNGSI PATCH (Update Status Saja)
// ==========================================
const updateStatusProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_produk } = req.body; 
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await ProdukModel.updateStatus(id, status_produk, now);

    res.status(200).json({ message: "Status produk berhasil diperbarui!" });
  } catch (error) {
    console.error("Error Update Status:", error);
    res.status(500).json({ message: "Gagal memperbarui status", error: error.message });
  }
};

// ==========================================
// 8. FUNGSI GET (Mengambil Produk Unggulan)
// ==========================================
const getProdukUnggulan = async (req, res) => {
  try {
    const results = await ProdukModel.getUnggulan();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil produk unggulan", error: error.message });
  }
};

// ==========================================
// 9. FUNGSI PATCH (Mengubah Status Unggulan)
// ==========================================
const toggleUnggulan = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_unggulan } = req.body; 
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await ProdukModel.toggleUnggulan(id, is_unggulan, now);

    res.status(200).json({ message: "Status unggulan berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui status unggulan", error: error.message });
  }
};

// Export semua fungsi
module.exports = { 
  getAllProduk, 
  addProduk, 
  getProdukById, 
  updateProduk, 
  deleteProduk, 
  updateStatusProduk,
  getProdukUnggulan,
  toggleUnggulan
};