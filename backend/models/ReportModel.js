const connection = require("../config/database");

const SUCCESS_PAYMENT_STATUS = "paid";

const buildTransactionDateFilter = (startDate, endDate, alias = "t") => {
  const clauses = [];
  const params = [];

  if (startDate) {
    clauses.push(`DATE(${alias}.tanggal_transaksi) >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    clauses.push(`DATE(${alias}.tanggal_transaksi) <= ?`);
    params.push(endDate);
  }

  return {
    sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    params,
  };
};

const buildRestockDateFilter = (startDate, endDate, alias = "mp") => {
  const clauses = [];
  const params = [];

  if (startDate) {
    clauses.push(`DATE(${alias}.tanggal) >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    clauses.push(`DATE(${alias}.tanggal) <= ?`);
    params.push(endDate);
  }

  return {
    sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    params,
  };
};

const buildDetailTotalSubquery = ({ startDate, endDate }) => {
  const dateFilter = buildTransactionDateFilter(startDate, endDate);

  return {
    sql: `
      SELECT
        t.id_transaksi,
        t.tanggal_transaksi,
        t.total_harga,
        COALESCE(SUM(dt.total), 0) AS detail_total,
        COALESCE(SUM(dt.quantity), 0) AS detail_quantity
      FROM tr_transaksi t
      LEFT JOIN tr_detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
      WHERE t.status_bayar = ?${dateFilter.sql}
      GROUP BY t.id_transaksi, t.tanggal_transaksi, t.total_harga
    `,
    params: [SUCCESS_PAYMENT_STATUS, ...dateFilter.params],
  };
};

const normalizeDateParam = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
};

const getPreviousPeriodRange = (startDate, endDate) => {
  if (!startDate || !endDate) return { startDate: null, endDate: null };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (diffDays - 1));

  return {
    startDate: normalizeDateParam(previousStart),
    endDate: normalizeDateParam(previousEnd),
  };
};

