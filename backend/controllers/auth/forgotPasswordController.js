const AuthModel = require("../../models/AuthModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// Konfigurasi nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    // Cek apakah email ada di tabel ms_users
    const users = await AuthModel.checkEmailExists(email);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    // Buat 6 digit angka acak
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Waktu expired (5 menit dari sekarang)
    const expiredAt = new Date(Date.now() + 5 * 60000);

    // Pastikan tabel tr_otp ada
    await AuthModel.createOtpTableIfNotExists();

    // Simpan email, angka OTP, dan waktu expired ke tabel tr_otp
    await AuthModel.saveOtp(email, otpCode, expiredAt);

    // Kirim email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Kode OTP Lupa Sandi - MGCCTV",
      text: `Kode OTP Anda adalah: ${otpCode}\n\nKode ini akan kadaluarsa dalam 5 menit. Mohon jangan bagikan kode ini kepada siapapun.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Kode OTP telah dikirim ke email Anda" });
  } catch (error) {
    console.error("Error forgotPassword:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    if (!email || !otp_code) {
      return res.status(400).json({ message: "Email dan Kode OTP wajib diisi" });
    }

    // Cek di tabel tr_otp
    const otps = await AuthModel.getLatestOtp(email);

    if (otps.length === 0) {
      return res.status(400).json({ message: "OTP tidak ditemukan, silakan request ulang" });
    }

    const otpData = otps[0];
    const now = new Date();

    if (now > new Date(otpData.expired_at)) {
      return res.status(400).json({ message: "Kode OTP sudah kadaluarsa" });
    }

    res.status(200).json({ message: "Kode OTP valid" });
  } catch (error) {
    console.error("Error verifyOTP:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    if (!email || !otp_code || !new_password) {
      return res.status(400).json({ message: "Email, Kode OTP, dan Password Baru wajib diisi" });
    }

    // Validasi ulang OTP
    const otps = await AuthModel.getOtpByEmailAndCode(email, otp_code);

    if (otps.length === 0) {
      return res.status(400).json({ message: "Kode OTP salah" });
    }

    const otpData = otps[0];
    const now = new Date();

    if (otpData.otp_code !== otp_code) {
      return res.status(400).json({ message: "Kode OTP salah" });
    }

    if (now > new Date(otpData.expired_at)) {
      return res.status(400).json({ message: "Kode OTP sudah kadaluarsa" });
    }

    // Hash new_password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password di tabel ms_users
    await AuthModel.updatePasswordByEmail(email, hashedPassword);

    // Hapus data OTP agar tidak bisa dipakai lagi
    await AuthModel.deleteOtp(email);

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Error resetPassword:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  forgotPassword,
  verifyOTP,
  resetPassword,
};
