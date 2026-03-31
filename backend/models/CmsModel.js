const connection = require("../config/database");

const CmsModel = {
  // ==========================================
  // GALERI TENTANG KAMI (tr_cms_galleries)
  // ==========================================
  
  getAllGalleries: async () => {
    const [rows] = await connection.query("SELECT * FROM tr_cms_galleries ORDER BY created_at DESC");
    return rows;
  },

  insertGallery: async (section_name, url_gambar) => {
    const query = `INSERT INTO tr_cms_galleries (section_name, url_gambar, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    const [result] = await connection.query(query, [section_name || 'Galeri', url_gambar]);
    return result;
  },

  getGalleryImageUrl: async (id) => {
    const [rows] = await connection.query("SELECT url_gambar FROM tr_cms_galleries WHERE id_cms_konten = ?", [id]);
    return rows;
  },

  deleteGalleryById: async (id) => {
    const [result] = await connection.query("DELETE FROM tr_cms_galleries WHERE id_cms_konten = ?", [id]);
    return result;
  },

  // ==========================================
  // KONTEN TENTANG KAMI (tr_cms_konten)
  // ==========================================

  getAllTentangContent: async () => {
    const [rows] = await connection.query("SELECT * FROM tr_cms_konten");
    return rows;
  },

  checkTentangContentExists: async (id) => {
    const [rows] = await connection.query("SELECT id_cms_konten FROM tr_cms_konten WHERE id_cms_konten = ?", [id]);
    return rows;
  },

  insertTentangContent: async (id, section_name, content_value, url_gambar) => {
    const query = `INSERT INTO tr_cms_konten (id_cms_konten, section_name, content_value, url_gambar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const [result] = await connection.query(query, [id, section_name, content_value, url_gambar]);
    return result;
  },

  updateTentangContentWithImage: async (id, section_name, content_value, url_gambar) => {
    const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ?, url_gambar = ?, updated_at = NOW() WHERE id_cms_konten = ?`;
    const [result] = await connection.query(query, [section_name, content_value, url_gambar, id]);
    return result;
  },

  updateTentangContentWithoutImage: async (id, section_name, content_value) => {
    const query = `UPDATE tr_cms_konten SET section_name = ?, content_value = ?, updated_at = NOW() WHERE id_cms_konten = ?`;
    const [result] = await connection.query(query, [section_name, content_value, id]);
    return result;
  }
};

module.exports = CmsModel;