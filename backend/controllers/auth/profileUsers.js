const AuthModel = require("../../models/AuthModel"); // Panggil si Koki

const profileUsers = async (req, res) => {
  try {
    // 1. Ambil data profil user saat ini (via Model)
    const user = await AuthModel.getProfileById(req.user.id);

    if (user.length === 0) {
      return res.status(404).json({
        message: "Customer tidak ditemukan",
      });
    }

    // =====================================
    // HANDLE REQUEST: GET PROFILE
    // =====================================
    if (req.method === "GET") {
      return res.json({
        message: "Profile berhasil diambil",
        user: user[0],
      });
    }

    // =====================================
    // HANDLE REQUEST: UPDATE PROFILE
    // =====================================
    if (req.method === "PUT" || req.method === "PATCH") {
      const isPutRequest = req.method === "PUT";
      const { nama, username, email, no_hp, alamat } = req.body;
      const isGoogleAccount = Boolean(user[0].is_google_account);

      // --- Validasi Kelengkapan ---
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

      // --- Validasi Khusus Akun Google ---
      if (isGoogleAccount && (username !== undefined || email !== undefined)) {
        return res.status(400).json({
          message: "Akun Google hanya dapat mengubah nama lengkap, no handphone, dan alamat",
        });
      }

      // --- Siapkan Data Terbaru ---
      const updatedProfile = {
        nama: nama ?? user[0].nama,
        username: isGoogleAccount ? user[0].username : (username ?? user[0].username),
        email: isGoogleAccount ? user[0].email : (email ?? user[0].email),
        no_hp: no_hp ?? user[0].no_hp,
        alamat: alamat ?? user[0].alamat,
      };

      // --- Pengecekan Duplikasi Email & Username (Selain milik sendiri) ---
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
        const conditionsStr = duplicateConditions.join(" OR ");
        const paramsForModel = [...duplicateParams, req.user.id];
        
        // Panggil Model
        const duplicateUser = await AuthModel.checkDuplicateForUpdate(conditionsStr, paramsForModel);

        if (duplicateUser.length > 0) {
          return res.status(400).json({
            message: "Email atau username sudah digunakan",
          });
        }
      }

      // --- Eksekusi Update ke Database (via Model) ---
      await AuthModel.updateProfile(req.user.id, updatedProfile);

      // --- Ambil Data Terbaru untuk dikembalikan ke Frontend ---
      const updatedUser = await AuthModel.getProfileById(req.user.id);

      return res.json({
        message: "Profile berhasil diperbarui",
        user: updatedUser[0],
      });
    }

    return res.status(405).json({
      message: "Method tidak didukung",
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

module.exports = profileUsers;