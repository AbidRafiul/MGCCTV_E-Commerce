"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { AUTH_API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Email wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${AUTH_API_URL}/lupa-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.message || "Gagal mengirim email reset password");
        return;
      }

      setIsSent(true);
      toast.success(data.message || "Instruksi reset password telah dikirim");
    } catch (error) {
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600">
          <ArrowLeft size={16} /> Kembali ke Login
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
            {isSent ? <Send size={28} /> : <Mail size={28} />}
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            {isSent ? "Cek Email Anda" : "Lupa Password?"}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            {isSent
              ? `Kami telah mengirim link reset password ke ${email}. Link berlaku selama 1 jam.`
              : "Masukkan email akun MGCCTV Anda. Kami akan mengirim link untuk membuat password baru."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="w-full rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
            >
              Gunakan Email Lain
            </button>
            <Link href="/login" className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700">
              Kembali ke Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
