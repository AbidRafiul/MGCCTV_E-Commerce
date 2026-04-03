const bcrypt = require("bcrypt");
const { ROLE } = require("../../utils/role");
const AuthModel = require("../../models/AuthModel");

const handleRegisterError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const registerCustomer = async (req, res) => {
  try {
    const nama = req.body.nama?.trim() || "";
    const username = req.body.username?.trim() || "";
    const email = req.body.email?.trim().toLowerCase() || "";
    const password = req.body.password || "";
    const no_hp = req.body.no_hp?.trim() || "";
    const alamat = req.body.alamat?.trim() || "";

    if (!nama || !username || !email || !password || !no_hp || !alamat) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    const existingUser = await AuthModel.findUserByEmailOrUsername(email, username);
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email atau username sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await AuthModel.registerCustomer(
      nama,
      username,
      hashedPassword,
      email,
      no_hp,
      alamat,
      ROLE.KUSTOMER,
    );

    return res.status(201).json({
      message: "Registrasi berhasil",
    });
  } catch (error) {
    return handleRegisterError(res, error, "Server error");
  }
};

module.exports = registerCustomer;
