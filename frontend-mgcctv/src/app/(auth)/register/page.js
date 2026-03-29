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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      <img
        src="/images/bg login.jpg"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex w-full max-w-[320px] flex-col items-center justify-center sm:max-w-[340px]">
        <h1 className="mb-3 text-center text-xl font-bold text-white sm:text-2xl">Registrasi</h1>

        <div className="w-full rounded-xl bg-white/90 p-4 text-[#0C2C55] shadow-2xl backdrop-blur-md sm:p-5">
          <form onSubmit={handleRegister} className="space-y-2.5 sm:space-y-3">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}


            <label className="text-sm font-bold mb-1 block">Nama Lengkap</label>
            <input
              name="nama"
              placeholder="Masukkan nama lengkap"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.nama}
              required
            /> 

            <label className="text-sm font-bold mb-1 block">Username</label>
            <input
              name="username"
              placeholder="Masukkan username"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.username}
              required
            />

              <label className="text-sm font-bold mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Masukkan email"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.email}
              required
            />

            <label className="text-sm font-bold mb-1 block">No Handphone</label>
            <input
              name="no_hp"
              placeholder="Masukkan no handphone"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.no_hp}
              required
            />

            <label className="text-sm font-bold mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Masukkan password"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.password}
              required
              minLength={8}
            />

            <label className="text-sm font-bold mb-1 block">Konfirmasi Password</label>
            <input
              type="password"
              name="confirm_password"
              placeholder="Masukkan kembali password"
              className="w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.confirm_password}
              required
              minLength={8}
            />


            <label className="text-sm font-bold mb-1 block">Alamat</label>
            <textarea
              name="alamat"
              placeholder="Masukkan alamat lengkap"
              className="min-h-[76px] w-full rounded border px-3 py-2 text-[13px] text-[#0C2C55] placeholder-gray-400"
              onChange={handleChange}
              value={form.alamat}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0C2C55] hover:bg-blue-800 transition-colors text-white py-2.5 rounded-lg font-bold shadow-md shadow-blue-900/20"
            >
              {isSubmitting ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs">
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
