const connection = require("../../config/database");
const bcrypt = require("bcrypt");
const { ROLE } = require("../../utils/role"); // Tambahkan ini

const registerCustomer = async (req, res) => {
  try {
    let { nama, username, email, password, no_hp, alamat } = req.body;
    // ... validasi input tetap sama ...

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ROLE.KUSTOMER; // Gunakan konstanta

    await connection.query(
      `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role)
       VALUES (?,?,?,?,?,?,?)`,
      [nama, username.trim(), hashedPassword, email.trim().toLowerCase(), no_hp, alamat, role]
    );

    return res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = registerCustomer;