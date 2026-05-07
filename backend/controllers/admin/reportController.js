const ReportModel = require("../../models/ReportModel");

const formatPercentChange = (currentValue, previousValue) => {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous <= 0) {
    return current > 0 ? "Naik dari 0 bulan lalu" : "Belum ada perubahan";
  }

  const diff = ((current - previous) / previous) * 100;
  const direction = diff >= 0 ? "Naik" : "Turun";
  return `${direction} ${Math.abs(diff).toFixed(1)}% dari bulan lalu`;
};

const mapPaymentMethodLabel = (value) => {
  if (value === "qris") return "QRIS";
  if (value === "transfer_bank") return "Transfer Bank";
  return value || "-";
};

const mapOrderStatusLabel = (statusOrder, statusBayar) => {
  if (statusBayar !== "paid") return "Belum Lunas";

  switch (String(statusOrder || "").toLowerCase()) {
    case "selesai":
      return "Selesai";
    case "dikirim":
      return "Dikirim";
    case "diproses":
      return "Diproses";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return "Menunggu";
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const startDate = String(req.query.start_date || "").trim() || null;
    const endDate = String(req.query.end_date || "").trim() || null;

    const [
      salesSummary,
      salesTransactions,
      topSellingProducts,
      restockSummary,
      restockTransactions,
      topRestockedProducts,
      topRestockAdmin,
    ] = await Promise.all([
      ReportModel.getSalesSummary({ startDate, endDate }),
      ReportModel.getSalesTransactions({ startDate, endDate }),
      ReportModel.getTopSellingProducts({ startDate, endDate }),
      ReportModel.getRestockSummary({ startDate, endDate }),
      ReportModel.getRestockTransactions({ startDate, endDate }),
      ReportModel.getTopRestockedProducts({ startDate, endDate }),
      ReportModel.getTopRestockAdmin({ startDate, endDate }),
    ]);

    const salesCards = [
      {
        title: "Omzet Bulan Ini",
        value: Number(salesSummary.omzet_bulan_ini || 0),
        note: formatPercentChange(salesSummary.omzet_bulan_ini, salesSummary.omzet_bulan_lalu),
        tone: "emerald",
      },
      {
        title: "Transaksi Berhasil",
        value: Number(salesSummary.transaksi_berhasil_bulan_ini || 0),
        note: `${Number(salesSummary.total_transaksi_sukses || 0)} total transaksi sukses tercatat`,
        tone: "blue",
      },
      {
        title: "Produk Terjual",
        value: Number(salesSummary.produk_terjual_bulan_ini || 0),
        note: "Akumulasi unit dari transaksi sukses bulan ini",
        tone: "amber",
      },
      {
        title: "Nilai Rata-rata",
        value: Number(salesSummary.rata_rata_transaksi_bulan_ini || 0),
        note: "Rata-rata nominal per transaksi sukses bulan ini",
        tone: "violet",
      },
    ];

    const salesRows = salesTransactions.map((row) => ({
      id: `INV-${String(row.id_transaksi).padStart(6, "0")}`,
      customer: row.nama_pelanggan || "Pelanggan",
      channel: "Website",
      items: row.item_ringkas || "-",
      total: Number(row.total_harga || 0),
      payment: mapPaymentMethodLabel(row.metode_bayar),
      status: mapOrderStatusLabel(row.status_order, row.status_bayar),
      date: row.tanggal_transaksi,
    }));

    const salesInsights = topSellingProducts.map((row) => ({
      name: row.nama_produk,
      sold: Number(row.total_terjual || 0),
      revenue: Number(row.total_pendapatan || 0),
      change: `Rp ${new Intl.NumberFormat("id-ID").format(Number(row.total_pendapatan || 0))}`,
    }));

    const restockCards = [
      {
        title: "Total Barang Masuk",
        value: Number(restockSummary.total_barang_masuk_bulan_ini || 0),
        note: "Akumulasi unit stok masuk bulan ini",
        tone: "blue",
      },
      {
        title: "Frekuensi Restok",
        value: Number(restockSummary.frekuensi_restock_bulan_ini || 0),
        note: "Jumlah aktivitas stok masuk bulan ini",
        tone: "emerald",
      },
      {
        title: "Produk Terbanyak",
        value: topRestockedProducts[0]?.nama_produk || "-",
        note: topRestockedProducts[0]
          ? `${Number(topRestockedProducts[0].total_restock || 0)} unit paling sering masuk`
          : "Belum ada data restok",
        tone: "amber",
      },
      {
        title: "Admin Teraktif",
        value: topRestockAdmin?.nama || "-",
        note: topRestockAdmin
          ? `${Number(topRestockAdmin.total_input || 0)} input stok tercatat`
          : "Belum ada aktivitas admin",
        tone: "violet",
      },
    ];

    const restockRows = restockTransactions.map((row) => ({
      id: row.no_faktur || `PB-${String(row.id_tr_pembelian).padStart(6, "0")}`,
      product: row.nama_produk,
      jumlah: Number(row.jumlah || 0),
      admin: row.nama_admin || "Admin",
      date: row.tanggal,
    }));

    const restockInsights = topRestockedProducts.map((row) => ({
      name: row.nama_produk,
      sold: Number(row.total_restock || 0),
      revenue: 0,
      change: "Restok",
    }));

    return res.status(200).json({
      filters: {
        start_date: startDate,
        end_date: endDate,
      },
      salesCards,
      salesRows,
      salesInsights,
      restockCards,
      restockRows,
      restockInsights,
    });
  } catch (error) {
    console.error("Gagal mengambil laporan transaksi:", error);
    return res.status(500).json({
      message: "Gagal mengambil laporan transaksi",
      error: error.message,
    });
  }
};

module.exports = { getTransactionReport };
