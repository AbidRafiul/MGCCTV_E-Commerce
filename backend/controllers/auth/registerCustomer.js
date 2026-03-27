const connection = require("../../config/database");
const bcrypt = require("bcrypt");
const { ROLE } = require("../../utils/role");

const registerCustomer = async (req, res) => {
  try {
    // 1. Ambil data dan trim input
    const nama = req.body.nama?.trim() || "";
    const username = req.body.username?.trim() || "";
    const email = req.body.email?.trim().toLowerCase() || "";
    const password = req.body.password || "";
    const no_hp = req.body.no_hp?.trim() || "";
    const alamat = req.body.alamat?.trim() || "";

    // 2. Validasi Kelengkapan
    if (!nama || !username || !email || !password || !no_hp || !alamat) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // 3. Validasi Format Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    // 4. Validasi Panjang Password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    // 5. Cek Duplikasi Email/Username
    const [existingUser] = await connection.query(
      "SELECT id_users FROM ms_users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email atau username sudah digunakan",
      });
    }

    // 6. Hash Password & Set Role
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ROLE.KUSTOMER;

    // 7. Simpan ke Database
    await connection.query(
      `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nama, username, hashedPassword, email, no_hp, alamat, role]
    );

    return res.status(201).json({ message: "Registrasi berhasil" });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = registerCustomer;
