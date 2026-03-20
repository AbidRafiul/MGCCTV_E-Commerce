"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_API_URL } from "../../../lib/api";

const initialForm = {
  nama: "",
  username: "",
  email: "",
  no_hp: "",
  password: "",
  alamat: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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

      alert("Registrasi berhasil!");
      router.push("/login");
    } catch {
      setError("Gagal koneksi ke server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      <img
        src="/images/bg login.jpg"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-white text-3xl font-bold mb-2">Registrasi</h1>

        <div className="bg-white/90 backdrop-blur-md w-[380px] p-6 rounded-xl shadow-2xl text-[#0C2C55]">
          <form onSubmit={handleRegister} className="space-y-3">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <input
              name="nama"
              placeholder="Nama lengkap"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.nama}
              required
            />

            <input
              name="username"
              placeholder="Username"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.username}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.email}
              required
            />

            <input
              name="no_hp"
              placeholder="No. Handphone"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.no_hp}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.password}
              required
              minLength={8}
            />

            <textarea
              name="alamat"
              placeholder="Alamat"
              className="w-full border px-3 py-2 rounded text-sm text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.alamat}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 rounded font-semibold transition disabled:opacity-70"
            >
              {isSubmitting ? "Mendaftar..." : "Daftar"}
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
