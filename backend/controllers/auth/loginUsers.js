const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel"); // Memanggil Koki Auth kita!

const loginUsers = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const emailClean = email.trim().toLowerCase();

    // Panggil Model yang sudah kita buat sebelumnya
    const existingUser = await AuthModel.findUserByEmail(emailClean);

    if (existingUser.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const user = existingUser[0];

    // BONUS KEAMANAN: Jika akun dibuat via Google (password di DB kosong)
    if (!user.password) {
       return res.status(401).json({
         message: "Akun ini terdaftar menggunakan Google. Silakan login dengan tombol Google.",
       });
    }

    // Controller murni mengurus logika enkripsi dan bisnis
    const checkPassword = await bcrypt.compare(
      password,
      user.password
    );

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
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      token: token,
      role: user.role,
    });

  } catch (error) {
    return handleAuthError(res, error, "Server error");
  }
};

module.exports = loginUsers;
