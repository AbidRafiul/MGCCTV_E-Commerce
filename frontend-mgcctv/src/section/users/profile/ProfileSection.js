"use client";

import Link from "next/link";
import { BadgeCheck, CircleUserRound, LoaderCircle, ShieldCheck, UserCog, Home, ChevronRight } from "lucide-react";
import NavBox from "@/components/profile/NavBox"; // Path biarkan mengarah ke NavBox

export default function ProfileSection({
  profile, form, isEditing, isLoading, isSaving, error, success,
  isGoogleAccount, handleChange, handlePrimaryAction, handleSecondaryAction,
  handleNavigate, formatJoinDate, fields, isFieldEditable
}) {

  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-32 md:px-8 sm:pt-36 lg:px-16">
      <div className="mx-auto max-w-5xl relative">
        <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
          <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
            Profile
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Detail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Profile</span>
          </h1>

          <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
            <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
              <Home size={14} className="mb-[1px]" /> Beranda
            </Link>
            <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
            <Link href="/profile" className="hover:text-blue-600 transition-colors shrink-0">
              Profile Saya
            </Link>
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
                        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">Akun Saya</span>
                        <h3 className="mt-3 text-2xl font-semibold text-white md:text-[30px]">{profile?.nama || "Pengguna"}</h3>
                        <p className="mt-1 text-sm text-blue-100/85">Terdaftar Sejak: {formatJoinDate(profile?.created_at)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100"><UserCog size={16} /><span className="text-[11px] uppercase tracking-[0.18em]">Status Akun</span></div>
                        <p className="mt-2 text-sm font-semibold text-white">{isGoogleAccount ? "Google Account" : "Akun Reguler"}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100"><ShieldCheck size={16} /><span className="text-[11px] uppercase tracking-[0.18em]">Keamanan</span></div>
                        <p className="mt-2 text-sm font-semibold text-white">{isGoogleAccount ? "Terverifikasi Google" : "Password Aktif"}</p>
                      </div>
                      <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sky-100"><BadgeCheck size={16} /><span className="text-[11px] uppercase tracking-[0.18em]">Profil</span></div>
                        <p className="mt-2 text-sm font-semibold text-white truncate" title={profile?.email || ""}>{profile?.email || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-4 md:p-5">
                  {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                  {success && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
                  {isGoogleAccount && <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">Akun Google hanya dapat mengubah nama lengkap, no. handphone, dan alamat. Username dan email mengikuti akun Google Anda.</div>}

                  <div className="space-y-3">
                    {fields.map((field) => {
                      const editable = isFieldEditable(field.name);
                      return (
                        <div key={field.name} className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                          <label htmlFor={field.name} className="text-sm font-medium text-slate-700">{field.label}</label>
                          {field.type === "textarea" ? (
                            <textarea id={field.name} name={field.name} value={form[field.name]} onChange={handleChange} disabled={!editable} rows={3} className={`min-h-[88px] rounded-lg border px-3 py-2 text-sm outline-none transition ${editable ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-500" : "border-slate-200 bg-slate-50 text-slate-500"}`} />
                          ) : (
                            <input id={field.name} name={field.name} type={field.type} value={form[field.name]} onChange={handleChange} disabled={!editable} className={`rounded-lg border px-3 py-2 text-sm outline-none transition ${editable ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-500" : "border-slate-200 bg-slate-50 text-slate-500"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={handlePrimaryAction} disabled={isSaving} className="min-w-[140px] rounded-full bg-[#49a942] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b8d36] disabled:cursor-not-allowed disabled:opacity-70">
                    {isSaving ? "Menyimpan..." : isEditing ? "Simpan Profil" : "Edit Profil"}
                  </button>
                  {isGoogleAccount && !isEditing ? null : (
                    <button type="button" onClick={handleSecondaryAction} className="min-w-[140px] rounded-full bg-[#9d9d9d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#858585]">
                      {isEditing ? "Batal" : "Ubah Password"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}