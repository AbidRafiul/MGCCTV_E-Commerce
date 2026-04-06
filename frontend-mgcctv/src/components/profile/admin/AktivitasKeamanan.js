"use client";
import { useState, useEffect } from "react";
import { formatLastLogin, timeAgo } from "@/utils/dateFormatter";

function AktivitasKeamanan({ profile }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-6">
        Aktivitas Keamanan
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Login Terakhir</p>
            <p className="text-xs text-blue-500">{formatLastLogin(profile?.last_login)}</p>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
            Aman
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Password Diubah</p>
            <p className="text-xs text-slate-500">{timeAgo(profile?.password_updated_at)}</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
            {profile?.updated_at ? "Perbarui" : "Diperbarui"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AktivitasKeamanan