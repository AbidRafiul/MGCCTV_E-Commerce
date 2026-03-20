const connection = require("../../config/database");
const bcrypt = require("bcrypt");
<<<<<<< HEAD
const { ROLE } = require("../../utils/role");

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

    const [existingUser] = await connection.query(
      "SELECT id_users FROM ms_users WHERE email = ? OR username = ? LIMIT 1",
      [email, username],
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email atau username sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ROLE.KUSTOMER;
=======
const { ROLE } = require("../../utils/role"); // Tambahkan ini

const registerCustomer = async (req, res) => {
  try {
    let { nama, username, email, password, no_hp, alamat } = req.body;
    // ... validasi input tetap sama ...

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ROLE.KUSTOMER; // Gunakan konstanta
>>>>>>> e94e6cf39d6fd65534166bb43add91957af03b3e

    await connection.query(
      `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role)
       VALUES (?,?,?,?,?,?,?)`,
<<<<<<< HEAD
      [nama, username, hashedPassword, email, no_hp, alamat, role],
=======
      [nama, username.trim(), hashedPassword, email.trim().toLowerCase(), no_hp, alamat, role]
>>>>>>> e94e6cf39d6fd65534166bb43add91957af03b3e
    );

    return res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = registerCustomer;
