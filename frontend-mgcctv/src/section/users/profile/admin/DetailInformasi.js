"use client";
import { Mail, Phone, MapPin } from "lucide-react";
 
function DetailInformasi({ profile }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-6">
        Detail Informasi
      </h2>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Mail size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">
              Email Address
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {profile?.email || "Belum diatur"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <Phone size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">
              Phone Number
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {profile?.no_hp || "Belum diatur"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <MapPin size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">
              Lokasi Cabang
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {profile?.alamat || "Belum diatur"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailInformasi;