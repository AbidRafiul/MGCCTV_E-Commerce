"use client";
import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

 function PreferensiNotif() {
  const [toggles, setToggles] = useState({
    pesananBaru: true,
    stokRendah: true,
    pelangganBaru: false,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem("mgcctv_notif_prefs");
    if (savedPrefs) {
      setToggles(JSON.parse(savedPrefs));
    }
  }, []);

  const handleToggle = (key) => {
    setToggles((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      localStorage.setItem("mgcctv_notif_prefs", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6">
        <ShieldCheck size={18} className="text-slate-500" /> Preferensi Notifikasi
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Pesanan Baru</p>
            <p className="text-[11px] text-blue-400">Notifikasi saat ada pesanan masuk</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox" className="sr-only peer"
              checked={toggles.pesananBaru} onChange={() => handleToggle("pesananBaru")}
            />
            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#3A82F6] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>

        <div className="border-t border-slate-100"></div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Stok Rendah</p>
            <p className="text-[11px] text-blue-400">Notifikasi saat stok produk {"<"} 5 unit</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox" className="sr-only peer"
              checked={toggles.stokRendah} onChange={() => handleToggle("stokRendah")}
            />
            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#3A82F6] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>

        <div className="border-t border-slate-100"></div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Pelanggan Baru</p>
            <p className="text-[11px] text-blue-400">Notifikasi registrasi pelanggan baru</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox" className="sr-only peer"
              checked={toggles.pelangganBaru} onChange={() => handleToggle("pelangganBaru")}
            />
            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#3A82F6] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default PreferensiNotif