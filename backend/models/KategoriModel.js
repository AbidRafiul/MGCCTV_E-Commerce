const connection = require("../config/database");

const KategoriModel = {
  // 1. Ambil semua kategori
  getAll: async () => {
    const sql = `
      SELECT id_kategori, nama_kategori
      FROM ms_kategori
      ORDER BY nama_kategori ASC
    `;
    const [rows] = await connection.query(sql);
    return rows;
  },

  // 2. Cari kategori berdasarkan nama (Case Insensitive)
  findByName: async (namaKategori) => {
    const [rows] = await connection.query(
      "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) LIMIT 1",
      [namaKategori]
    );
    return rows;
  },

  // 3. Cari kategori berdasarkan ID
  findById: async (id) => {
    const [rows] = await connection.query(
      "SELECT id_kategori, nama_kategori FROM ms_kategori WHERE id_kategori = ? LIMIT 1",
      [id]
    );
    return rows;
  },

  // 4. Tambah kategori baru
  create: async (namaKategori) => {
    const [result] = await connection.query(
      "INSERT INTO ms_kategori (nama_kategori) VALUES (?)",
      [namaKategori]
    );
    return result;
  },

  // 5. Cek apakah ada nama kategori duplikat (saat Edit)
  findDuplicateName: async (namaKategori, id) => {
    const [rows] = await connection.query(
      "SELECT id_kategori FROM ms_kategori WHERE LOWER(nama_kategori) = LOWER(?) AND id_kategori != ? LIMIT 1",
      [namaKategori, id]
    );
    return rows;
  },

  // 6. Update nama kategori
  update: async (id, namaKategori) => {
    const [result] = await connection.query(
      "UPDATE ms_kategori SET nama_kategori = ? WHERE id_kategori = ?",
      [namaKategori, id]
    );
    return result;
  },

  // 7. Cek apakah kategori sedang dipakai di tabel ms_produk
  checkIfUsedByProduk: async (id) => {
    const [rows] = await connection.query(
      "SELECT id_produk FROM ms_produk WHERE ms_kategori_id_kategori = ? LIMIT 1",
      [id]
    );
    return rows;
  },

  // 8. Hapus kategori
  delete: async (id) => {
    const [result] = await connection.query("DELETE FROM ms_kategori WHERE id_kategori = ?", [id]);
    return result;
  }
};

module.exports = KategoriModel;