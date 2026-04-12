const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel");
const { ROLE } = require("../../utils/role");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleLoginError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(error.status || 500).json({
    message: error.message || fallbackMessage,
  });
};

const generateUniqueUsername = async (email) => {
  let baseUsername = email.split("@")[0].toLowerCase();
  baseUsername = baseUsername.replace(/[^a-z0-9._]/g, "");

  let finalUsername = baseUsername || "user";
  let counter = 1;

  while (true) {
    const existingUser = await AuthModel.findUserByEmailOrUsername(null, finalUsername);
    if (existingUser.length === 0) {
      return finalUsername;
    }

    finalUsername = `${baseUsername || "user"}${counter}`;
    counter += 1;
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Credential Google wajib diisi" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(401).json({ message: "Email Google belum diverifikasi" });
    }

    const email = payload.email.toLowerCase().trim();
    const nama = payload.name;
    const google_id = payload.sub; // MENGAMBIL GOOGLE ID DARI PAYLOAD

    const existingUser = await AuthModel.findUserByEmail(email);

    let userData;

    if (existingUser.length === 0) {
      const role = ROLE.KUSTOMER;

      const [result] = await connection.query(
        `INSERT INTO ms_users (nama, email, role, created_at) VALUES (?,?,?, NOW())`,
        [nama, email, role]
      );

      userData = { id_users: result.insertId, role };
    } else {
      userData = existingUser[0];
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

    return res.status(200).json({
      message: "Login Google berhasil",
      token,
      role: userData.role,
      username: userData.username,
      email: userData.email,
    });
  } catch (error) {
    return handleGoogleLoginError(res, error, "Google login gagal");
  }
};

module.exports = googleLogin;
