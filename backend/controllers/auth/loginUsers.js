const authModel = require("../../models/authModel");

const handleAuthError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const loginUsers = async (req, res) => {
  try {
    const result = await authModel.loginUsers(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleAuthError(res, error, "Server error");
  }
};

module.exports = loginUsers;
