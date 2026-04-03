const bcrypt = require('bcrypt');
const AuthModel = require('../../models/AuthModel'); // Panggil Koki kita

const ubahPassword = async (req, res) => {
  try {
    const { passwordLama, passwordBaru, konfirmasiPassword } = req.body;

    // --- 1. Validasi Input Dasar ---
    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      return res.status(400).json({
        message: "Password lama, password baru, dan konfirmasi password wajib diisi",
      });
    }

    if (passwordBaru !== konfirmasiPassword) {
      return res.status(400).json({
        message: "Konfirmasi password tidak sama dengan password baru",
      });
    }

    if (passwordBaru.length < 8) {
      return res.status(400).json({
        message: "Password baru minimal 8 karakter",
      });
    }

    // --- 2. Ambil data password lama dari DB via Model ---
    const user = await AuthModel.getPasswordById(req.user.id);

    if (user.length === 0) {
      return res.status(404).json({
        message: "Customer tidak ditemukan",
      });
    }

    // --- BONUS PERLINDUNGAN: Cegah akun Google ganti password ---
    if (!user[0].password) {
      return res.status(400).json({
        message: "Akun Anda terdaftar menggunakan Google dan tidak memerlukan password.",
      });
    }

    // --- 3. Verifikasi Password Lama ---
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordLama,
      user[0].password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Password saat ini tidak sesuai",
      });
    }

    // --- 4. Cegah Password Baru Sama Dengan Yang Lama ---
    const isSamePassword = await bcrypt.compare(passwordBaru, user[0].password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "Password baru tidak boleh sama dengan password lama",
      });
    }

    // --- 5. Hash Password Baru & Simpan via Model ---
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    await AuthModel.updatePassword(req.user.id, hashedPassword);

    return res.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Ubah Password Error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

module.exports = ubahPassword;
