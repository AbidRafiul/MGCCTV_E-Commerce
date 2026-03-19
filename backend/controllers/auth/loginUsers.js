const connection = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginUsers = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const emailClean = email.trim().toLowerCase();

    const [user] = await connection.query(
      "SELECT * FROM ms_users WHERE email = ?",
      [emailClean]
    );

    if (user.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const checkPassword = await bcrypt.compare(
      password,
      user[0].password
    );

    if (!checkPassword) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user[0].id_users,
        role: user[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      token: token,
      role: user[0].role,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = loginUsers;