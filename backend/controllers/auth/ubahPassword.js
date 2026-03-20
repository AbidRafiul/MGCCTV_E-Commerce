const connection = require ('../../config/database');
const bcrypt = require ('bcrypt');

const ubahPassword = async (req, res) => {
  try {
    const { passwordLama, passwordBaru, konfirmasiPassword } = req.body;

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

    const [user] = await connection.query(
      "SELECT password FROM ms_users WHERE id_users = ?",
      [req.user.id],
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "Customer tidak ditemukan",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      passwordLama,
      user[0].password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Password saat ini tidak sesuai",
      });
    }

    const isSamePassword = await bcrypt.compare(passwordBaru, user[0].password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "Password baru tidak boleh sama dengan password lama",
      });
    }

    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    await connection.query(
      "UPDATE ms_users SET password = ? WHERE id_users = ?",
      [hashedPassword, req.user.id],
    );

    return res.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = ubahPassword;
