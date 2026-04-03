const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel");

const handleAuthError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const loginUsers = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    email = email.trim().toLowerCase();

    const existingUser = await AuthModel.findUserByEmail(email);
    if (existingUser.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const user = existingUser[0];

    if (!user.password) {
      return res.status(401).json({
        message: "Akun ini terdaftar menggunakan Google. Silakan login dengan tombol Google.",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id_users,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      role: user.role,
    });
  } catch (error) {
    return handleAuthError(res, error, "Server error");
  }
};

module.exports = loginUsers;
