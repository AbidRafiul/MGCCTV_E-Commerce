const connection = require("../../config/database");

const getMailer = () => {
  try {
    return require("nodemailer");
  } catch {
    return null;
  }
};

const lupaPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const [users] = await connection.query(
      "SELECT id_users, nama, email, password FROM ms_users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    if (!users[0].password) {
      return res.status(400).json({
        message: "Akun ini menggunakan Google Login dan tidak memakai password lokal",
      });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Simpan OTP terbaru ke tabel tr_otp agar bisa divalidasi pada step reset password berikutnya.
    await connection.query(
      `
      INSERT INTO tr_otp (email, otp_code, expired_at, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [email, otpCode, expiresAt]
    );

    const requiredMailConfig = [
      process.env.SMTP_HOST,
      process.env.SMTP_PORT,
      process.env.SMTP_USER,
      process.env.SMTP_PASS,
    ];

    if (requiredMailConfig.some((value) => !value)) {
      return res.status(500).json({
        message: "Layanan email belum dikonfigurasi di backend",
      });
    }

    const nodemailer = getMailer();
    if (!nodemailer) {
      return res.status(500).json({
        message: "Package nodemailer belum terinstall di backend",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: users[0].email,
      subject: "Reset Password MGCCTV",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h2>Kode OTP Reset Password MGCCTV</h2>
          <p>Halo ${users[0].nama}, gunakan kode OTP berikut untuk mengatur ulang password Anda.</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#eff6ff;color:#1d4ed8;padding:14px 18px;border-radius:10px;display:inline-block;">
            ${otpCode}
          </div>
          <p>Kode ini berlaku selama 10 menit.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Instruksi reset password berhasil dikirim ke email Anda",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengirim email reset password",
      error: error.message,
    });
  }
};

module.exports = lupaPassword;
