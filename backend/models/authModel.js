const connection = require("../config/database");

const AuthModel = {
  // 1. Cek apakah email sudah terdaftar di database
  findUserByEmail: async (email) => {
    const [rows] = await connection.query("SELECT * FROM ms_users WHERE email = ?", [email]);
    return rows;
  },

  // Fungsi baru untuk Login (Bisa pakai Email ATAU Username)
  findUserByIdentifier: async (identifier) => {
    const [rows] = await connection.query(
      "SELECT * FROM ms_users WHERE email = ? OR username = ? LIMIT 1",
      [identifier, identifier] // identifier dikirim 2x untuk mengisi kedua tanda tanya (?)
    );
    return rows;
  },

  // 2. Daftarkan user baru otomatis dari Google Login (Menyimpan google_id, set NULL untuk data yg kosong)
  registerGoogleUser: async (nama, username, email, role, google_id) => {
    const [result] = await connection.query(
      `INSERT INTO ms_users 
      (nama, username, password, email, no_hp, alamat, google_id, role, created_at) 
      VALUES (?, ?, "-", ?, "-", "-", ?, ?, NOW())`,
      [nama, username, email, google_id, role]
    );
    return result;
  },

  // 3. Cek apakah email atau username sudah dipakai (Untuk Register)
  findUserByEmailOrUsername: async (email, username) => {
    const [rows] = await connection.query(
      "SELECT id_users FROM ms_users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    return rows;
  },

  // 4. Daftarkan pelanggan baru (Manual)
  registerCustomer: async (nama, username, hashedPassword, email, no_hp, alamat, role) => {
    const [result] = await connection.query(
      `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nama, username, hashedPassword, email, no_hp, alamat, role]
    );
    return result;
  },

  // 5. Ambil data profil lengkap dengan deteksi akun Google
  getProfileById: async (id) => {
    const PROFILE_SELECT_FIELDS = `
      nama,
      username,
      email,
      no_hp,
      alamat,
      CASE
        WHEN google_id IS NOT NULL THEN TRUE
        ELSE FALSE
      END AS is_google_account,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
    `;
    const [rows] = await connection.query(`SELECT ${PROFILE_SELECT_FIELDS} FROM ms_users WHERE id_users = ?`, [id]);
    return rows;
  },

  // 6. Cek duplikasi email/username saat mau update profil
  checkDuplicateForUpdate: async (conditionsStr, params) => {
    const [rows] = await connection.query(
      `SELECT id_users FROM ms_users WHERE (${conditionsStr}) AND id_users != ?`, 
      params
    );
    return rows;
  },

  // 7. Simpan perubahan profil
  updateProfile: async (id, data) => {
    const { nama, username, email, no_hp, alamat } = data;
    const [result] = await connection.query(
      `UPDATE ms_users SET nama = ?, username = ?, email = ?, no_hp = ?, alamat = ? WHERE id_users = ?`,
      [nama, username, email, no_hp, alamat, id]
    );
    return result;
  },

  // 8. Ambil password user berdasarkan ID (Untuk Ubah Password)
  getPasswordById: async (id) => {
    const [rows] = await connection.query("SELECT password FROM ms_users WHERE id_users = ?", [id]);
    return rows;
  },

  // 9. Update password baru ke database
  updatePassword: async (id, hashedPassword) => {
    const [result] = await connection.query("UPDATE ms_users SET password = ? WHERE id_users = ?", [hashedPassword, id]);
    return result;
  }
};

module.exports = AuthModel;