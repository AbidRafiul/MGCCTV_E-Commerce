const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel"); 
const { ROLE } = require("../../utils/role"); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // 1. Verifikasi token dari Google
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

    // 2. Cek database melalui Model
    const existingUser = await AuthModel.findUserByEmail(email);

    let userData;
    if (existingUser.length === 0) {
      // Jika user belum ada, daftarkan otomatis via Model
      const role = ROLE.KUSTOMER; 
      const result = await AuthModel.registerGoogleUser(nama, email, role);
      
      userData = { id_users: result.insertId, role, username: null, email };
    } else {
      // Jika sudah ada, ambil datanya
      userData = existingUser[0];
    }

    // 3. Buat Token JWT untuk sesi aplikasi
    const token = jwt.sign(
      { 
        id: userData.id_users, 
        role: userData.role, 
        username: userData.username, 
        email: userData.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ 
      message: "Login Google berhasil", 
      token, 
      role: userData.role, 
      username: userData.username, 
      email: userData.email 
    });
  } catch (error) {
    return res.status(401).json({ message: "Google login gagal", error: error.message });
  }
};

module.exports = googleLogin;