const AuthModel = require("../../models/AuthModel");

const profileUsers = async (req, res) => {
  try {
    const userRows = await AuthModel.getProfileById(req.user.id);

    if (userRows.length === 0) {
      return res.status(404).json({
        message: "Customer tidak ditemukan",
      });
    }

    const currentUser = userRows[0];

    if (req.method === "GET") {
      return res.json({
        message: "Profile berhasil diambil",
        user: currentUser,
      });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const isPutRequest = req.method === "PUT";
      const { nama, username, email, no_hp, alamat } = req.body;
      const isGoogleAccount = Boolean(currentUser.is_google_account);

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
        nama: nama ?? currentUser.nama,
        username: isGoogleAccount
          ? currentUser.username
          : (username ?? currentUser.username),
        email: isGoogleAccount ? currentUser.email : (email ?? currentUser.email),
        no_hp: no_hp ?? currentUser.no_hp,
        alamat: alamat ?? currentUser.alamat,
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
        const duplicateUser = await AuthModel.checkDuplicateForUpdate(
          duplicateConditions.join(" OR "),
          [...duplicateParams, req.user.id],
        );

        if (duplicateUser.length > 0) {
          return res.status(400).json({
            message: "Email atau username sudah digunakan",
          });
        }
      }

      await AuthModel.updateProfile(req.user.id, updatedProfile);
      const updatedUserRows = await AuthModel.getProfileById(req.user.id);

      return res.json({
        message: "Profile berhasil diperbarui",
        user: updatedUserRows[0],
      });
    }

    return res.status(405).json({
      message: "Method tidak didukung",
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};

module.exports = profileUsers;
