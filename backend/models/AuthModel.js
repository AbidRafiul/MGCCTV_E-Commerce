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
      created_at,
      password_updated_at,
      last_login,
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
      `UPDATE ms_users SET nama = ?, username = ?, email = ?, no_hp = ?, alamat = ?, updated_at = NOW() WHERE id_users = ?`,
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
    const [result] = await connection.query("UPDATE ms_users SET password = ?,password_updated_at = NOW() WHERE id_users = ?", [hashedPassword, id]);
    return result;
  },

  updateLastLogin: async (id) => {
    const [result] = await connection.query(
      "UPDATE ms_users SET last_login = NOW() WHERE id_users = ?",
      [id]
    );
    return result;
  },

  // --- Fungsi Lupa Sandi (Forgot Password) ---

  checkEmailExists: async (email) => {
    const [rows] = await connection.query("SELECT * FROM ms_users WHERE email = ?", [email]);
    return rows;
  },

  createOtpTableIfNotExists: async () => {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tr_otp (
        id_otp INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expired_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },

  saveOtp: async (email, otpCode, expiredAt) => {
    const [result] = await connection.query(
      "INSERT INTO tr_otp (email, otp_code, expired_at) VALUES (?, ?, ?)",
      [email, otpCode, expiredAt]
    );
    return result;
  },

  getLatestOtp: async (email) => {
    const [rows] = await connection.query(
      "SELECT * FROM tr_otp WHERE email = ? ORDER BY id_otp DESC LIMIT 1",
      [email]
    );
    return rows;
  },

  getOtpByEmailAndCode: async (email, otpCode) => {
    const [rows] = await connection.query(
      "SELECT * FROM tr_otp WHERE email = ? AND otp_code = ? ORDER BY id_otp DESC LIMIT 1",
      [email, otpCode]
    );
    return rows;
  },

  updatePasswordByEmail: async (email, hashedPassword) => {
    const [result] = await connection.query(
      "UPDATE ms_users SET password = ?, password_updated_at = NOW() WHERE email = ?",
      [hashedPassword, email]
    );
    return result;
  },

  deleteOtp: async (email) => {
    const [result] = await connection.query("DELETE FROM tr_otp WHERE email = ?", [email]);
    return result;
  }
};

module.exports = AuthModel;
