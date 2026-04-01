const connection = require("../config/database");

const DETAIL_TABLE_CANDIDATES = [
  "ms_detail_transaction",
  "tr_detail_transaction",
  "ms_detail_transaksi",
  "tr_detail_transaksi",
];

const PRODUCT_ID_COLUMN_CANDIDATES = [
  "id_product",
  "id_produk",
  "ms_produk_id_produk",
];

const QTY_COLUMN_CANDIDATES = ["quantity", "qty", "jumlah"];

const safeQuery = async (label, query, params = [], fallback = []) => {
  try {
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error(`Dashboard query failed [${label}]:`, error.message);
    return fallback;
  }
};

const findExistingTable = async (tableNames) => {
  if (tableNames.length === 0) {
    return null;
  }

  const placeholders = tableNames.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN (${placeholders})
     LIMIT 1`,
    tableNames,
  );

  return rows[0]?.TABLE_NAME || null;
};

const findExistingColumn = async (tableName, columnNames) => {
  if (!tableName || columnNames.length === 0) {
    return null;
  }

  const placeholders = columnNames.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME IN (${placeholders})
     LIMIT 1`,
    [tableName, ...columnNames],
  );

  return rows[0]?.COLUMN_NAME || null;
};

const getKategoriTerlaris = async (detailTable, productIdColumn, quantityColumn) => {
  if (!detailTable || !productIdColumn || !quantityColumn) {
    return safeQuery(
      "kategori-default",
      `SELECT nama_kategori
       FROM ms_kategori
       ORDER BY nama_kategori ASC
       LIMIT 5`,
      [],
      [],
    );
  }

  return safeQuery(
    "kategori-terlaris",
    `SELECT k.nama_kategori,
            COALESCE(SUM(dt.${quantityColumn}), 0) AS total_terjual
     FROM ms_kategori k
     LEFT JOIN ms_produk p ON p.ms_kategori_id_kategori = k.id_kategori
     LEFT JOIN ${detailTable} dt ON dt.${productIdColumn} = p.id_produk
     GROUP BY k.id_kategori, k.nama_kategori
     ORDER BY total_terjual DESC, k.nama_kategori ASC
     LIMIT 5`,
    [],
    [],
  );
};

const formatKategoriTerlaris = (rows) => {
  const normalizedRows = rows.map((item) => ({
    nama: item.nama_kategori,
    total: Number(item.total_terjual || 0),
  }));

  const totalTerjual = normalizedRows.reduce((acc, item) => acc + item.total, 0) || 1;

  return normalizedRows.map((item) => ({
    ...item,
    persen: Math.round((item.total / totalTerjual) * 100),
  }));
};

const formatPendapatanHarian = (rows) => {
  const normalizedRows = [...rows]
    .map((item) => ({
      tanggal: item.tanggal,
      total: Number(item.total || 0),
    }))
    .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));

  const maxHarian = Math.max(...normalizedRows.map((item) => item.total), 1);

  return normalizedRows.map((item) => ({
    ...item,
    rasio: Math.round((item.total / maxHarian) * 100),
  }));
};

const getDashboardStats = async () => {
  let detailTable = null;
  let productIdColumn = null;
  let quantityColumn = null;

  try {
    detailTable = await findExistingTable(DETAIL_TABLE_CANDIDATES);
    productIdColumn = await findExistingColumn(detailTable, PRODUCT_ID_COLUMN_CANDIDATES);
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
  ] = await Promise.all([
    safeQuery(
      "total-pendapatan",
      `SELECT COALESCE(SUM(total_harga), 0) AS total
       FROM tr_transaksi
       WHERE status_order = 'paid'`,
      [],
      [{ total: 0 }],
    ),
    safeQuery(
      "total-pesanan",
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status_order = 'pending' THEN 1 ELSE 0 END) AS menunggu
       FROM tr_transaksi`,
      [],
      [{ total: 0, menunggu: 0 }],
    ),
    safeQuery(
      "produk-aktif",
      `SELECT COUNT(*) AS total
       FROM ms_produk
       WHERE status_produk = 1`,
      [],
      [{ total: 0 }],
    ),
    safeQuery(
      "stok-hampir-habis",
      `SELECT COUNT(*) AS hampir_habis
       FROM ms_produk
       WHERE status_produk = 1 AND stok <= 5`,
      [],
      [{ hampir_habis: 0 }],
    ),
    safeQuery(
      "total-pelanggan",
      `SELECT COUNT(*) AS total
       FROM ms_users
       WHERE LOWER(role) IN ('kustomer', 'pelanggan')`,
      [],
      [{ total: 0 }],
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
      [],
      [],
    ),
    getKategoriTerlaris(detailTable, productIdColumn, quantityColumn),
    safeQuery(
      "pesanan-terbaru",
      `SELECT t.id_transaksi AS id_pesanan,
              u.nama AS nama_pelanggan,
              t.total_harga,
              t.status_order,
              t.created_at
       FROM tr_transaksi t
       LEFT JOIN ms_users u ON u.id_users = t.id_users
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [],
      [],
    ),
    safeQuery(
      "aktivitas-terkini",
      `(SELECT
          CONCAT(
            'Pesanan #ORD-',
            LPAD(t.id_transaksi, 4, '0'),
            CASE t.status_order
              WHEN 'pending' THEN ' menunggu konfirmasi pembayaran'
              WHEN 'paid' THEN ' telah dibayar'
              WHEN 'failed' THEN ' dibatalkan oleh pelanggan'
              ELSE CONCAT(' status: ', t.status_order)
            END
          ) AS keterangan,
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
      [],
      [],
    ),
  ]);

  return {
    stats: {
      totalPendapatan: Number(totalPendapatanRows[0]?.total ?? 0),
      totalPesanan: Number(totalPesananRows[0]?.total ?? 0),
      pesananMenunggu: Number(totalPesananRows[0]?.menunggu ?? 0),
      produkAktif: Number(produkAktifRows[0]?.total ?? 0),
      produkHampirHabis: Number(stokHabisRows[0]?.hampir_habis ?? 0),
      totalPelanggan: Number(pelangganRows[0]?.total ?? 0),
    },
    pendapatanHarian: formatPendapatanHarian(pendapatanHarianRows),
    kategoriTerlaris: formatKategoriTerlaris(kategoriTerlarisRows),
    pesananTerbaru: pesananTerbaruRows,
    aktivitasTerkini: aktivitasRows,
  };
};

module.exports = {
  getDashboardStats,
};
