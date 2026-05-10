const bcrypt = require("bcrypt");
const AuthModel = require("../../models/AuthModel");

const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.new_password || req.body.password || "");

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token dan password baru wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    const users = await AuthModel.findUserByValidResetToken(token);
    if (users.length === 0) {
      return res.status(400).json({ message: "Token reset password tidak valid atau sudah kadaluarsa" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const result = await AuthModel.updatePasswordByResetToken(token, hashedPassword);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Token reset password tidak valid atau sudah kadaluarsa" });
    }

    return res.status(200).json({ message: "Password berhasil diubah. Silakan login dengan password baru Anda." });
  } catch (error) {
    console.error("Error resetPassword:", error);
    return res.status(500).json({
      message: "Gagal mengubah password",
      error: error.message,
    });
  }
};

module.exports = resetPassword;
