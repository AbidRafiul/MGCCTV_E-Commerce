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
    // 1. Ubah dari email menjadi identifier
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/Email dan password wajib diisi",
      });
    }

    // Bersihkan spasi kosong
    identifier = identifier.trim().toLowerCase();

    // 2. Gunakan fungsi baru yang akan kita buat di Model
    const existingUser = await AuthModel.findUserByIdentifier(identifier);


    if (existingUser.length === 0) {
      return res.status(401).json({
        message: "Username/Email atau password salah",
      });
    }

    const user = existingUser[0];

    if (!user.password) {
      return res.status(401).json({
        message:
          "Akun ini terdaftar menggunakan Google. Silakan login dengan tombol Google.",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        message: "Username/Email atau password salah",
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

    await AuthModel.updateLastLogin(user.id_users);

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
