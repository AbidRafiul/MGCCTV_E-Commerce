"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    email: "",
    no_hp: "",
    password: "",
    alamat: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Registrasi berhasil!");
    router.push("/login");

  } catch (error) {
    alert("Gagal koneksi ke server");
  }
};

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* BACKGROUND */}
      <img
        src="/images/bg login.jpg"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center">
        {/* JUDUL */}
        <h1 className="text-white text-3xl font-bold mb-2">REGISTRASI</h1>

        {/* CARD */}
        <div className="bg-white/90 backdrop-blur-md w-[380px] p-6 rounded-xl shadow-2xl text-[#0C2C55]">
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              name="nama"
              placeholder="Nama lengkap"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <input
              name="username"
              placeholder="Username"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <input
              name="no_hp"
              placeholder="No. Handphone"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <textarea
              name="alamat"
              placeholder="Alamat"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 rounded font-semibold transition"
            >
              Daftar
            </button>
          </form>

          <p className="text-center text-xs mt-4">
            Sudah punya akun?{" "}
            <a href="/login" className="text-blue-600 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
