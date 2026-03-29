const connection = require("../../config/database");

const PROFILE_SELECT_FIELDS = `
  nama,
  username,
  email,
  no_hp,
  alamat,
  CASE
    WHEN password IS NULL OR password = '' THEN TRUE
    ELSE FALSE
  END AS is_google_account,
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
`;

const profileUsers = async (req, res) => {
  try {
    const [user] = await connection.query(
      `SELECT ${PROFILE_SELECT_FIELDS} FROM ms_users WHERE id_users = ?`,
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
      const isGoogleAccount = Boolean(user[0].is_google_account);

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

      if (isGoogleAccount && (username !== undefined || email !== undefined)) {
        return res.status(400).json({
          message: "Akun Google hanya dapat mengubah nama lengkap, no handphone, dan alamat",
        });
      }

      const updatedProfile = {
        nama: nama ?? user[0].nama,
        username: isGoogleAccount ? user[0].username : (username ?? user[0].username),
        email: isGoogleAccount ? user[0].email : (email ?? user[0].email),
        no_hp: no_hp ?? user[0].no_hp,
        alamat: alamat ?? user[0].alamat,
      };

      const duplicateConditions = [];
      const duplicateParams = [];

      if (!isGoogleAccount && updatedProfile.email) {
        duplicateConditions.push("email = ?");
        duplicateParams.push(updatedProfile.email);
      }

      if (!isGoogleAccount && updatedProfile.username) {
        duplicateConditions.push("username = ?");
        duplicateParams.push(updatedProfile.username);
      }

      if (duplicateConditions.length > 0) {
        const [duplicateUser] = await connection.query(
          `SELECT id_users
           FROM ms_users
           WHERE (${duplicateConditions.join(" OR ")}) AND id_users != ?`,
          [...duplicateParams, req.user.id],
        );

        if (duplicateUser.length > 0) {
          return res.status(400).json({
            message: "Email atau username sudah digunakan",
          });
        }
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
        `SELECT ${PROFILE_SELECT_FIELDS} FROM ms_users WHERE id_users = ?`,
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
