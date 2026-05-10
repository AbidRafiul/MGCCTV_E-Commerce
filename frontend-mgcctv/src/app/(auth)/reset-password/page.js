"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { AUTH_API_URL } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Token reset password tidak ditemukan");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${AUTH_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.message || "Gagal mengubah password");
        return;
      }

      setIsSuccess(true);
      toast.success(data.message || "Password berhasil diubah");
      setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
      <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600">
        <ArrowLeft size={16} /> Kembali ke Login
      </Link>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
          {isSuccess ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
          {isSuccess ? "Password Berhasil Diubah" : "Buat Password Baru"}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          {isSuccess
            ? "Anda akan diarahkan kembali ke halaman login."
            : "Masukkan password baru untuk akun MGCCTV Anda."}
        </p>
      </div>

      {!token ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
          Token reset password tidak ditemukan. Silakan minta link reset password baru.
        </div>
      ) : !isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password baru"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Konfirmasi password baru"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      ) : (
        <Link href="/login" className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700">
          Login Sekarang
        </Link>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[120px]"></div>
      <Suspense fallback={<div className="text-sm font-semibold text-slate-500">Memuat halaman reset password...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
