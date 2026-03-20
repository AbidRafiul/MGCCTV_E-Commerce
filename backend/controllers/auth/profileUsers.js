const connection = require("../../config/database");

const profileUsers = async (req, res) => {
  try {
    const [user] = await connection.query(
      "SELECT nama, username, email, no_hp, alamat, created_at FROM ms_users WHERE id_users = ?",
      [req.user.id],
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "Customer tidak ditemukan",
      });
    }

    if (req.method === "GET") {
      return res.json({
        message: "Profile berhasil diambil",
        user: user[0],
      });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const isPutRequest = req.method === "PUT";
      const { nama, username, email, no_hp, alamat } = req.body;

      if (isPutRequest && (!nama || !username || !email || !no_hp || !alamat)) {
        return res.status(400).json({
          message: "Nama, username, email, no_hp, dan alamat wajib diisi",
        });
      }

      if (!isPutRequest && Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: "Minimal semua tabel harus diisi untuk update profile",
        });
      }

      const updatedProfile = {
        nama: nama ?? user[0].nama,
        username: username ?? user[0].username,
        email: email ?? user[0].email,
        no_hp: no_hp ?? user[0].no_hp,
        alamat: alamat ?? user[0].alamat,
      };

      const [duplicateUser] = await connection.query(
        "SELECT id_users FROM ms_users WHERE (email = ? OR username = ?) AND id_users != ?",
        [updatedProfile.email, updatedProfile.username, req.user.id],
      );

      if (duplicateUser.length > 0) {
        return res.status(400).json({
          message: "Email atau username sudah digunakan",
        });
      }

      await connection.query(
        `UPDATE ms_users
        SET nama = ?, username = ?, email = ?, no_hp = ?, alamat = ?
        WHERE id_users = ?`,
        [
          updatedProfile.nama,
          updatedProfile.username,
          updatedProfile.email,
          updatedProfile.no_hp,
          updatedProfile.alamat,
          req.user.id,
        ],
      );

      const [updatedUser] = await connection.query(
        "SELECT nama, username, email, no_hp, alamat FROM ms_users WHERE id_users = ?",
        [req.user.id],
      );

      return res.json({
        message: "Profile berhasil diperbarui",
        user: updatedUser[0],
      });
    }

    return res.status(405).json({
      message: "Method tidak didukung",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = profileUsers;
