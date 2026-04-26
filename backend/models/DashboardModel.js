const connection = require("../config/database");
const PAID_TRANSACTION_DETAIL_SUBQUERY = `
  SELECT
    t.id_transaksi,
    t.id_users,
    t.status_order,
    t.status_bayar,
    t.created_at,
    t.total_harga,
    COALESCE(SUM(dt.total), 0) AS detail_total
  FROM tr_transaksi t
  LEFT JOIN tr_detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
  WHERE t.status_bayar = 'paid'
  GROUP BY
    t.id_transaksi,
    t.id_users,
    t.status_order,
    t.status_bayar,
    t.created_at,
    t.total_harga
`;

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
    `SELECT COALESCE(SUM(CASE WHEN detail_total > 0 THEN detail_total ELSE total_harga END), 0) AS total
     FROM (${PAID_TRANSACTION_DETAIL_SUBQUERY}) paid_tx`, 
    [{ total: 0 }]
  ),
  
  getTotalPesanan: () => safeQuery(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE
         WHEN LOWER(COALESCE(status_order, 'pending')) IN ('pending', 'diproses')
           OR LOWER(COALESCE(status_bayar, 'pending')) = 'pending'
         THEN 1 ELSE 0 END) AS menunggu
     FROM tr_transaksi`, 
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
    `SELECT tanggal, total
     FROM (
       SELECT
         DATE(created_at) AS tanggal,
         COALESCE(SUM(CASE WHEN detail_total > 0 THEN detail_total ELSE total_harga END), 0) AS total
       FROM (${PAID_TRANSACTION_DETAIL_SUBQUERY}) paid_tx
       GROUP BY DATE(created_at)
     ) pendapatan_harian
     ORDER BY tanggal DESC
     LIMIT 7`
  ),
  
  getKategoriTerlaris: () => safeQuery(
    `SELECT
       k.nama_kategori,
       COALESCE(SUM(CASE WHEN t.id_transaksi IS NOT NULL THEN dt.quantity ELSE 0 END), 0) AS total_terjual
     FROM ms_kategori k 
     LEFT JOIN ms_produk p ON p.ms_kategori_id_kategori = k.id_kategori 
     LEFT JOIN tr_detail_transaksi dt ON dt.id_produk = p.id_produk
     LEFT JOIN tr_transaksi t ON t.id_transaksi = dt.id_transaksi AND t.status_bayar = 'paid'
     GROUP BY k.id_kategori, k.nama_kategori ORDER BY total_terjual DESC LIMIT 5`
  ),
  
  getPesananTerbaru: () => safeQuery(
    `SELECT
       t.id_transaksi AS id_pesanan,
       u.nama AS nama_pelanggan,
       t.total_harga,
       t.status_order,
       t.status_bayar,
       t.created_at
     FROM tr_transaksi t
     LEFT JOIN ms_users u ON u.id_users = t.id_users
     ORDER BY t.created_at DESC
     LIMIT 5`
  ),
  
  getAktivitasTerkini: () => safeQuery(
    `(SELECT CONCAT(
        'Pesanan #ORD-', LPAD(t.id_transaksi, 4, '0'),
        CASE
          WHEN LOWER(COALESCE(t.status_bayar, 'pending')) = 'paid' AND LOWER(COALESCE(t.status_order, 'pending')) = 'selesai' THEN ' telah selesai'
          WHEN LOWER(COALESCE(t.status_bayar, 'pending')) = 'paid' AND LOWER(COALESCE(t.status_order, 'pending')) = 'dikirim' THEN ' sedang dikirim'
          WHEN LOWER(COALESCE(t.status_bayar, 'pending')) = 'paid' AND LOWER(COALESCE(t.status_order, 'pending')) IN ('pending', 'diproses') THEN ' sedang diproses admin'
          WHEN LOWER(COALESCE(t.status_bayar, 'pending')) IN ('failed', 'expired') THEN ' gagal atau kedaluwarsa'
          ELSE ' menunggu pembayaran'
        END
      ) AS keterangan,
      u.nama AS aktor,
      t.created_at AS waktu,
      CASE
        WHEN LOWER(COALESCE(t.status_bayar, 'pending')) IN ('failed', 'expired') THEN 'batal'
        ELSE 'pesanan'
      END AS tipe
      FROM tr_transaksi t
      LEFT JOIN ms_users u ON u.id_users = t.id_users
      ORDER BY t.created_at DESC
      LIMIT 3) 
     UNION ALL 
     (SELECT CONCAT('Produk ', p.nama_produk, CASE WHEN p.stok <= 5 THEN CONCAT(' tersisa ', p.stok, ' unit - segera restock!') ELSE ' berhasil ditambahkan' END) AS keterangan, 
      'Admin' AS aktor, p.created_at AS waktu, CASE WHEN p.stok <= 5 THEN 'stok' ELSE 'produk' END AS tipe 
      FROM ms_produk p ORDER BY p.created_at DESC LIMIT 2) 
     ORDER BY waktu DESC LIMIT 5`
  )
};

module.exports = DashboardModel;
