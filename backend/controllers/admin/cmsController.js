const cmsModel = require("../../models/CmsModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleCmsError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const uploadCmsImage = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `MGCCTV/${folder}` },
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

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary")) return null;

  try {
    const uploadMarker = "/upload/";
    const uploadIndex = url.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const pathAfterUpload = url.slice(uploadIndex + uploadMarker.length);
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    const publicId = pathWithoutVersion.replace(/\.[^.]+$/, "");

    return publicId || null;
  } catch (error) {
    return null;
  }
};

// ==========================================
// 1. GALERI TENTANG KAMI (tr_cms_galleries)
// ==========================================
const getGallery = async (req, res) => {
  try {
    const results = await cmsModel.getAllGalleries();
    return res.json(results);
  } catch (error) {
    return handleCmsError(res, error, "Gagal mengambil galeri");
  }
};

const addGallery = async (req, res) => {
  const { section_name } = req.body; 

  if (!req.file) {
    return res.status(400).json({ message: "Gambar wajib diupload!" });
  }

  try {
    const result = await uploadCmsImage(req.file, "CMS_Galeri");
    const url_gambar = result.secure_url;

    const dbResult = await cmsModel.insertGallery(section_name, url_gambar);
    
    return res.status(201).json({
      message: "Galeri berhasil ditambahkan",
      id: dbResult.insertId,
      url_gambar,
    });
  } catch (error) {
    return handleCmsError(res, error, "Gagal menyimpan galeri");
  }
};

const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await cmsModel.getGalleryImageUrl(id);
    if (results.length === 0) return res.status(404).json({ message: "Galeri tidak ditemukan" });

    const imageUrl = results[0].url_gambar;
    
    if (imageUrl && imageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(imageUrl);
      
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log("Gambar Cloudinary tidak ditemukan, lanjut hapus di DB.");
        }
      }
    }

    await cmsModel.deleteGalleryById(id);
    return res.json({ message: "Foto galeri berhasil dihapus!" });
  } catch (error) {
    return handleCmsError(res, error, "Gagal menghapus galeri");
  }
};

// ==========================================
// 2. KONTEN TENTANG KAMI (tr_cms_konten)
// ==========================================
const getTentangContent = async (req, res) => {
  try {
    const results = await cmsModel.getAllTentangContent();
    return res.json(results);
  } catch (error) {
    return handleCmsError(res, error, "Gagal mengambil konten CMS");
  }
};

const updateTentangContent = async (req, res) => {
  const { id } = req.params;
  const { section_name, content_value } = req.body;
  
  try {
    let url_gambar = req.body.url_gambar || null; 

    if (req.file) {
      const result = await uploadCmsImage(req.file, "CMS_Tentang");
      url_gambar = result.secure_url;
    }

    const check = await cmsModel.checkTentangContentExists(id);
    
    if (check.length === 0) {
       await cmsModel.insertTentangContent(id, section_name, content_value, url_gambar);
    } else {
       if (url_gambar) {
         await cmsModel.updateTentangContentWithImage(id, section_name, content_value, url_gambar);
       } else {
         await cmsModel.updateTentangContentWithoutImage(id, section_name, content_value);
       }
    }
    
    return res.json({ message: "Konten Tentang Kami berhasil diupdate!" });
  } catch (error) {
    return handleCmsError(res, error, "Gagal update konten");
  }
};

module.exports = {
  getGallery,
  addGallery,
  deleteGallery,
  getTentangContent,
  updateTentangContent
};
