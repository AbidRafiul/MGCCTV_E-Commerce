    "use client";

    import { useState } from "react";
    import Link from "next/link";
    import { LoaderCircle, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
    // Pastikan AUTH_API_URL sudah sesuai dengan path milikmu, misal: import { AUTH_API_URL } from "@/lib/api";
    import { AUTH_API_URL } from "../../../lib/api"; 

    export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
        // Endpoint ini perlu kamu siapkan di Backend nantinya
        const res = await fetch(`${AUTH_API_URL}/lupa-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || "Gagal mengirim link reset password.");
            setIsSubmitting(false);
            return;
        }

        setSuccess(true);
        } catch {
        setError("Gagal terhubung ke server. Periksa jaringan Anda.");
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans overflow-hidden">
        {/* Dekorasi Glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[120px]"></div>

        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl ring-1 ring-slate-200 p-8 sm:p-10">
            
            {/* Tombol Kembali */}
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-8">
            <ArrowLeft size={16} />
            Kembali ke Login
            </Link>

            {success ? (
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
                <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Cek Email Anda</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Kami telah mengirimkan instruksi untuk mengatur ulang password ke <span className="font-semibold text-slate-700">{email}</span>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                <Link href="/login" className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-center text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30">
                Kembali ke Login
                </Link>
            </div>
            ) : (
            <>
                <div className="mb-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                    <Mail size={28} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-2">
                    Lupa Password?
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Jangan khawatir. Masukkan email yang terdaftar, dan kami akan mengirimkan link untuk mereset password Anda.
                </p>
                </div>

                {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 text-center">
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Akun</label>
                    <input
                    type="email"
                    placeholder="Contoh: user@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                    {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                        Memproses...
                    </span>
                    ) : (
                    "Kirim Link Reset"
                    )}
                </button>
                </form>
            </>
            )}

        </div>
        </div>
    );
    }