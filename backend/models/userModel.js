const connection = require("../config/database");
const bcrypt = require("bcrypt");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getAllUsers = async (queryParams = {}) => {
  const { role, status, search } = queryParams;

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

  const [users] = await connection.query(query, params);
  return users;
};

const addAdmin = async (body) => {
  const { nama, username, email, password, no_hp, alamat, role, status } = body;

  const [existing] = await connection.query(
    "SELECT id_users FROM ms_users WHERE email = ? OR username = ?",
    [email, username],
  );

  if (existing.length > 0) {
    throw createHttpError(400, "Email atau username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const finalRole = role || "Admin";
  const finalStatus = status || "Aktif";

  await connection.query(
    `INSERT INTO ms_users 
    (nama, username, password, email, no_hp, alamat, role, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [nama, username, hashedPassword, email, no_hp, alamat, finalRole, finalStatus],
  );

  return { message: "Admin berhasil ditambahkan" };
};

const updateAdmin = async ({ id, body }) => {
  const { nama, username, email, no_hp, alamat, role, status, password } = body;

  const [existing] = await connection.query("SELECT id_users FROM ms_users WHERE id_users = ?", [id]);
  if (existing.length === 0) {
    throw createHttpError(404, "User tidak ditemukan");
  }

  const [duplicateUser] = await connection.query(
    "SELECT id_users FROM ms_users WHERE (email = ? OR username = ?) AND id_users != ?",
    [email, username, id],
  );

  if (duplicateUser.length > 0) {
    throw createHttpError(400, "Email atau username sudah digunakan");
  }

  let query = "UPDATE ms_users SET nama=?, username=?, email=?, no_hp=?, alamat=?, role=?, status=?";
  const params = [nama, username, email, no_hp, alamat, role, status];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += ", password=?";
    params.push(hashedPassword);
  }

  query += " WHERE id_users=?";
  params.push(id);

  await connection.query(query, params);

  return { message: "User berhasil diupdate" };
};

const deleteAdmin = async ({ id, currentUserId }) => {
  const [existing] = await connection.query("SELECT id_users, role FROM ms_users WHERE id_users = ?", [id]);
  if (existing.length === 0) {
    throw createHttpError(404, "User tidak ditemukan");
  }

  const targetRole = existing[0].role?.toLowerCase();

  if (targetRole === "superadmin" && Number(currentUserId) === Number(id)) {
    throw createHttpError(400, "Tidak dapat menghapus akun sendiri");
  }

  try {
    await connection.query("DELETE FROM ms_users WHERE id_users = ?", [id]);
    return { message: "User berhasil dihapus permanen" };
  } catch (dbError) {
    if (dbError.errno === 1451) {
      throw createHttpError(
        400,
        "Gagal dihapus: User ini memiliki riwayat pesanan. Silakan ubah statusnya menjadi Nonaktif melalui menu Edit.",
      );
    }

    throw dbError;
  }
};

module.exports = {
  getAllUsers,
  addAdmin,
  updateAdmin,
  deleteAdmin,
};
