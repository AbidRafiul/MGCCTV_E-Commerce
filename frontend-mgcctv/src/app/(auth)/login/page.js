"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // 🔥 GOOGLE INIT
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "622310987018-nqqfd9cohvga8gam4273afcegl77pjr3.apps.googleusercontent.com",
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
  }, []);

  // 🔥 HANDLE GOOGLE LOGIN
  const handleGoogleLogin = async (response) => {
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

      localStorage.setItem("token", data.token);  
      router.push("/beranda");
    } catch (err) {
      setError("Google login gagal");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 LOGIN MANUAL
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

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError("Gagal terhubung ke server");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <img
        src="/images/bg login.jpg"
        alt="bg"
        className="absolute top-1/2 left-1/2 h-[210%] -translate-x-1/2 -translate-y-1/2 rotate-90"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center">

        <h1 className="text-white text-3xl font-bold mb-2">
          Login
        </h1>

        <div className="bg-white/90 backdrop-blur-md w-[350px] p-6 rounded-xl shadow-2xl text-[#0C2C55]">

          <form onSubmit={handleLogin} className="space-y-3">

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-xs text-center">
                {error}
              </p>
            )}

            <div>
              <label className="text-sm">Username</label>
              <input
                type="text"
                name="email"
                placeholder="Masukkan username/email"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Masukkan password"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
              />
            </div>

            {/* 🔥 GOOGLE BUTTON */}
            <div className="flex justify-center">
              <div id="googleBtn"></div>
            </div>

            {/* Separator */}
            <p className="text-center text-xs text-gray-500">atau</p>

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 rounded font-semibold"
            >
              Login
            </button>

          </form>

          <p className="text-center text-xs mt-4">
            Belum memiliki akun?{" "}
            <a href="/register" className="text-blue-600 font-semibold">
              Daftar di sini
            </a>
          </p>

        </div>

      </div>
    </div>
  );
}