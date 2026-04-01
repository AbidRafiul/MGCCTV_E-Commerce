const authModel = require("../../models/authModel");

const handleGoogleLoginError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const googleLoginController = async (req, res) => {
  try {
    const result = await authModel.googleLogin(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleGoogleLoginError(res, error, "Google login gagal");
  }
};

module.exports = googleLoginController;
