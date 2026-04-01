const connection = require("../config/database");

// Helper agar kalau query gagal, tidak membuat seluruh dashboard crash
const safeQuery = async (query, fallback = []) => {
  try {
    const [rows] = await connection.query(query);
    return rows;
  } catch (error) {
    console.error("Dashboard DB Error:", error.message);
    return fallback;
  }
};

const DashboardModel = {
  getTotalPendapatan: () => safeQuery(
    `SELECT COALESCE(SUM(total_harga), 0) AS total FROM tr_transaksi WHERE status_order = 'paid'`, 
    [{ total: 0 }]
  ),
  
  getTotalPesanan: () => safeQuery(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status_order = 'pending' THEN 1 ELSE 0 END) AS menunggu FROM tr_transaksi`, 
    [{ total: 0, menunggu: 0 }]
  ),
  
  getProdukAktif: () => safeQuery(
    `SELECT COUNT(*) AS total FROM ms_produk WHERE status_produk = 1`, 
    [{ total: 0 }]
  ),
  
  getStokHampirHabis: () => safeQuery(
    `SELECT COUNT(*) AS hampir_habis FROM ms_produk WHERE status_produk = 1 AND stok <= 5`, 
    [{ hampir_habis: 0 }]
  ),
  
  getTotalPelanggan: () => safeQuery(
    `SELECT COUNT(*) AS total FROM ms_users WHERE LOWER(role) IN ('kustomer', 'pelanggan')`, 
    [{ total: 0 }]
  ),
  
  getPendapatanHarian: () => safeQuery(
    `SELECT DATE(created_at) AS tanggal, COALESCE(SUM(total_harga), 0) AS total 
     FROM tr_transaksi WHERE status_order = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 DAY) 
     GROUP BY DATE(created_at) ORDER BY tanggal DESC LIMIT 5`
  ),
  
  getKategoriTerlaris: () => safeQuery(
    `SELECT k.nama_kategori, COALESCE(SUM(dt.quantity), 0) AS total_terjual 
     FROM ms_kategori k 
     LEFT JOIN ms_produk p ON p.ms_kategori_id_kategori = k.id_kategori 
     LEFT JOIN ms_detail_transaction dt ON dt.id_product = p.id_produk 
     GROUP BY k.id_kategori, k.nama_kategori ORDER BY total_terjual DESC LIMIT 5`
  ),
  
  getPesananTerbaru: () => safeQuery(
    `SELECT t.id_transaksi AS id_pesanan, u.nama AS nama_pelanggan, t.total_harga, t.status_order, t.created_at 
     FROM tr_transaksi t LEFT JOIN ms_users u ON u.id_users = t.id_users ORDER BY t.created_at DESC LIMIT 5`
  ),
  
  getAktivitasTerkini: () => safeQuery(
    `(SELECT CONCAT('Pesanan #ORD-', LPAD(t.id_transaksi, 4, '0'), 
      CASE t.status_order WHEN 'pending' THEN ' menunggu konfirmasi pembayaran' WHEN 'paid' THEN ' telah dibayar' WHEN 'failed' THEN ' dibatalkan oleh pelanggan' ELSE CONCAT(' status: ', t.status_order) END) AS keterangan, 
      u.nama AS aktor, t.created_at AS waktu, CASE WHEN t.status_order = 'failed' THEN 'batal' ELSE 'pesanan' END AS tipe 
      FROM tr_transaksi t LEFT JOIN ms_users u ON u.id_users = t.id_users ORDER BY t.created_at DESC LIMIT 3) 
     UNION ALL 
     (SELECT CONCAT('Produk ', p.nama_produk, CASE WHEN p.stok <= 5 THEN CONCAT(' tersisa ', p.stok, ' unit - segera restock!') ELSE ' berhasil ditambahkan' END) AS keterangan, 
      'Admin' AS aktor, p.created_at AS waktu, CASE WHEN p.stok <= 5 THEN 'stok' ELSE 'produk' END AS tipe 
      FROM ms_produk p ORDER BY p.created_at DESC LIMIT 2) 
     ORDER BY waktu DESC LIMIT 5`
  )
};

module.exports = DashboardModel;