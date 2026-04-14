"use client";
import { CalendarDays, Edit, Mail, ShieldCheck } from "lucide-react";

function ProfileHeader({ profile, onEditClick }) {
  const profileInitial = profile?.nama?.charAt(0).toUpperCase() || "A";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "1 Jan 2025";
    
    const emailLabel = profile?.email || "Email belum diatur";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(58,130,246,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(12,44,85,0.16),_transparent_30%)]" />
      <div className="absolute -top-16 right-0 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-sky-100/70 blur-3xl" />

      <div className="relative p-6 md:p-8">
        <div className="rounded-[24px] bg-gradient-to-r from-[#0C2C55] via-[#1554A5] to-[#4E9CFF] p-[1px] shadow-[0_20px_60px_rgba(12,44,85,0.18)]">
          <div className="rounded-[23px] bg-[linear-gradient(135deg,rgba(10,25,47,0.96),rgba(17,71,146,0.92),rgba(78,156,255,0.88))] px-6 py-7 md:px-8 md:py-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
                <div className="relative mx-auto md:mx-0">
                  <div className="absolute inset-0 rounded-full bg-white/25 blur-md" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/15 text-4xl font-bold text-white shadow-lg backdrop-blur-sm md:h-28 md:w-28 md:text-5xl">
                    {profileInitial}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-50 backdrop-blur-sm">
                      Profil 
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                    {profile?.nama || "Admin MG CCTV"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50/85 md:text-[15px]">
                    Kelola identitas akun, informasi kontak pada halaman ini.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 text-sm text-blue-50/90 md:flex-row md:flex-wrap md:items-center">
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <Mail size={16} className="text-cyan-200" />
                      <span className="truncate">{emailLabel}</span>
                    </div>
                    <div className="hidden h-1 w-1 rounded-full bg-white/40 md:block" />
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <CalendarDays size={16} className="text-cyan-200" />
                      <span>Bergabung {joinDate}</span>
                    </div>
                    <div className="hidden h-1 w-1 rounded-full bg-white/40 md:block" />
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <ShieldCheck size={16} className="text-cyan-200" />
                      <span>Akun aktif dan terlindungi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:min-w-[220px] md:items-end">
                <button
                  onClick={onEditClick}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-xs font-bold text-[#0C2C55] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  <Edit size={14} /> Edit Profil
                </button>

                <div className="flex flex-col items-stretch gap-3 md:min-w-[220px] md:items-end text-center">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-100/75">
                      Status
                    </p>
                    <p className=" mt-1 text-sm font-bold text-white ">Aktif</p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
