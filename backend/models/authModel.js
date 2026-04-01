const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../config/database");
const { ROLE } = require("../utils/role");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const findUserByEmail = async (email) => {
  const [rows] = await connection.query("SELECT * FROM ms_users WHERE email = ?", [email]);
  return rows;
};

const findProfileByUserId = async (userId) => {
  const [rows] = await connection.query(
    `SELECT ${PROFILE_SELECT_FIELDS} FROM ms_users WHERE id_users = ?`,
    [userId],
  );

  if (rows.length === 0) {
    throw createHttpError(404, "Customer tidak ditemukan");
  }

  return rows[0];
};

const loginUsers = async (body) => {
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";

  if (!email || !password) {
    throw createHttpError(400, "Email dan password wajib diisi");
  }

  const users = await findUserByEmail(email);
  if (users.length === 0) {
    throw createHttpError(401, "Email atau password salah");
  }

  const user = users[0];

  if (!user.password) {
    throw createHttpError(
      401,
      "Akun ini terdaftar menggunakan Google. Silakan login dengan tombol Google.",
    );
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    throw createHttpError(401, "Email atau password salah");
  }

  const token = jwt.sign(
    {
      id: user.id_users,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    message: "Login berhasil",
    token,
    role: user.role,
  };
};

const registerCustomer = async (body) => {
  const nama = body?.nama?.trim() || "";
  const username = body?.username?.trim() || "";
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const no_hp = body?.no_hp?.trim() || "";
  const alamat = body?.alamat?.trim() || "";

  if (!nama || !username || !email || !password || !no_hp || !alamat) {
    throw createHttpError(400, "Semua field wajib diisi");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createHttpError(400, "Format email tidak valid");
  }

  if (password.length < 8) {
    throw createHttpError(400, "Password minimal 8 karakter");
  }

  const [existingUser] = await connection.query(
    "SELECT id_users FROM ms_users WHERE email = ? OR username = ? LIMIT 1",
    [email, username],
  );

  if (existingUser.length > 0) {
    throw createHttpError(400, "Email atau username sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.query(
    `INSERT INTO ms_users (nama, username, password, email, no_hp, alamat, role, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [nama, username, hashedPassword, email, no_hp, alamat, ROLE.KUSTOMER],
  );

  return { message: "Registrasi berhasil" };
};

const googleLogin = async (body) => {
  const credential = body?.credential;

  if (!credential) {
    throw createHttpError(400, "Credential Google wajib diisi");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw createHttpError(401, "Email Google belum diverifikasi");
  }

  const email = payload.email.toLowerCase().trim();
  const nama = payload.name;

  const users = await findUserByEmail(email);

  let userData;
  if (users.length === 0) {
    const [result] = await connection.query(
      "INSERT INTO ms_users (nama, email, role, created_at) VALUES (?, ?, ?, NOW())",
      [nama, email, ROLE.KUSTOMER],
    );

    userData = {
      id_users: result.insertId,
      role: ROLE.KUSTOMER,
      username: null,
      email,
    };
  } else {
    userData = users[0];
  }

  const token = jwt.sign(
    {
      id: userData.id_users,
      role: userData.role,
      username: userData.username,
      email: userData.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    message: "Login Google berhasil",
    token,
    role: userData.role,
    username: userData.username,
    email: userData.email,
  };
};

const logoutCustomer = async () => ({ message: "Logout berhasil" });

const updateProfileByUserId = async ({ userId, method, body }) => {
  const existingUser = await findProfileByUserId(userId);
  const isPutRequest = method === "PUT";
  const isGoogleAccount = Boolean(existingUser.is_google_account);
  const { nama, username, email, no_hp, alamat } = body;

  if (isPutRequest && (!nama || !username || !email || !no_hp || !alamat)) {
    throw createHttpError(400, "Nama, username, email, no_hp, dan alamat wajib diisi");
  }

  if (!isPutRequest && Object.keys(body).length === 0) {
    throw createHttpError(400, "Minimal semua tabel harus diisi untuk update profile");
  }

  if (isGoogleAccount && (username !== undefined || email !== undefined)) {
    throw createHttpError(
      400,
      "Akun Google hanya dapat mengubah nama lengkap, no handphone, dan alamat",
    );
  }

  const updatedProfile = {
    nama: nama ?? existingUser.nama,
    username: isGoogleAccount ? existingUser.username : (username ?? existingUser.username),
    email: isGoogleAccount ? existingUser.email : (email ?? existingUser.email),
    no_hp: no_hp ?? existingUser.no_hp,
    alamat: alamat ?? existingUser.alamat,
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
      [...duplicateParams, userId],
    );

    if (duplicateUser.length > 0) {
      throw createHttpError(400, "Email atau username sudah digunakan");
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
      userId,
    ],
  );

  return findProfileByUserId(userId);
};

const updatePassword = async ({ userId, currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createHttpError(
      400,
      "Password lama, password baru, dan konfirmasi password wajib diisi",
    );
  }

  if (newPassword !== confirmPassword) {
    throw createHttpError(400, "Konfirmasi password tidak sama dengan password baru");
  }

  if (newPassword.length < 8) {
    throw createHttpError(400, "Password baru minimal 8 karakter");
  }

  const [users] = await connection.query("SELECT password FROM ms_users WHERE id_users = ?", [userId]);
  if (users.length === 0) {
    throw createHttpError(404, "User tidak ditemukan");
  }

  const user = users[0];
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password || "");
  if (!isPasswordValid) {
    throw createHttpError(400, "Password saat ini tidak sesuai");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password || "");
  if (isSamePassword) {
    throw createHttpError(400, "Password baru tidak boleh sama dengan password lama");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await connection.query("UPDATE ms_users SET password = ? WHERE id_users = ?", [
    hashedNewPassword,
    userId,
  ]);

  return { message: "Password berhasil diubah" };
};

module.exports = {
  loginUsers,
  registerCustomer,
  googleLogin,
  logoutCustomer,
  findProfileByUserId,
  updateProfileByUserId,
  updatePassword,
};
