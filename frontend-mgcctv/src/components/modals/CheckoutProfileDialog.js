"use client";

import { useState, useEffect } from "react";
import { User, Phone, MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CheckoutProfileDialog({ isOpen, onClose, profile, onSave }) {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update state saat profil masuk (mengamankan data default)
  useEffect(() => {
    if (profile) {
      setNama(profile.nama || "");
      setNoHp(profile.no_hp === "-" ? "" : profile.no_hp || "");
      setAlamat(profile.alamat === "-" ? "" : profile.alamat || "");
      setIsConfirmed(false);
      setError("");
    }
  }, [profile, isOpen]);

  const handleSave = async () => {
    setError("");
    
    if (!nama.trim() || !noHp.trim() || !alamat.trim()) {
      setError("Semua kolom (Nama, No HP, Alamat) wajib diisi!");
      return;
    }

    if (!isConfirmed) {
      setError("Anda wajib mencentang konfirmasi alamat!");
      return;
    }

    setIsLoading(true);
    const success = await onSave({ nama, no_hp: noHp, alamat });
    setIsLoading(false);
    
    if (success) {
      onClose(); 
    } else {
      setError("Terjadi kesalahan saat menyimpan profil.");
    }
  };

  // onOpenChange digunakan Shadcn untuk mendeteksi klik di luar modal (overlay) atau tombol ESC
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-3xl font-sans gap-0">
        
        {/* Header Shadcn */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            Lengkapi Data Pengiriman
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Pastikan nomor WhatsApp dan alamat akurat untuk memudahkan kurir.
          </DialogDescription>
        </DialogHeader>

        {/* Body / Form */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <User size={16} className="text-slate-400" /> Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              readOnly
              className="w-full bg-slate-100 text-slate-500 py-3 px-4 rounded-xl border border-slate-200 text-sm outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Phone size={16} className="text-slate-400" /> Nomor WhatsApp/HP
            </label>
            <input
              type="number"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="08123456789"
              className="w-full bg-white text-slate-900 py-3 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-sm outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MapPin size={16} className="text-slate-400" /> Alamat Lengkap
            </label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              rows={3}
              placeholder="Nama Jalan, Desa, Kecamatan, Kota, Kodepos"
              className="w-full bg-white text-slate-900 py-3 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-sm outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 bg-white">
          <div className="flex items-start gap-3 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <input
              type="checkbox"
              id="confirm-address"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
            />
            <label
              htmlFor="confirm-address"
              className="text-sm text-slate-600 cursor-pointer select-none leading-relaxed"
            >
              Saya menyatakan bahwa alamat pengiriman di atas sudah <b>benar dan akurat</b>.
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-[2] py-3.5 bg-[#0C2C55] text-white rounded-xl font-bold text-sm hover:bg-[#081e39] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-900/10"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={18} /> Memproses...</> : "Konfirmasi & Lanjutkan"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}