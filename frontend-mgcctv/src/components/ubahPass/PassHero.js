"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, Home, ChevronRight } from "lucide-react";
import NavBox from "./NavBox";
import { AUTH_API_URL } from "@/lib/api";

const initialForm = {
  passwordLama: "",
  passwordBaru: "",
  konfirmasiPassword: "",
};

export default function PassHero() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const checkPasswordAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data profile");
        }

        const user = data?.user ?? null;
        const isGoogleUser = Boolean(user?.is_google_account);

        setIsGoogleAccount(isGoogleUser);

        if (isGoogleUser) {
          router.replace("/profile");
          return;
        }
      } catch {
        handleLogout();
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkPasswordAccess();
  }, [handleLogout]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setSuccess("");

      if (!form.passwordLama || !form.passwordBaru || !form.konfirmasiPassword) {
        setError("Semua field wajib diisi");
        return;
      }

      if (form.passwordBaru !== form.konfirmasiPassword) {
        setError("Password baru dan konfirmasi password tidak cocok");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        setIsSaving(true);

        const res = await fetch(`${AUTH_API_URL}/ubah-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengubah password");
        }

        setSuccess(data.message || "Password berhasil diubah");
        setForm(initialForm);
      } catch (submitError) {
        setError(submitError.message || "Gagal mengubah password");
      } finally {
        setIsSaving(false);
      }
    },
    [form, handleLogout],
  );

  const handleNavigate = useCallback(
    (key) => {
      if (key === "profile") {
        router.push("/profile");
        return;
      }

      if (key === "orders") {
        router.push("/riwayat");
        return;
      }

      if (key === "password") {
        router.push("/ubah-password");
        return;
      }

      if (key === "logout") {
        handleLogout();
      }
    },
    [handleLogout, router],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f5f6f8] text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Memuat data...</span>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-32 md:px-8 sm:pt-36 lg:px-16">
          <div className="mx-auto max-w-5xl relative">
                {/* Ambient Glow */}
                <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
                <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
                  <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
                    Profile
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                    Ubah <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Password</span>
                  </h1>
                  
                  {/* Breadcrumb Modern */}
                  <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
                    <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
                      <Home size={14} className="mb-[1px]" />
                      Beranda
                    </Link>
                    <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
                    <Link href="/produk" className="hover:text-blue-600 transition-colors shrink-0">
                      Ubah Password
                    </Link>
                  </nav>
                </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <NavBox
            activeItem="password"
            onNavigate={handleNavigate}
            canAccessPassword={!isGoogleAccount}
          />

          <div className="flex-1">
            <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] px-6 py-7 md:px-8 md:py-8">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 right-20 h-20 w-20 rounded-full bg-sky-300/10 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                      Keamanan Akun
                    </span>
                    <h1 className="mt-3 text-2xl font-bold text-white md:text-[30px]">
                      Ubah password 
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                      Masukkan password lama Anda, lalu simpan password baru anda.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sky-100">
                        <ShieldCheck size={16} />
                        <span className="text-[11px] uppercase tracking-[0.18em]">Proteksi</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">Password terenkripsi</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sky-100">
                        <KeyRound size={16} />
                        <span className="text-[11px] uppercase tracking-[0.18em]">Saran</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">Gunakan minimal 8 karakter</p>
                    </div>
                  </div>
                </div>
              </div>

             
                 
                

                {error ? (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="passwordLama"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Password Lama
                      </label>
                      <input
                        type="password"
                        id="passwordLama"
                        name="passwordLama"
                        value={form.passwordLama}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Masukkan password lama"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="passwordBaru"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Password Baru
                      </label>
                      <input
                        type="password"
                        id="passwordBaru"
                        name="passwordBaru"
                        value={form.passwordBaru}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Masukkan password baru"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="konfirmasiPassword"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Konfirmasi Password
                      </label>
                      <input
                        type="password"
                        id="konfirmasiPassword"
                        name="konfirmasiPassword"
                        value={form.konfirmasiPassword}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <LoaderCircle className="animate-spin" size={16} />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Perubahan</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForm(initialForm);
                        setError("");
                        setSuccess("");
                      }}
                      className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>  
     


   </section>
  );
}
