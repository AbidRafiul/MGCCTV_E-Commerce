"use client";

import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";
import { AUTH_API_URL } from "@/lib/api";
import Swal from "sweetalert2";

export default function EditProfileModal({ isOpen, onClose, profileData, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: "",
    username: "",
    email: "",
    no_hp: "",
    alamat: "",
  });

  useEffect(() => {
    if (isOpen && profileData) {
      setEditForm({
        nama: profileData.nama || "",
        username: profileData.username || "",
        email: profileData.email || "",
        no_hp: profileData.no_hp || "",
        alamat: profileData.alamat || "",
      });
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${AUTH_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil!", "Profil berhasil diperbarui.", "success");
        onSuccess(); 
        onClose();   
      } else {
        Swal.fire("Gagal", data.message || "Gagal mengupdate profil", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan pada server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Edit size={18} className="text-blue-600" /> Edit Profil
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Nama Lengkap</label>
              <input 
                type="text" required
                value={editForm.nama} onChange={(e) => setEditForm({...editForm, nama: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Username</label>
              <input 
                type="text" required
                value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Email</label>
              <input 
                type="email" required
                value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">No. Handphone</label>
              <input 
                type="text" required
                value={editForm.no_hp} onChange={(e) => setEditForm({...editForm, no_hp: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase">Alamat Lengkap</label>
            <textarea 
              rows="3" required
              value={editForm.alamat} onChange={(e) => setEditForm({...editForm, alamat: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-md flex items-center gap-2"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}