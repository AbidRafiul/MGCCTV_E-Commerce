const authModel = require("../../models/authModel");

const handleRegisterError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const registerCustomerController = async (req, res) => {
  try {
    const result = await authModel.registerCustomer(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleRegisterError(res, error, "Server error");
  }
};

module.exports = registerCustomerController;
