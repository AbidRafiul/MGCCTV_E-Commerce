const { OAuth2Client } = require("google-auth-library");
const connection = require("../../config/database");
const jwt = require("jsonwebtoken");
const { ROLE } = require("../../utils/role"); // Tambahkan ini

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload.email_verified) {
      return res.status(401).json({ message: "Email Google belum diverifikasi" });
    }

    const email = payload.email.toLowerCase().trim();
    const nama = payload.name;

    const [user] = await connection.query("SELECT * FROM ms_users WHERE email = ?", [email]);

    let userData;
    if (user.length === 0) {
      const role = ROLE.KUSTOMER; // Gunakan konstanta

      const [result] = await connection.query(
        `INSERT INTO ms_users (nama, email, role) VALUES (?,?,?)`,
        [nama, email, role]
      );

      userData = { id_users: result.insertId, role };
    } else {
      userData = user[0];
    }

    const token = jwt.sign(
      { id: userData.id_users, role: userData.role, username: userData.username, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ message: "Login Google berhasil", token, role: userData.role, username: userData.username, email: userData.email });
  } catch (error) {
    return res.status(401).json({ message: "Google login gagal", error: error.message });
  }
};

module.exports = googleLogin;