const ReportModel = {
  getSalesSummary: async ({ startDate, endDate }) => {
    const currentPeriod = buildDetailTotalSubquery({ startDate, endDate });
    const previousPeriodRange = getPreviousPeriodRange(startDate, endDate);
    const previousPeriod = buildDetailTotalSubquery(previousPeriodRange);
    const transactionFilter = buildTransactionDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          (SELECT COALESCE(SUM(CASE WHEN detail_total > 0 THEN detail_total ELSE total_harga END), 0)
           FROM (${currentPeriod.sql}) paid_tx) AS omzet_bulan_ini,
          (SELECT COALESCE(COUNT(*), 0)
           FROM (${currentPeriod.sql}) paid_tx) AS transaksi_berhasil_bulan_ini,
          (SELECT COALESCE(SUM(detail_quantity), 0)
           FROM (${currentPeriod.sql}) paid_tx) AS produk_terjual_bulan_ini,
          (SELECT COALESCE(AVG(CASE WHEN detail_total > 0 THEN detail_total ELSE total_harga END), 0)
           FROM (${currentPeriod.sql}) paid_tx) AS rata_rata_transaksi_bulan_ini,
          (SELECT COALESCE(SUM(CASE WHEN detail_total > 0 THEN detail_total ELSE total_harga END), 0)
           FROM (${previousPeriod.sql}) paid_tx) AS omzet_bulan_lalu,
          (SELECT COALESCE(COUNT(*), 0)
           FROM tr_transaksi t
           WHERE t.status_bayar = ?${transactionFilter.sql}) AS total_transaksi_sukses
      `,
      [
        ...currentPeriod.params,
        ...currentPeriod.params,
        ...currentPeriod.params,
        ...currentPeriod.params,
        ...previousPeriod.params,
        SUCCESS_PAYMENT_STATUS,
        ...transactionFilter.params,
      ],
    );

    return rows[0] || {};
  },

  getSalesTransactions: async ({ startDate, endDate }) => {
    const dateFilter = buildTransactionDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          t.id_transaksi,
          t.tanggal_transaksi,
          t.total_harga,
          t.metode_bayar,
          t.status_bayar,
          t.status_order,
          u.nama AS nama_pelanggan,
          COUNT(dt.id_detail_transcation) AS jumlah_baris_item,
          COALESCE(SUM(dt.quantity), 0) AS total_item,
          GROUP_CONCAT(
            CONCAT(p.nama_produk, ' x', COALESCE(dt.quantity, 0))
            ORDER BY dt.id_detail_transcation SEPARATOR ', '
          ) AS item_ringkas
        FROM tr_transaksi t
        LEFT JOIN ms_users u ON u.id_users = t.id_users
        LEFT JOIN tr_detail_transaksi dt ON dt.id_transaksi = t.id_transaksi
        LEFT JOIN ms_produk p ON p.id_produk = dt.id_produk
        WHERE t.status_bayar = ?${dateFilter.sql}
        GROUP BY
          t.id_transaksi,
          t.tanggal_transaksi,
          t.total_harga,
          t.metode_bayar,
          t.status_bayar,
          t.status_order,
          u.nama
        ORDER BY t.tanggal_transaksi DESC
        LIMIT 200
      `,
      [SUCCESS_PAYMENT_STATUS, ...dateFilter.params],
    );

    return rows;
  },

  getTopSellingProducts: async ({ startDate, endDate }) => {
    const dateFilter = buildTransactionDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          p.id_produk,
          p.nama_produk,
          COALESCE(SUM(dt.quantity), 0) AS total_terjual,
          COALESCE(SUM(dt.total), 0) AS total_pendapatan
        FROM tr_detail_transaksi dt
        INNER JOIN tr_transaksi t ON t.id_transaksi = dt.id_transaksi
        INNER JOIN ms_produk p ON p.id_produk = dt.id_produk
        WHERE t.status_bayar = ?${dateFilter.sql}
        GROUP BY p.id_produk, p.nama_produk
        ORDER BY total_terjual DESC, total_pendapatan DESC
        LIMIT 5
      `,
      [SUCCESS_PAYMENT_STATUS, ...dateFilter.params],
    );

    return rows;
  },

  getRestockSummary: async ({ startDate, endDate }) => {
    const dateFilter = buildRestockDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          COALESCE(SUM(tp.jumlah), 0) AS total_barang_masuk_bulan_ini,
          COALESCE(COUNT(*), 0) AS frekuensi_restock_bulan_ini,
          COALESCE(COUNT(*), 0) AS total_log_stok
        FROM tr_pembelian tp
        INNER JOIN ms_pembelian mp ON mp.id_pembelian = tp.id_pembelian
        WHERE 1 = 1${dateFilter.sql}
      `,
      dateFilter.params,
    );

    return rows[0] || {};
  },

  getRestockTransactions: async ({ startDate, endDate }) => {
    const dateFilter = buildRestockDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          tp.id_tr_pembelian,
          tp.jumlah,
          mp.tanggal,
          mp.no_faktur,
          p.nama_produk,
          u.nama AS nama_admin
        FROM tr_pembelian tp
        INNER JOIN ms_pembelian mp ON mp.id_pembelian = tp.id_pembelian
        INNER JOIN ms_produk p ON p.id_produk = tp.id_produk
        INNER JOIN ms_users u ON u.id_users = mp.id_users
        WHERE 1 = 1${dateFilter.sql}
        ORDER BY mp.tanggal DESC, tp.id_tr_pembelian DESC
        LIMIT 200
      `,
      dateFilter.params,
    );

    return rows;
  },

  getTopRestockedProducts: async ({ startDate, endDate }) => {
    const dateFilter = buildRestockDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          p.id_produk,
          p.nama_produk,
          COALESCE(SUM(tp.jumlah), 0) AS total_restock
        FROM tr_pembelian tp
        INNER JOIN ms_pembelian mp ON mp.id_pembelian = tp.id_pembelian
        INNER JOIN ms_produk p ON p.id_produk = tp.id_produk
        WHERE 1 = 1${dateFilter.sql}
        GROUP BY p.id_produk, p.nama_produk
        ORDER BY total_restock DESC
        LIMIT 5
      `,
      dateFilter.params,
    );

    return rows;
  },

  getTopRestockAdmin: async ({ startDate, endDate }) => {
    const dateFilter = buildRestockDateFilter(startDate, endDate);

    const [rows] = await connection.query(
      `
        SELECT
          u.nama,
          COUNT(*) AS total_input
        FROM tr_pembelian tp
        INNER JOIN ms_pembelian mp ON mp.id_pembelian = tp.id_pembelian
        INNER JOIN ms_users u ON u.id_users = mp.id_users
        WHERE 1 = 1${dateFilter.sql}
        GROUP BY u.id_users, u.nama
        ORDER BY total_input DESC
        LIMIT 1
      `,
      dateFilter.params,
    );

    return rows[0] || null;
  },
};

module.exports = ReportModel;
