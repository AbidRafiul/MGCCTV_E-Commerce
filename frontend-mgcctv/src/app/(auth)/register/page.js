"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_API_URL } from "../../../lib/api";
import { LoaderCircle, CheckCircle2, ArrowRight } from "lucide-react";

const initialForm = {
  nama: "",
  username: "",
  email: "",
  no_hp: "",
  password: "",
  confirm_password: "", 
  alamat: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/beranda";

  // State untuk sesi dan loading
  const [isMounted, setIsMounted] = useState(false);
  const [localToken, setLocalToken] = useState(null);
  const [localRole, setLocalRole] = useState(null);

  // State Form
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 1. Ambil data dari Local Storage
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    setLocalToken(token);
    setLocalRole(role);
  }, []);

  // 2. REDIRECT JIKA SUDAH LOGIN (Mencegah user iseng buka /register)
  useEffect(() => {
    if (localToken && localRole) {
      const currentRole = localRole.toLowerCase();
      if (currentRole === "admin" || currentRole === "superadmin") {
        router.replace("/admin");
      } else {
        router.replace(redirectTo);
      }
    }
  }, [localToken, localRole, router, redirectTo]);

  // 3. HANDLE GOOGLE LOGIN/REGISTER
  const handleGoogleAuth = useCallback(
    async (response) => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message);
          return;
        }

        const userRole = (data.role || "pelanggan").toLowerCase();

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", userRole);
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

        // Bersihkan keranjang sisa
        localStorage.removeItem("mgcctv-cart");
        localStorage.removeItem("mgcctv-checkout");
        window.dispatchEvent(new Event("cart-updated"));

        if (userRole === "admin" || userRole === "superadmin") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } catch {
        setError("Autentikasi Google gagal. Periksa koneksi Anda.");
      }
    },
    [redirectTo, router]
  );

  // 4. INISIALISASI TOMBOL GOOGLE
  useEffect(() => {
    if (localToken) return;

    const interval = setInterval(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "622310987018-nqqfd9cohvga8gam4273afcegl77pjr3.apps.googleusercontent.com",
          callback: handleGoogleAuth,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtnRegister"),
          {
            theme: "outline",
            size: "large",
            width: 320, 
            text: "signup_with",
            logo_alignment: "left",
          }
        );

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [handleGoogleAuth, localToken]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Password dan Konfirmasi Password tidak sama!");
      return;
    }

    const normalizedForm = {
      nama: form.nama.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
      password: form.password,
      alamat: form.alamat.trim(),
    };

    if (Object.values(normalizedForm).some((value) => value === "")) {
      setError("Semua field wajib diisi");
      return;
    }

    if (normalizedForm.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal");
        return;
      }

      setIsSuccessModalOpen(true);
      setForm(initialForm);
    } catch {
      setError("Gagal koneksi ke server. Periksa jaringan Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOADING STATE Pengecekan Sesi
  if (!isMounted || localToken) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <LoaderCircle className="animate-spin text-blue-600" size={24} />
        <span className="font-medium">Memverifikasi sesi...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-0 font-sans sm:bg-slate-50 sm:p-8 overflow-hidden">
      
      {/* --- DEKORASI BACKGROUND CAHAYA --- */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] hidden sm:block"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[120px] hidden sm:block"></div>
      {/* ---------------------------------- */}

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col overflow-hidden bg-white sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-slate-200 lg:flex-row">
        
        {/* BAGIAN KIRI: Gambar (Rata Kiri) */}
        <div className="relative hidden w-full bg-slate-900 lg:block lg:w-5/12 xl:w-1/2">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            src="/images/bg login.jpg"
            alt="Keamanan CCTV"
          />
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
          
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12 text-left text-white">
            <span className="mb-5 inline-flex w-fit items-center rounded-full border border-blue-400/30 bg-blue-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md">
              MGCCTV Security
            </span>
            <h2 className="mb-4 text-3xl font-extrabold leading-tight xl:text-4xl">
              Keamanan Ekstra,<br/>Hidup Lebih Tenang.
            </h2>
            <p className="max-w-sm text-sm text-slate-300 leading-relaxed">
              Bergabung sekarang dan pantau aset berharga Anda dari mana saja, kapan saja.
            </p>
          </div>
        </div>

        {/* BAGIAN KANAN: Form */}
        <div className="w-full px-6 py-10 sm:p-10 lg:w-7/12 xl:w-1/2 lg:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Buat Akun Baru
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Lengkapi data di bawah ini untuk memulai.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  name="nama"
                  placeholder="Misal: John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.nama}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Username</label>
                <input
                  name="username"
                  placeholder="johndoe123"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.username}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.email}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">No. Handphone</label>
                <input
                  name="no_hp"
                  placeholder="08123456789"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.no_hp}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.password}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Ulangi password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.confirm_password}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Alamat Lengkap</label>
              <textarea
                name="alamat"
                placeholder="Masukkan alamat pengiriman secara detail..."
                rows="2"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                onChange={handleChange}
                value={form.alamat}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  Memproses...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>

            {/* --- TAMBAHAN: TOMBOL GOOGLE DI REGISTER --- */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-full bg-slate-200"></div>
                <p className="text-center text-xs font-semibold text-slate-400 whitespace-nowrap">ATAU DAFTAR DENGAN</p>
                <div className="h-px w-full bg-slate-200"></div>
              </div>

            <div className="flex w-full justify-center px-4 py-2 transition-all hover:opacity-90">
                <div id="googleBtnRegister" className="shadow-sm hover:shadow-md transition-shadow rounded-full"></div>
              </div>
            </div>
            {/* ------------------------------------------- */}

          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <a href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-800">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-slate-200 sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/70">
              <CheckCircle2 size={34} />
            </div>

            <div className="mt-6 text-center">
              <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                Registrasi Berhasil
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Akun berhasil dibuat
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Data akun Anda sudah tersimpan. Silakan lanjut ke halaman login untuk mulai masuk ke sistem.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
              >
                Ke Halaman Login
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
