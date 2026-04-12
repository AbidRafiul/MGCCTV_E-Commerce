const OrderModel = require("../../models/OrderModel");

const ALLOWED_ORDER_STATUS = [
  "pending",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
];

const handleOrderError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAll();
    return res.status(200).json(orders);
  } catch (error) {
    return handleOrderError(res, error, "Gagal mengambil daftar pesanan");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_order } = req.body;

    if (!ALLOWED_ORDER_STATUS.includes(status_order)) {
      return res.status(400).json({
        message: "Status pesanan tidak valid",
      });
    }

    const existingOrder = await OrderModel.getById(id);
    if (existingOrder.length === 0) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan",
      });
    }

    await OrderModel.updateStatus(id, status_order);

    return res.status(200).json({
      message: "Status pesanan berhasil diperbarui",
    });
  } catch (error) {
    return handleOrderError(res, error, "Gagal memperbarui status pesanan");
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
};
