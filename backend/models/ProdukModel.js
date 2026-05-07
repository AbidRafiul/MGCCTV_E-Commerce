const connection = require("../config/database");

const ProdukModel = {
  // 1. Ambil semua produk
  getAll: async () => {
    const query = `
      SELECT
        p.*,
        k.nama_kategori AS merek,
        (
          SELECT MAX(mp.tanggal)
          FROM tr_pembelian tp
          INNER JOIN ms_pembelian mp ON mp.id_pembelian = tp.id_pembelian
          WHERE tp.id_produk = p.id_produk
        ) AS tanggal_masuk_terakhir
      FROM ms_produk p
      LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
      ORDER BY p.created_at DESC
    `;
    const [rows] = await connection.query(query);
    return rows;
  },

  // 2. Tambah produk baru
  create: async (data) => {
    const { nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori } = data;
    const query = `
      INSERT INTO ms_produk 
      (nama_produk, deskripsi_produk, gambar_produk, harga_produk, stok, status_produk, ms_kategori_id_kategori, created_at) 
      VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
    `;
    const values = [nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori];
    const [result] = await connection.query(query, values);
    return result;
  },

  // 3. Ambil detail satu produk beserta nama kategorinya
  getById: async (id) => {
    const query = `
      SELECT p.*, k.nama_kategori AS merek, k.nama_kategori AS nama_kategori
      FROM ms_produk p
      LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori
      WHERE p.id_produk = ?
    `;
    const [rows] = await connection.query(query, [id]);
    return rows;
  },

  // 4. Ambil URL gambar saja (Digunakan sebelum Update/Delete gambar Cloudinary)
  getImageById: async (id) => {
    const [rows] = await connection.query("SELECT gambar_produk FROM ms_produk WHERE id_produk = ?", [id]);
    return rows;
  },

  // 5. Update data produk
  update: async (id, data) => {
    const { nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori, now } = data;
    const query = `
      UPDATE ms_produk 
      SET nama_produk=?, deskripsi_produk=?, gambar_produk=?, harga_produk=?, stok=?, ms_kategori_id_kategori=?, updated_at=? 
      WHERE id_produk=?
    `;
    const values = [nama_produk, deskripsi_produk, imageUrl, harga_produk, stok, ms_kategori_id_kategori, now, id];
    const [result] = await connection.query(query, values);
    return result;
  },

  // 6. Hapus produk
  delete: async (id) => {
    const [result] = await connection.query("DELETE FROM ms_produk WHERE id_produk = ?", [id]);
    return result;
  },

  // 7. Ubah status produk (Aktif/Nonaktif)
  updateStatus: async (id, status_produk, now) => {
    const [result] = await connection.query(
      "UPDATE ms_produk SET status_produk = ?, updated_at = ? WHERE id_produk = ?",
      [status_produk, now, id]
    );
    return result;
  },

  // 8. Ambil produk unggulan
  getUnggulan: async () => {
    const query = `
      SELECT p.*, k.nama_kategori AS merek 
      FROM ms_produk p
      LEFT JOIN ms_kategori k ON p.ms_kategori_id_kategori = k.id_kategori 
      WHERE p.is_unggulan = 1 
      ORDER BY p.updated_at DESC
      LIMIT 6
    `; 
    const [rows] = await connection.query(query);
    return rows;
  },

  // 9. Ubah status unggulan
  toggleUnggulan: async (id, is_unggulan, now) => {
    const [result] = await connection.query(
      "UPDATE ms_produk SET is_unggulan = ?, updated_at = ? WHERE id_produk = ?",
      [is_unggulan, now, id]
    );
    return result;
  }
};

module.exports = ProdukModel;
