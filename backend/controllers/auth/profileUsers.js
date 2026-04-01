const authModel = require("../../models/authModel");

const handleProfileError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const profileUsers = async (req, res) => {
  try {
    if (req.method === "GET") {
      const user = await authModel.findProfileByUserId(req.user.id);
      return res.json({
        message: "Profile berhasil diambil",
        user,
      });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const user = await authModel.updateProfileByUserId({
        userId: req.user.id,
        method: req.method,
        body: req.body,
      });

      return res.json({
        message: "Profile berhasil diperbarui",
        user,
      });
    }

    return res.status(405).json({
      message: "Method tidak didukung",
    });
  } catch (error) {
    return handleProfileError(res, error, "Terjadi kesalahan pada profile user");
  }
};

module.exports = profileUsers;
