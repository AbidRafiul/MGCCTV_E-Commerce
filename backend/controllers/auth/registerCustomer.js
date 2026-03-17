const connection = require("../../config/database");
const bcrypt = require("bcrypt");

const registerCustomer = async (req, res) => {

  try {

    const { nama, username, email, password, no_hp, alamat } = req.body;

    // cek email atau username
    const [user] = await connection.query(
      "SELECT * FROM ms_users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (user.length > 0) {
      return res.json({
        message: "Email atau username sudah digunakan"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = "kustomer";
    await connection.query(
      `INSERT INTO ms_users
      (nama, username, password, email, no_hp, alamat, role)
      VALUES (?,?,?,?,?,?,?)`,
      [nama, username, hashedPassword, email, no_hp, alamat, role]
    );

    res.json({
      message: "Registrasi customer berhasil"
    });

  } catch (error) {
    res.status(500).json(error);
  }

};

module.exports = registerCustomer;