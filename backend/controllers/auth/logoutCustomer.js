const authModel = require("../../models/authModel");

const handleLogoutError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const logoutCustomerController = async (req, res) => {
  try {
    const result = await authModel.logoutCustomer();
    return res.status(200).json(result);
  } catch (error) {
    return handleLogoutError(res, error, "Logout gagal");
  }
};

module.exports = logoutCustomerController;
