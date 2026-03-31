"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/beranda";
  
  // State untuk mencegah Hydration Error
  const [isMounted, setIsMounted] = useState(false);
  const [localToken, setLocalToken] = useState(null);
  const [localRole, setLocalRole] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Ambil data dari Local Storage HANYA di sisi Client
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    setLocalToken(token);
    setLocalRole(role);
  }, []);

  // REDIRECT JIKA SUDAH LOGIN
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

  // HANDLE GOOGLE LOGIN
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

        if (userRole === "admin" || userRole === "superadmin") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } catch {
        setError("Google login gagal");
      }
    },
    [redirectTo, router]
  );

  // GOOGLE INIT
  useEffect(() => {
    // Ubah pengecekan menggunakan localToken
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
            theme: "outline",
            size: "large",
            width: 300,
          }
        );

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [handleGoogleLogin, localToken]); // Dependency diubah ke localToken

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN MANUAL
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

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
        return;
      }

      const userRole = (data.role || "pelanggan").toLowerCase();

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", userRole);
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      if (userRole === "admin" || userRole === "superadmin") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError("Gagal terhubung ke server");
    }
  };

  // LOADING STATE
  if (!isMounted || localToken) {
    return (
      <div className=" flex min-h-screen items-center justify-center gap-3 bg-[#f5f6f8] text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        <span className="font-medium">Memuat halaman...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      {/* BACKGROUND */}
      <img
        src="/images/bg login.jpg"
        alt="bg"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex w-full max-w-[320px] flex-col items-center justify-center sm:max-w-[340px]">
        <h1 className="mb-4 text-center text-xl font-bold text-white sm:text-2xl">Login</h1>

        <div className="w-full rounded-xl bg-white/95 p-4 text-[#0C2C55] shadow-2xl backdrop-blur-md sm:p-5">
          <form onSubmit={handleLogin} className="space-y-3" suppressHydrationWarning>
            {/* ERROR */}
            {error && (
              <div className="bg-red-50 text-red-500 text-xs text-center font-bold py-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-bold mb-1 block">Username / Email</label>
              <input
                type="text"
                name="email"
                placeholder="Masukkan username/email"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                onChange={handleChange}
                required
              />
            </div>

            {/* GOOGLE BUTTON */}
            <div className="flex justify-center pt-2">
              <div id="googleBtn" className="w-full overflow-hidden rounded-lg"></div>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3 py-2">
              <div className="h-px w-full bg-slate-200"></div>
              <p className="text-center text-xs font-semibold text-slate-400">atau</p>
              <div className="h-px w-full bg-slate-200"></div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#0C2C55] py-2.5 text-[13px] font-bold text-white shadow-md shadow-blue-900/20 transition-colors hover:bg-blue-800"
            >
              Masuk
            </button>
          </form>

          <p className="mt-4 text-center text-xs font-medium text-slate-500">
            Belum memiliki akun?{" "}
            <a href="/register" className="text-blue-600 font-bold hover:underline">
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
