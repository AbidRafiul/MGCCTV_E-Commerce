    "use client";

    import { useState } from "react";
    import { toast } from "sonner";
    import { Mail, KeyRound, ShieldCheck, X } from "lucide-react";
    import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    } from "@/components/ui/input-otp";

    // Kita menerima props 'isOpen' dan 'onClose' dari halaman Login
    export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Gunakan email awal dari inputan login (jika ada)
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Jika modal tidak disuruh buka, jangan render apa-apa
    if (!isOpen) return null;

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
            toast.success("Kode OTP terkirim!");
            setStep(2);
        } else toast.error(data.message || "Gagal mengirim OTP");
        } catch {
        toast.error("Terjadi kesalahan jaringan");
        } finally {
        setIsLoading(false);
        }
    };

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
            toast.success("OTP Valid!");
            setStep(3);
        } else toast.error(data.message || "Kode OTP salah");
        } catch {
        toast.error("Terjadi kesalahan jaringan");
        } finally {
        setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return toast.error("Password tidak sama!");
        if (newPassword.length < 6) return toast.error("Minimal 6 karakter");
        setIsLoading(true);
        try {
        const res = await fetch("http://localhost:3000/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp_code: otp, new_password: newPassword }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Password diubah! Silakan login dengan sandi baru.");
            // Tutup modal dan reset state saat berhasil
            handleClose(); 
        } else toast.error(data.message || "Gagal mereset");
        } catch {
        toast.error("Terjadi kesalahan");
        } finally {
        setIsLoading(false);
        }
    };

    // Fungsi untuk mereset data saat modal ditutup
    const handleClose = () => {
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
    };

    return (
        // Background Overlay Gelap
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Kotak Putih Modal */}
        <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Tombol Silang (Tutup) */}
            <button 
            onClick={handleClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
            <X size={20} />
            </button>

            <div className="mb-8 text-center mt-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
                {step === 1 && <Mail size={24} />}
                {step === 2 && <ShieldCheck size={24} />}
                {step === 3 && <KeyRound size={24} />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {step === 1 ? "Lupa Password" : step === 2 ? "Verifikasi OTP" : "Buat Sandi Baru"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
                {step === 1 && "Masukkan email yang terdaftar pada akun Anda."}
                {step === 2 && `OTP dikirim ke ${email}`}
                {step === 3 && "Buat sandi baru untuk akun Anda."}
            </p>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
            <form onSubmit={handleSendEmail} className="space-y-5">
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                />
                <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading ? "Mengirim..." : "Kirim OTP"}
                </button>
            </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                </div>
                <button type="submit" disabled={isLoading || otp.length < 6} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading ? "Cek OTP..." : "Verifikasi"}
                </button>
            </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Sandi Baru"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                required
                />
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik Ulang Sandi"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                required
                />
                <button type="submit" disabled={isLoading} className="w-full mt-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading ? "Menyimpan..." : "Simpan Sandi"}
                </button>
            </form>
            )}

        </div>
        </div>
    );
    }