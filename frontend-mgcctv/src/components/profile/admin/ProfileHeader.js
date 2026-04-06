"use client";
import { Edit } from "lucide-react";

function ProfileHeader({ profile, onEditClick }) {
  const profileInitial = profile?.nama?.charAt(0).toUpperCase() || "A";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "1 Jan 2025";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="h-20 md:h-20 bg-[#3A82F6]"></div>
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 w-full">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#3A82F6] text-white flex items-center justify-center text-3xl md:text-4xl font-bold shadow-sm shrink-0">
            {profileInitial}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-slate-800 tracking-tight">
              {profile?.nama || "Admin MG CCTV"}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5 text-[11px]">
              <span className="font-semibold text-[#3A82F6] bg-blue-50 px-2 py-0.5 rounded-md">
                {profile?.role || "Super Admin"}
              </span>
              <span className="text-[#3A82F6]">
                · Bergabung {joinDate}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#3A82F6] text-[#3A82F6] text-xs font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-sm shrink-0"
        >
          <Edit size={14} /> Edit Profil
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;