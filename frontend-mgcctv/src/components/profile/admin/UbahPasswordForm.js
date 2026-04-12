"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { AUTH_API_URL } from "@/lib/api";
import Swal from "sweetalert2";

function UbahPasswordForm({ onSuccess, isGoogleAccount = false }) {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire(
        "Oops!",
        "Konfirmasi password tidak sama dengan password baru",
        "error",
      );
    }
    if (passwordForm.newPassword.length < 8) {
      return Swal.fire("Oops!", "Password baru minimal 8 karakter", "warning");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${AUTH_API_URL}/ubah-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordLama: passwordForm.oldPassword,
          passwordBaru: passwordForm.newPassword,
          konfirmasiPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire(
          "Berhasil!",
          data.message || "Password berhasil diubah",
          "success",
        );

        localStorage.removeItem("token");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        Swal.fire("Gagal", data.message || "Gagal mengubah password", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan pada server", "error");
    }
  };

  if (isGoogleAccount) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <KeyRound size={18} className="text-slate-500" /> Pengaturan Password
        </h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-sm font-semibold text-amber-900 mb-1">
            Akun Google tidak menggunakan password lokal
          </p>
          <p className="text-xs leading-5 text-amber-800">
            Password untuk akun ini dikelola langsung oleh Google, jadi form ubah
            password tidak ditampilkan di sini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
        <KeyRound size={18} className="text-slate-500" /> Ubah Password Admin
      </h2>
      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Password Lama
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
            }
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Password Baru
          </label>
          <input
            type="password"
            required
            placeholder="Min. 8 karakter"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            required
            placeholder="Ulangi password baru"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3A82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <KeyRound size={14} /> Ubah Password
          </button>
        </div>
      </form>
    </div>
  );
}

export default UbahPasswordForm;
