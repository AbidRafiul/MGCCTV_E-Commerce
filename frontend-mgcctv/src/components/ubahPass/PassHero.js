"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
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
        window.alert("Halaman pesanan saya belum tersedia.");
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
    <section className="min-h-screen bg-[#f5f6f8] px-4 py-10 md:px-8 lg:px-16">
       <div className="mx-auto max-w-6xl">
        <div className="px-5 py-10 mb-8">
          <h2 className="text-2xl font-bold text-indigo-900">Ubah Password</h2>
        <nav aria-label="Breadcrumb" className="mt-2">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/beranda" className="transition hover:text-slate-800">
                Beranda
              </Link>
            </li>
            <li>
              <span className="text-slate-400">/</span>
            </li>
            <li>
              <Link href="/profile" className="transition hover:text-slate-800">
                Profile Saya
              </Link>
            </li>
            <li>
              <span className="text-slate-400">/</span>
            </li>
            <li className="text-slate-900">Ubah Password</li>
          </ol>
        </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <NavBox
            activeItem="password"
            onNavigate={handleNavigate}
            canAccessPassword={!isGoogleAccount}
          />

          <div className="flex-1">
            <div className="rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  Ubah Password
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Masukkan password lama Anda, lalu simpan password baru.
                </p>
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

              <form onSubmit={handleSubmit} className="space-y-6">
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
