"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CircleUserRound, LoaderCircle, ShieldCheck, UserCog } from "lucide-react";
import NavBox from "./NavBox";
import { AUTH_API_URL } from "@/lib/api";


const initialForm = {
  nama: "",
  username: "",
  email: "",
  no_hp: "",
  alamat: "",
};

const parseProfileDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "string") {
    const cleaned = value.trim();

    // ISO / "YYYY-MM-DD HH:mm:ss"
    const normalized = cleaned.includes(" ") ? cleaned.replace(" ", "T") : cleaned;
    const isoParsed = new Date(normalized);
    if (!Number.isNaN(isoParsed.getTime())) {
      return isoParsed;
    }

    // dd-mm-yyyy atau dd/mm/yyyy
    const dmyMatch = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (dmyMatch) {
      const [, day, month, year, hour = "00", minute = "00", second = "00"] = dmyMatch;
      const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    // yyyy-mm-dd atau yyyy/mm/dd
    const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (ymdMatch) {
      const [, year, month, day, hour = "00", minute = "00", second = "00"] = ymdMatch;
      const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const fallbackDate = new Date(value);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

const formatJoinDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = parseProfileDate(dateValue);
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    created_at:
      user.created_at ??
      user.createdAt ??
      user.tanggal_daftar ??
      user.tanggalDaftar ??
      user.registered_at ??
      user.registeredAt ??
      user.join_date ??
      user.joinDate ??
      user.tgl_daftar ??
      null,
  };
};

export default function ProfileHero() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isGoogleAccount = Boolean(profile?.is_google_account);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      handleLogout();
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(`${AUTH_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data profile");
      }

      const rawUser = data?.user ?? data?.data?.user ?? data?.data ?? null;
      const normalizedUser = normalizeProfile(rawUser);

      setProfile(normalizedUser);
      setForm({
        nama: normalizedUser?.nama || "",
        username: normalizedUser?.username || "",
        email: normalizedUser?.email || "",
        no_hp: normalizedUser?.no_hp || "",
        alamat: normalizedUser?.alamat || "",
      });
    } catch (fetchError) {
      if (
        fetchError.message?.toLowerCase().includes("jwt") ||
        fetchError.message?.toLowerCase().includes("token") ||
        fetchError.message?.toLowerCase().includes("unauthorized")
      ) {
        handleLogout();
        return;
      }

      setError(fetchError.message || "Gagal memuat profile");
    } finally {
      setIsLoading(false);
    }
  };

  fetchProfile();
}, [handleLogout]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
      const handleSubmit = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

      try {
          setIsSaving(true);
          setError("");
          setSuccess("");

          const payload = isGoogleAccount
            ? {
                nama: form.nama,
                no_hp: form.no_hp,
                alamat: form.alamat,
              }
            : form;

          const res = await fetch(`${AUTH_API_URL}/profile`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Gagal memperbarui profile");
          }

          const rawUser = data?.user ?? data?.data?.user ?? data?.data ?? null;
          const normalizedUser = normalizeProfile(rawUser);

          setProfile((prev) =>
            normalizeProfile({
              ...prev,
              ...normalizedUser,
            })
          );

          setForm({
            nama: normalizedUser?.nama || "",
            username: normalizedUser?.username || "",
            email: normalizedUser?.email || "",
            no_hp: normalizedUser?.no_hp || "",
            alamat: normalizedUser?.alamat || "",
          });

          setIsEditing(false);
          setSuccess(data.message || "Profile berhasil diperbarui");
        } catch (submitError) {
          setError(submitError.message || "Gagal memperbarui profile");
        } finally {
          setIsSaving(false);
        }
      };

  const handlePrimaryAction = () => {
    setSuccess("");

    if (isEditing) {
      handleSubmit();
      return;
    }

    setIsEditing(true);
  };

  const handleSecondaryAction = () => {
    if (isEditing) {
      setForm({
        nama: profile?.nama || "",
        username: profile?.username || "",
        email: profile?.email || "",
        no_hp: profile?.no_hp || "",
        alamat: profile?.alamat || "",
      });
      setError("");
      setSuccess("");
      setIsEditing(false);
      return;
    }

    if (!isGoogleAccount) {
      router.push("/ubah-password");
    }
  };

  const handleNavigate = (key) => {
    if (key === "logout") {
      handleLogout();
      return;
    }

    if (key === "password") {
      if (isGoogleAccount) {
        return;
      }
      router.push("/ubah-password");
      return;
    }

    if (key === "orders") {
      router.push("/riwayat");
    }
  };

  const fields = [
    { name: "nama", label: "Nama Lengkap", type: "text" },
    { name: "username", label: "Username", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "no_hp", label: "No. Handphone", type: "text" },
    { name: "alamat", label: "Alamat", type: "textarea" },
  ];

  const isFieldEditable = (fieldName) => {
    if (!isEditing) return false;
    if (!isGoogleAccount) return true;
    return fieldName === "nama" || fieldName === "no_hp" || fieldName === "alamat";
  };

  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-32 md:px-8 sm:pt-36 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 px-5 py-2 sm:py-4">
          <h2 className="mb-2 text-2xl font-extrabold text-[#0C2C55] sm:text-3xl">Profile Saya</h2>
          <nav aria-label="Breadcrumb" className="mt-2">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/beranda" className="transition hover:text-slate-800">
                  Beranda
                </Link>
              </li>
              <li>/</li>
              <li className="font-medium text-slate-700">Profile Saya</li>
            </ol>
          </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <NavBox
            activeItem="profile"
            onNavigate={handleNavigate}
            canAccessPassword={!isGoogleAccount}
          />

          <div className="rounded-2xl bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.10)] md:p-8">
            {isLoading ? (
              <div className="flex min-h-[320px] items-center justify-center gap-3 text-slate-500">
                <LoaderCircle className="animate-spin" size={20} />
                <span>Memuat data profile...</span>
              </div>
            ) : (
              <>
                <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] px-5 py-6 md:px-7 md:py-7">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute bottom-0 right-20 h-20 w-20 rounded-full bg-sky-300/10 blur-2xl" />

                  <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                        <CircleUserRound size={32} />
                      </div>

                      <div>
                        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                          Akun Saya
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold text-white md:text-[30px]">
                          {profile?.nama || "Pengguna"}
                        </h3>
                        <p className="mt-1 text-sm text-blue-100/85">
                          Terdaftar Sejak: {formatJoinDate(profile?.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100">
                          <UserCog size={16} />
                          <span className="text-[11px] uppercase tracking-[0.18em]">Status Akun</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {isGoogleAccount ? "Google Account" : "Akun Reguler"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100">
                          <ShieldCheck size={16} />
                          <span className="text-[11px] uppercase tracking-[0.18em]">Keamanan</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {isGoogleAccount ? "Terverifikasi Google" : "Password Aktif"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100">
                          <BadgeCheck size={16} />
                          <span className="text-[11px] uppercase tracking-[0.18em]">Profil</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {profile?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-4 md:p-5">
                  {error ? (
                    <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  ) : null}

                  {isGoogleAccount ? (
                    <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                      Akun Google hanya dapat mengubah nama lengkap, no. handphone, dan alamat. Username dan email mengikuti akun Google Anda.
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {fields.map((field) => {
                      const editable = isFieldEditable(field.name);
                      const disabled = !editable;

                      return (
                      <div
                        key={field.name}
                        className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)] md:items-center"
                      >
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium text-slate-700"
                        >
                          {field.label}
                        </label>

                        {field.type === "textarea" ? (
                          <textarea
                            id={field.name}
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            disabled={disabled}
                            rows={3}
                            className={`min-h-[88px] rounded-lg border px-3 py-2 text-sm outline-none transition ${
                              editable
                                ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-500"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          />
                        ) : (
                          <input
                            id={field.name}
                            name={field.name} 
                            type={field.type}
                            value={form[field.name]}
                            onChange={handleChange}
                            disabled={disabled}
                            className={`rounded-lg border px-3 py-2 text-sm outline-none transition ${
                              editable
                                ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-500"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          />
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={isSaving}
                    className="min-w-[140px] rounded-full bg-[#49a942] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b8d36] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving
                      ? "Menyimpan..."
                      : isEditing
                        ? "Simpan Profil"
                        : "Edit Profil"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    className="min-w-[140px] rounded-full bg-[#9d9d9d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#858585]"
                  >
                    {isEditing ? "Batal" : "Ubah Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
