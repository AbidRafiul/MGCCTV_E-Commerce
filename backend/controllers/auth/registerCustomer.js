const connection = require("../../config/database");
const bcrypt = require("bcrypt");

const registerCustomer = async (req, res) => {
  try {
    let { nama, username, email, password, no_hp, alamat } = req.body;

    if (!nama || !username || !email || !password) {
      return res.status(400).json({
        message: "Data wajib diisi",
      });
    }

    const emailClean = email.trim().toLowerCase();
    const usernameClean = username.trim();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    const [user] = await connection.query(
      "SELECT * FROM ms_users WHERE email = ? OR username = ?",
      [emailClean, usernameClean]
    );

    if (user.length > 0) {
      return res.status(400).json({
        message: "Email atau username sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = "kustomer";

    await connection.query(
      `INSERT INTO ms_users
      (nama, username, password, email, no_hp, alamat, role)
      VALUES (?,?,?,?,?,?,?)`,
      [nama, usernameClean, hashedPassword, emailClean, no_hp, alamat, role]
    );

    return res.status(201).json({
      message: "Registrasi berhasil",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = registerCustomer;