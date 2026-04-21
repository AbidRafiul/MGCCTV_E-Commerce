"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handler Step 1: Kirim Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email wajib diisi");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Kode OTP telah dikirim ke email Anda!");
        setStep(2); // PINDAH KE HALAMAN KOTAK OTP
      } else {
        toast.error(data.message || "Gagal mengirim OTP");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Step 2: Verifikasi OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Masukkan 6 digit OTP");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP Valid! Silakan buat sandi baru.");
        setStep(3); // PINDAH KE HALAMAN BUAT SANDI BARU
      } else {
        toast.error(data.message || "Kode OTP salah");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Password tidak sama!");
    if (newPassword.length < 6) return toast.error("Password minimal 6 karakter");

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp, new_password: newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password berhasil diubah! Silakan login.");
        router.push("/login"); // OTOMATIS KEMBALI KE LOGIN
      } else {
        toast.error(data.message || "Gagal mengubah password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600">
          <ArrowLeft size={16} /> Kembali ke Login
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
            {step === 1 && <Mail size={28} />}
            {step === 2 && <ShieldCheck size={28} />}
            {step === 3 && <KeyRound size={28} />}
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            {step === 1 && "Lupa Password?"}
            {step === 2 && "Verifikasi OTP"}
            {step === 3 && "Buat Sandi Baru"}
          </h1>
          <p className="text-sm text-slate-500">
            {step === 1 && "Masukkan email yang terdaftar pada akun MGCCTV Anda."}
            {step === 2 && `Masukkan 6 digit kode yang telah dikirim ke ${email}`}
            {step === 3 && "Buat sandi baru yang kuat dan mudah diingat."}
          </p>
        </div>

        {/* STEP 1: INPUT EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: INPUT OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>
            <p className="text-center text-sm text-slate-500">
              Salah email? <button type="button" onClick={() => setStep(1)} className="font-semibold text-blue-600 hover:underline">Ganti Email</button>
            </p>
          </form>
        )}

        {/* STEP 3: PASSWORD BARU */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password Baru"
                className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}