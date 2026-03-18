const connection = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await connection.query(
      "SELECT * FROM ms_users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const checkPassword = await bcrypt.compare(
      password,
      user[0].password
    );

    if (!checkPassword) {
      return res.status(401).json({
        message: "Password salah",
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
      message: `Login berhasil sebagai ${user[0].role}`,
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