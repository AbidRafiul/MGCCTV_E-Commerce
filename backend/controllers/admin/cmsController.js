const cmsModel = require("../../models/cmsModel");

const handleCmsError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getTentangContent = async (req, res) => {
  try {
    const content = await cmsModel.getTentangContent();
    return res.status(200).json(content);
  } catch (error) {
    return handleCmsError(res, error, "Gagal mengambil konten CMS");
  }
};

const getGallery = async (req, res) => {
  try {
    const gallery = await cmsModel.getGallery();
    return res.status(200).json(gallery);
  } catch (error) {
    return handleCmsError(res, error, "Gagal mengambil galeri CMS");
  }
};

const updateTentangContent = async (req, res) => {
  try {
    const updatedContent = await cmsModel.updateTentangContent({
      id: req.params.id,
      sectionName: req.body.section_name,
      contentValue: req.body.content_value,
      urlGambar: req.body.url_gambar,
      file: req.file,
    });

    return res.status(200).json({
      message: "Konten CMS berhasil diperbarui",
      data: updatedContent,
    });
  } catch (error) {
    return handleCmsError(res, error, "Gagal memperbarui konten CMS");
  }
};

const addGallery = async (req, res) => {
  try {
    const galleryItem = await cmsModel.addGallery({
      sectionName: req.body.section_name,
      file: req.file,
    });

    return res.status(201).json({
      message: "Foto galeri berhasil ditambahkan",
      data: galleryItem,
    });
  } catch (error) {
    return handleCmsError(res, error, "Gagal menambahkan foto galeri");
  }
};

const deleteGallery = async (req, res) => {
  try {
    await cmsModel.deleteGallery(req.params.id);
    return res.status(200).json({
      message: "Foto galeri berhasil dihapus",
    });
  } catch (error) {
    return handleCmsError(res, error, "Gagal menghapus foto galeri");
  }
};

module.exports = {
  getTentangContent,
  getGallery,
  updateTentangContent,
  addGallery,
  deleteGallery,
};
