const UserOrderHistoryModel = require("../../models/UserOrderHistoryModel");

const handleOrderHistoryError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getOrderHistory = async (req, res) => {
  try {
    const rows = await UserOrderHistoryModel.getByUserId(req.user.id);

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.id_transaksi)) {
        ordersMap.set(row.id_transaksi, {
          id_pesanan: row.id_transaksi,
          tanggal_transaksi: row.tanggal_transaksi,
          total_harga: Number(row.total_harga || 0),
          metode_bayar: row.metode_bayar,
          status_order: row.status_order || "pending",
          status_bayar: row.status_bayar || "pending",
          items: [],
        });
      }

      if (row.id_detail_transcation) {
        ordersMap.get(row.id_transaksi).items.push({
          id_detail_transcation: row.id_detail_transcation,
          id_produk: row.id_produk,
          nama_produk: row.nama_produk || "Produk",
          gambar_produk: row.gambar_produk || "/images/placeholder.jpg",
          kategori: row.kategori || row.merek || "-",
          merek: row.merek || row.kategori || "-",
          quantity: Number(row.quantity || 0),
          harga: Number(row.harga || 0),
          total: Number(row.total || 0),
        });
      }
    });

    const orders = Array.from(ordersMap.values());
    const activeStatuses = new Set(["pending", "diproses", "dikirim"]);

    return res.status(200).json({
      orders,
      summary: {
        total_orders: orders.length,
        total_spent: orders.reduce((sum, order) => sum + Number(order.total_harga || 0), 0),
        pending_orders: orders.filter((order) => activeStatuses.has(order.status_order)).length,
        completed_orders: orders.filter((order) => order.status_order === "selesai").length,
      },
    });
  } catch (error) {
    return handleOrderHistoryError(res, error, "Gagal mengambil riwayat pesanan");
  }
};

module.exports = {
  getOrderHistory,
};
