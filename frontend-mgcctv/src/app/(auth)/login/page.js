"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Eye, EyeOff, Mail, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AUTH_API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/beranda";
  
  const [isMounted, setIsMounted] = useState(false);
  const [localToken, setLocalToken] = useState(null);
  const [localRole, setLocalRole] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  
  // State khusus untuk memicu Modal Lupa Sandi
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);

  const [form, setForm] = useState({
    identifier: "", 
    password: "",
  });

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    setLocalToken(token);
    setLocalRole(role);
  }, []);

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

  const handleGoogleLogin = useCallback(
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

        localStorage.removeItem("mgcctv-cart");
        localStorage.removeItem("mgcctv-checkout");
        window.dispatchEvent(new Event("cart-updated"));

        if (userRole === "admin" || userRole === "superadmin") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } catch {
        setError("Google login gagal. Periksa koneksi Anda.");
      }
    },
    [redirectTo, router]
  );

  useEffect(() => {
    if (localToken) {
      return;
    }

    const interval = setInterval(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "622310987018-nqqfd9cohvga8gam4273afcegl77pjr3.apps.googleusercontent.com",
          callback: handleGoogleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          {
            theme: "filled_blue",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill", 
          }
        );

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [handleGoogleLogin, localToken]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordSuccess(false);
    setForgotPasswordError("");
    setForgotPasswordEmail(form.identifier.includes("@") ? form.identifier : "");
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false);
    setForgotPasswordSuccess(false);
    setForgotPasswordError("");
    setForgotPasswordSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setIsSubmitting(false);
        return;
      }

      const userRole = (data.role || "pelanggan").toLowerCase();

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", userRole);
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.removeItem("mgcctv-cart");
      localStorage.removeItem("mgcctv-checkout");
      window.dispatchEvent(new Event("cart-updated"));

      if (userRole === "admin" || userRole === "superadmin") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError("Gagal terhubung ke server. Periksa jaringan Anda.");
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSubmitting(true);

    try {
      const res = await fetch(`${AUTH_API_URL}/lupa-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setForgotPasswordError(data.message || "Gagal mengirim email reset password.");
        return;
      }

      setForgotPasswordSuccess(true);
    } catch {
      setForgotPasswordError("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  if (!isMounted || localToken) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <LoaderCircle className="animate-spin text-blue-600" size={24} />
        <span className="font-medium">Memverifikasi sesi...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-0 font-sans sm:p-8 overflow-hidden">
      
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] hidden sm:block"></div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[120px] hidden sm:block"></div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col overflow-hidden bg-white sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-slate-200 lg:flex-row">
        
        <div className="relative hidden w-full bg-slate-900 lg:block lg:w-5/12 xl:w-1/2">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            src="/images/bg login.jpg"
            alt="Keamanan CCTV"
          />
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
          
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12 text-left text-white">
            <span className="mb-5 inline-flex w-fit items-center rounded-full border border-blue-400/30 bg-blue-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md">
              Selamat Datang Kembali
            </span>
            
            <h2 className="mb-4 text-3xl font-extrabold leading-tight xl:text-4xl">
              Akses Kendali<br/>Dalam Genggaman.
            </h2>
            <p className="max-w-sm text-sm text-slate-300 leading-relaxed">
              Masuk untuk melanjutkan aktivitas pemantauan dan kelola pesanan CCTV Anda dengan mudah.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-6 py-10 sm:p-10 lg:w-7/12 xl:w-1/2 lg:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Log In
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Masukkan username atau email dan password Anda.
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

          <form onSubmit={handleLogin} className="space-y-5" suppressHydrationWarning>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username / Email</label>
              <input
                type="text"
                name="identifier"
                placeholder="Masukkan username atau email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                onChange={handleChange}
                value={form.identifier}
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  onChange={handleChange}
                  value={form.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute bottom-0 right-3 top-0 flex items-center text-slate-400 transition-colors hover:text-blue-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-6 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  Memproses...
                </span>
              ) : (
                "Masuk Sekarang"
              )}
            </button>

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-full bg-slate-200"></div>
                <p className="text-center text-xs font-semibold text-slate-400 whitespace-nowrap">ATAU MASUK DENGAN</p>
                <div className="h-px w-full bg-slate-200"></div>
              </div>

              <div className="flex w-full justify-center px-4 py-2 transition-all hover:opacity-90">
                <div id="googleBtn" className="shadow-sm hover:shadow-md transition-shadow rounded-full"></div>
              </div>
            </div>
            
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Belum memiliki akun?{" "}
            <Link href="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-800">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>

      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-8">
            <button
              type="button"
              onClick={closeForgotPasswordModal}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Tutup modal lupa password"
            >
              <X size={18} />
            </button>

            {forgotPasswordSuccess ? (
              <div className="pt-4 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/60">
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Berhasil
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Instruksi reset password telah dikirim ke{" "}
                  <span className="font-semibold text-slate-700">{forgotPasswordEmail || "email Anda"}</span>.
                </p>
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 pr-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60">
                    <Mail size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Lupa Password?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Masukkan email akun Anda, lalu kami kirimkan instruksi reset password.
                  </p>
                </div>

                {forgotPasswordError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {forgotPasswordError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Akun</label>
                    <input
                      type="email"
                      placeholder="Contoh: user@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      value={forgotPasswordEmail}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordSubmitting}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      {forgotPasswordSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                          Mengirim...
                        </span>
                      ) : (
                        "Kirim Link Reset"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
