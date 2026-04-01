const bcrypt = require("bcrypt");
const { ROLE } = require("../../utils/role");
const AuthModel = require("../../models/AuthModel"); // Panggil si Koki!

const handleRegisterError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const registerCustomerController = async (req, res) => {
  try {
    // 1. Ambil data dan trim input (Logika Controller)
    const nama = req.body.nama?.trim() || "";
    const username = req.body.username?.trim() || "";
    const email = req.body.email?.trim().toLowerCase() || "";
    const password = req.body.password || "";
    const no_hp = req.body.no_hp?.trim() || "";
    const alamat = req.body.alamat?.trim() || "";

    // 2. Validasi Kelengkapan (Logika Controller)
    if (!nama || !username || !email || !password || !no_hp || !alamat) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // 3. Validasi Format Email (Logika Controller)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    // 4. Validasi Panjang Password (Logika Controller)
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    // 5. Cek Duplikasi Email/Username (Lempar ke Model)
    const existingUser = await AuthModel.findUserByEmailOrUsername(email, username);

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email atau username sudah digunakan",
      });
    }

    // 6. Hash Password & Set Role (Logika Controller)
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ROLE.KUSTOMER;

    // 7. Simpan ke Database (Lempar data matang ke Model)
    await AuthModel.registerCustomer(nama, username, hashedPassword, email, no_hp, alamat, role);

    return res.status(201).json({ message: "Registrasi berhasil" });

  } catch (error) {
    return handleRegisterError(res, error, "Server error");
  }
};

module.exports = registerCustomer;
