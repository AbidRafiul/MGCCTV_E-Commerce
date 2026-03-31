const connection = require("../../config/database");

const DETAIL_TABLE_CANDIDATES = [
  "ms_detail_transaction",
  "tr_detail_transaction",
  "ms_detail_transaksi",
  "tr_detail_transaksi",
];

const QTY_COLUMN_CANDIDATES = ["quantity", "qty", "jumlah"];

const safeQuery = async (label, query, fallback = []) => {
  try {
    const [rows] = await connection.query(query);
    return rows;
  } catch (error) {
    console.error(`Dashboard query failed [${label}]:`, error.message);
    return fallback;
  }
};

const findExistingTable = async (tableNames) => {
  if (tableNames.length === 0) return null;

  const placeholders = tableNames.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN (${placeholders})
     LIMIT 1`,
    tableNames
  );

  return rows[0]?.TABLE_NAME || null;
};

const findExistingColumn = async (tableName, columnNames) => {
  if (!tableName || columnNames.length === 0) return null;

  const placeholders = columnNames.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME IN (${placeholders})
     LIMIT 1`,
    [tableName, ...columnNames]
  );

  return rows[0]?.COLUMN_NAME || null;
};

const getDashboardStats = async (req, res) => {
  try {
    let detailTable = null;
    let quantityColumn = null;

    try {
      detailTable = await findExistingTable(DETAIL_TABLE_CANDIDATES);
      quantityColumn = await findExistingColumn(detailTable, QTY_COLUMN_CANDIDATES);
    } catch (error) {
      console.error("Dashboard metadata lookup failed:", error.message);
    }

    const [
      totalPendapatanRows,
      totalPesananRows,
      produkAktifRows,
      stokHabisRows,
      pelangganRows,
      pendapatanHarianRows,
      kategoriTerlarisRows,
      pesananTerbaruRows,
      aktivitasRows,
      kategoriRows,
    ] = await Promise.all([
      safeQuery(
        "total-pendapatan",
        `SELECT COALESCE(SUM(total_harga), 0) AS total
         FROM tr_transaksi
         WHERE status_order = 'paid'`,
        [{ total: 0 }]
      ),
      safeQuery(
        "total-pesanan",
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN status_order = 'pending' THEN 1 ELSE 0 END) AS menunggu
         FROM tr_transaksi`,
        [{ total: 0, menunggu: 0 }]
      ),
      safeQuery(
        "produk-aktif",
        `SELECT COUNT(*) AS total
         FROM ms_produk
         WHERE status_produk = 1`,
        [{ total: 0 }]
      ),
      safeQuery(
        "stok-hampir-habis",
        `SELECT COUNT(*) AS hampir_habis
         FROM ms_produk
         WHERE status_produk = 1 AND stok <= 5`,
        [{ hampir_habis: 0 }]
      ),
      safeQuery(
        "total-pelanggan",
        `SELECT COUNT(*) AS total
         FROM ms_users
         WHERE LOWER(role) IN ('kustomer', 'pelanggan')`,
        [{ total: 0 }]
      ),
      safeQuery(
        "pendapatan-harian",
        `SELECT DATE(created_at) AS tanggal,
                COALESCE(SUM(total_harga), 0) AS total
         FROM tr_transaksi
         WHERE status_order = 'paid'
           AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)
         GROUP BY DATE(created_at)
         ORDER BY tanggal DESC
         LIMIT 5`,
        []
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
         FROM tr_transaksi t
         LEFT JOIN ms_users u ON u.id_users = t.id_users
         ORDER BY t.created_at DESC
         LIMIT 5`,
        []
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
            CASE
              WHEN t.status_order = 'failed' THEN 'batal'
              ELSE 'pesanan'
            END AS tipe
          FROM tr_transaksi t
          LEFT JOIN ms_users u ON u.id_users = t.id_users
          ORDER BY t.created_at DESC
          LIMIT 3)
         UNION ALL
         (SELECT
            CONCAT(
              'Produk ',
              p.nama_produk,
              CASE
                WHEN p.stok <= 5 THEN CONCAT(' tersisa ', p.stok, ' unit - segera restock!')
                ELSE ' berhasil ditambahkan'
              END
            ) AS keterangan,
            'Admin' AS aktor,
            p.created_at AS waktu,
            CASE
              WHEN p.stok <= 5 THEN 'stok'
              ELSE 'produk'
            END AS tipe
          FROM ms_produk p
          ORDER BY p.created_at DESC
          LIMIT 2)
         ORDER BY waktu DESC
         LIMIT 5`,
        []
      ),
      safeQuery(
        "kategori-default",
        `SELECT nama_kategori
         FROM ms_kategori
         ORDER BY nama_kategori ASC
         LIMIT 5`,
        []
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
        totalPendapatan: Number(totalPendapatanRows[0]?.total ?? 0),
        totalPesanan: Number(totalPesananRows[0]?.total ?? 0),
        pesananMenunggu: Number(totalPesananRows[0]?.menunggu ?? 0),
        produkAktif: Number(produkAktifRows[0]?.total ?? 0),
        produkHampirHabis: Number(stokHabisRows[0]?.hampir_habis ?? 0),
        totalPelanggan: Number(pelangganRows[0]?.total ?? 0),
      },
      pendapatanHarian: harianWithRatio,
      kategoriTerlaris: kategoriWithPercent,
      pesananTerbaru: pesananTerbaruRows,
      aktivitasTerkini: aktivitasRows,
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