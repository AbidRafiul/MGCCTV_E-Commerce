const connection = require("../../config/database");

const getDashboardStats = async (req, res) => {
  try {
    // Semua query dijalankan paralel untuk efisiensi
    const [
      totalPendapatanResult,
      totalPesananResult,
      produkAktifResult,
      stokHabisProdukResult,
      pelangganResult,
      pendapatanHarianResult,
      kategoriTerlarisResult,
      pesananTerbaruResult,
      aktivitasResult,
    ] = await Promise.all([

      // 1. Total Pendapatan (transaksi yang sudah dibayar)
      connection.query(
        `SELECT COALESCE(SUM(total_harga), 0) AS total
        FROM tr_transaksi
        WHERE status_order = 'paid'`
      ),

      // 2. Total Pesanan
      connection.query(
        `SELECT COUNT(*) AS total, 
                SUM(CASE WHEN t.status_order = 'pending' THEN 1 ELSE 0 END) AS menunggu
        FROM tr_transaksi t`
      ),

      // 3. Produk Aktif (status_produk = 1)
      connection.query(
        `SELECT COUNT(*) AS total
        FROM ms_produk
        WHERE status_produk = 1`
      ),

      // 4. Produk stok hampir habis (stok <= 5)
      connection.query(
        `SELECT COUNT(*) AS hampir_habis
        FROM ms_produk
        WHERE status_produk = 1 AND stok <= 5`
      ),

      // 5. Total Pelanggan (role kustomer / Pelanggan)
      connection.query(
        `SELECT COUNT(*) AS total
        FROM ms_users
        WHERE LOWER(role) IN ('kustomer', 'pelanggan')`
      ),

      // 6. Pendapatan Harian (5 hari terakhir)
      connection.query(
        `SELECT DATE(created_at) AS tanggal,
                COALESCE(SUM(total_harga), 0) AS total
        FROM tr_transaksi
        WHERE status_order = 'paid'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)
          GROUP BY DATE(created_at)
          ORDER BY tanggal DESC
          LIMIT 5`
      ),

      // 7. Kategori Terlaris (DI SINI PERBAIKANNYA)
      connection.query(
        `SELECT k.nama_kategori,
                COALESCE(SUM(dt.quantity), 0) AS total_terjual
          FROM ms_kategori k
          LEFT JOIN ms_produk p ON p.ms_kategori_id_kategori = k.id_kategori
          -- Perbaikan: Menggunakan 'id_product' sesuai skema di image_7b3c3c.png
          LEFT JOIN ms_detail_transaction dt ON dt.id_product = p.id_produk
          GROUP BY k.id_kategori, k.nama_kategori
          ORDER BY total_terjual DESC
          LIMIT 5`
      ),

      // 8. Pesanan Terbaru (5 terakhir)
      connection.query(
        `SELECT p.id_pesanan,
                u.nama AS nama_pelanggan,
                t.total_harga,
                t.status_order,
                t.created_at
          FROM tr_pesanan p
          JOIN tr_transaksi t ON t.id_transaksi = p.id_transaksi
          JOIN ms_users u ON u.id_users = t.id_users
          ORDER BY t.created_at DESC
          LIMIT 5`
      ),

      // 9. Aktivitas Terkini
      connection.query(
        `(SELECT 
            CONCAT('Pesanan #ORD-', LPAD(t.id_transaksi, 4, '0'), 
                    CASE t.status_order
                    WHEN 'pending' THEN ' menunggu konfirmasi pembayaran'
                    WHEN 'paid' THEN ' telah dibayar'
                    WHEN 'failed' THEN ' dibatalkan oleh pelanggan'
                    ELSE CONCAT(' status: ', t.status_order)
                    END) AS keterangan,
            u.nama AS aktor,
            t.created_at AS waktu,
            'pesanan' AS tipe
          FROM tr_transaksi t
          JOIN ms_users u ON u.id_users = t.id_users
          ORDER BY t.created_at DESC
          LIMIT 3)
          UNION ALL
          (SELECT
            CONCAT('Produk ', p.nama_produk, 
                    CASE WHEN p.stok <= 5 THEN CONCAT(' tersisa ', p.stok, ' unit — segera restock!')
                        ELSE ' berhasil ditambahkan' END) AS keterangan,
            'Admin' AS aktor,
            p.created_at AS waktu,
            'produk' AS tipe
          FROM ms_produk p
          ORDER BY p.created_at DESC
          LIMIT 2)
          ORDER BY waktu DESC
          LIMIT 5`
      ),
    ]);

    // Format data kategori
    const kategoriData = kategoriTerlarisResult[0];
    const totalTerjual = kategoriData.reduce((acc, k) => acc + Number(k.total_terjual), 0) || 1;
    const kategoriWithPercent = kategoriData.map((k) => ({
      nama: k.nama_kategori,
      total: Number(k.total_terjual),
      persen: Math.round((Number(k.total_terjual) / totalTerjual) * 100),
    }));

    // Format data harian
    const harianData = pendapatanHarianResult[0];
    const maxHarian = Math.max(...harianData.map((d) => Number(d.total)), 1);
    const harianWithRatio = harianData.map((d) => ({
      tanggal: d.tanggal,
      total: Number(d.total),
      rasio: Math.round((Number(d.total) / maxHarian) * 100),
    }));

    return res.status(200).json({
      stats: {
        totalPendapatan: Number(totalPendapatanResult[0][0]?.total ?? 0),
        totalPesanan: Number(totalPesananResult[0][0]?.total ?? 0),
        pesananMenunggu: Number(totalPesananResult[0][0]?.menunggu ?? 0),
        produkAktif: Number(produkAktifResult[0][0]?.total ?? 0),
        produkHampirHabis: Number(stokHabisProdukResult[0][0]?.hampir_habis ?? 0),
        totalPelanggan: Number(pelangganResult[0][0]?.total ?? 0),
      },
      pendapatanHarian: harianWithRatio,
      kategoriTerlaris: kategoriWithPercent,
      pesananTerbaru: pesananTerbaruResult[0],
      aktivitasTerkini: aktivitasResult[0],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data dashboard",
      error: error.message,
    });
  }
};

module.exports = { getDashboardStats };