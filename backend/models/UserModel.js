const connection = require("../config/database");

const UserModel = {
  // Ambil semua user dengan filter dinamis
  getAll: async (role, status, search) => {
    let query = "SELECT id_users, nama, username, email, no_hp, alamat, role, status, created_at FROM ms_users WHERE 1=1";
    const params = [];

    if (role && role !== "Semua Role") {
      query += " AND role = ?";
      params.push(role);
    }
    
    if (status && status !== "Semua Status") {
      query += " AND status = ?";
      params.push(status);
    }

    if (search) {
      query += " AND (nama LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await connection.query(query, params);
    return rows;
  },

  // Cek apakah email/username sudah digunakan
  checkExisting: async (email, username) => {
    const [rows] = await connection.query(
      "SELECT id_users FROM ms_users WHERE email = ? OR username = ?",
      [email, username]
    );
    return rows;
  },

  // Ambil user spesifik berdasarkan ID
  getById: async (id) => {
    const [rows] = await connection.query("SELECT id_users, role FROM ms_users WHERE id_users = ?", [id]);
    return rows;
  },

  // Tambah user baru ke database
  create: async (data) => {
    const { nama, username, hashedPassword, email, no_hp, alamat, finalRole, finalStatus } = data;
    const [result] = await connection.query(
      `INSERT INTO ms_users 
      (nama, username, password, email, no_hp, alamat, role, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nama, username, hashedPassword, email, no_hp, alamat, finalRole, finalStatus]
    );
    return result;
  },

  // Update data user yang sudah ada
  update: async (id, data) => {
    const { nama, username, email, no_hp, alamat, role, status, hashedPassword } = data;
    let query = "UPDATE ms_users SET nama=?, username=?, email=?, no_hp=?, alamat=?, role=?, status=?";
    const params = [nama, username, email, no_hp, alamat, role, status];

    if (hashedPassword) {
      query += ", password=?";
      params.push(hashedPassword);
    }

    query += " WHERE id_users=?";
    params.push(id);

    const [result] = await connection.query(query, params);
    return result;
  },

  // Hapus user secara permanen
  delete: async (id) => {
    const [result] = await connection.query("DELETE FROM ms_users WHERE id_users = ?", [id]);
    return result;
  }
};

module.exports = UserModel;