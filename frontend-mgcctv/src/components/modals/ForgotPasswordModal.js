"use client";

import { useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { toast } from "sonner";
import { AUTH_API_URL } from "@/lib/api";

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async (event) => {
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
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <div className="mb-8 mt-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
            {isSent ? <Send size={24} /> : <Mail size={24} />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isSent ? "Cek Email Anda" : "Lupa Password"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {isSent
              ? `Link reset password telah dikirim ke ${email}.`
              : "Masukkan email yang terdaftar pada akun Anda."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSendEmail} className="space-y-5">
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
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Mengerti
          </button>
        )}
      </div>
    </div>
  );
}
