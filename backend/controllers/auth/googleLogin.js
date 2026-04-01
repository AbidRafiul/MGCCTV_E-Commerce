const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel"); 
const { ROLE } = require("../../utils/role"); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Fungsi cerdas untuk meng-generate username yang belum dipakai
const generateUniqueUsername = async (email) => {
  // 1. Ambil kata sebelum @, contoh: john.doe@gmail.com -> john.doe
  let baseUsername = email.split("@")[0].toLowerCase();
  
  // (Opsional) Hapus karakter aneh jika ada, sisakan huruf, angka, dan titik/underscore
  baseUsername = baseUsername.replace(/[^a-z0-9._]/g, "");

  let isUnique = false;
  let finalUsername = baseUsername;
  let counter = 1;

  // 2. Looping (berulang) cek ke database sampai nemu username yang kosong
  while (!isUnique) {
    // Menggunakan fungsi findUserByEmailOrUsername yang sudah ada di model kamu
    const checkUsername = await AuthModel.findUserByEmailOrUsername(null, finalUsername);
    
    if (checkUsername.length === 0) {
      // Yes! Username ini belum dipakai
      isUnique = true;
    } else {
      // Yah, udah dipakai. Coba tambahkan angka di belakangnya (john.doe1, john.doe2, dst)
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }
  }

  return finalUsername;
};

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
      // JIKA USER BARU: Generate Username unik dari prefix email
      const generatedUsername = await generateUniqueUsername(email);

      // Pastikan ROLE memiliki fallback
      const role = ROLE.KUSTOMER || "pelanggan"; 
      
      // Kirim nama, username cerdas, email, role ke Model
      const result = await AuthModel.registerGoogleUser(nama, generatedUsername, email, role);
      
      userData = { id_users: result.insertId, role, username: generatedUsername, email };
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
    // PENTING: Cetak error ke terminal backend agar mudah dilacak
    console.error("🔴 DEBUG ERROR GOOGLE LOGIN:", error);
    return res.status(401).json({ message: "Google login gagal", error: error.message });
  }
};

module.exports = googleLogin;