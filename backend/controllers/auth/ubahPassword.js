const authModel = require("../../models/authModel");

const handleUbahPassError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const ubahPassword = async (req, res) => {
  try {
    const result = await authModel.updatePassword({
      userId: req.user?.id || req.user?.id_users,
      currentPassword: req.body?.currentPassword || req.body?.passwordLama,
      newPassword: req.body?.newPassword || req.body?.passwordBaru,
      confirmPassword: req.body?.confirmPassword || req.body?.konfirmasiPassword,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleUbahPassError(res, error, "Gagal mengubah password");
  }
};

module.exports = ubahPassword;
