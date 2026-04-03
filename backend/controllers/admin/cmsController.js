const cmsModel = require("../../models/CmsModel");

const handleCmsError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

// ==========================================
// 1. GALERI TENTANG KAMI (tr_cms_galleries)
// ==========================================
const getGallery = async (req, res) => {
  try {
    const results = await CmsModel.getAllGalleries();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error server", error: err.message });
  }
};

const addGallery = async (req, res) => {
  const { section_name } = req.body; 

  if (!req.file) {
    return res.status(400).json({ message: "Gambar wajib diupload!" });
  }

  try {
    // 1. Upload ke Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'CMS_Galeri');
    const url_gambar = result.secure_url;

    // 2. Simpan ke Database
    const dbResult = await CmsModel.insertGallery(section_name, url_gambar);
    
    res.status(201).json({ message: "Galeri berhasil ditambahkan", id: dbResult.insertId, url_gambar });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan galeri", error: error.message });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cari URL gambar di database
    const results = await CmsModel.getGalleryImageUrl(id);
    if (results.length === 0) return res.status(404).json({ message: "Galeri tidak ditemukan" });

    const imageUrl = results[0].url_gambar;
    
    // 2. Hapus dari Cloudinary
    if (imageUrl && imageUrl.includes("cloudinary")) {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.pop().split('.')[0]; 
      const folderPath = `MGCCTV/CMS_Galeri/${fileName}`;
      
      // Abaikan error jika foto di cloudinary sudah terhapus manual
      try {
         await cloudinary.uploader.destroy(folderPath);
      } catch(err) {
         console.log("Gambar Cloudinary tidak ditemukan, lanjut hapus di DB.");
      }
    }

    // 3. Hapus dari database
    await CmsModel.deleteGalleryById(id);
    res.json({ message: "Foto galeri berhasil dihapus!" });

  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus galeri", error: error.message });
  }
};

// ==========================================
// 2. KONTEN TENTANG KAMI (tr_cms_konten)
// ==========================================
const getTentangContent = async (req, res) => {
  try {
    const results = await CmsModel.getAllTentangContent();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error server", error: err.message });
  }
};

const updateTentangContent = async (req, res) => {
  const { id } = req.params;
  const { section_name, content_value } = req.body;
  
  try {
    let url_gambar = req.body.url_gambar || null; 

    // Jika admin mengupload gambar baru
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'CMS_Tentang');
      url_gambar = result.secure_url;
    }

    // Cek apakah ID sudah ada di database
    const check = await CmsModel.checkTentangContentExists(id);
    
    if (check.length === 0) {
       // JIKA BELUM ADA (INSERT)
       await CmsModel.insertTentangContent(id, section_name, content_value, url_gambar);
    } else {
       // JIKA SUDAH ADA (UPDATE)
       if (url_gambar) {
         await CmsModel.updateTentangContentWithImage(id, section_name, content_value, url_gambar);
       } else {
         await CmsModel.updateTentangContentWithoutImage(id, section_name, content_value);
       }
    }
    
    res.json({ message: "Konten Tentang Kami berhasil diupdate!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal update konten", error: error.message });
  }
};

module.exports = {
  getGallery,
  addGallery,
  deleteGallery,
  getTentangContent,
  updateTentangContent
};
