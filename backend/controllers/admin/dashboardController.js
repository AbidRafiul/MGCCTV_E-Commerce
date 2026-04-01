const dashboardModel = require("../../models/dashboardModel");

const handleDashboardError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardModel.getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    return handleDashboardError(res, error, "Gagal mengambil data dashboard");
  }
};

module.exports = { getDashboardStats };
