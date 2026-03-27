const connection = require("../../config/database");

const getSemuaKategori = async (req, res) => {
  try {
    const [kategori] = await connection.query("SELECT id_kategori, nama_kategori FROM ms_kategori ORDER BY nama_kategori ASC");
    res.status(200).json(kategori);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kategori", error: error.message });
  }
};

module.exports = { getSemuaKategori };