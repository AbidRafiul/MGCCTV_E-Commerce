const connection = require("../config/database");

const UserOrderHistoryModel = {
  getByUserId: async (userId) => {
    const [rows] = await connection.query(
      `SELECT
        t.id_transaksi,
        t.tanggal_transaksi,
        t.total_harga,
        t.metode_bayar,
        t.status_order,
        t.status_bayar,
        dt.id_detail_transcation,
        dt.id_produk,
        dt.quantity,
        dt.harga,
        dt.total,
        p.nama_produk,
        p.gambar_produk,
        k.nama_kategori AS kategori,
        k.nama_kategori AS merek
      FROM tr_transaksi t
      LEFT JOIN tr_detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
      LEFT JOIN ms_produk p ON p.id_produk = dt.id_produk
      LEFT JOIN ms_kategori k ON k.id_kategori = p.ms_kategori_id_kategori
      WHERE t.id_users = ?
      ORDER BY t.tanggal_transaksi DESC, dt.id_detail_transcation ASC`,
      [userId],
    );

    return rows;
  },
};

module.exports = UserOrderHistoryModel;
