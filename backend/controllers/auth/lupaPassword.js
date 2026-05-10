const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AuthModel = require("../../models/AuthModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const lupaPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const users = await AuthModel.checkEmailExists(email);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    const user = users[0];
    if (!user.password) {
      return res.status(400).json({
        message: "Akun ini menggunakan Google Login dan tidak memakai password lokal",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await AuthModel.savePasswordResetToken(email, resetToken, resetTokenExpiresAt);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password MGCCTV",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2>Reset Password MGCCTV</h2>
          <p>Halo ${user.nama || "Pelanggan"},</p>
          <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
              Reset Password
            </a>
          </p>
          <p>Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <p style="font-size:12px;color:#64748b;">${resetUrl}</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Instruksi reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Error lupaPassword:", error);
    return res.status(500).json({
      message: "Gagal mengirim email reset password",
      error: error.message,
    });
  }
};

module.exports = lupaPassword;
