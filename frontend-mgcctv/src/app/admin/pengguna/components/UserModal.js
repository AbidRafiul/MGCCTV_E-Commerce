"use client";

import { useState, useEffect } from "react";

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    nama: "", username: "", email: "", no_hp: "", alamat: "", role: "Admin", status: "Aktif", password: ""
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "", username: user.username || "", email: user.email || "", no_hp: user.no_hp || "",
        alamat: user.alamat || "", role: user.role || "Admin", status: user.status || "Aktif", password: "" 
      });
    } else {
      setFormData({ nama: "", username: "", email: "", no_hp: "", alamat: "", role: "Admin", status: "Aktif", password: "" });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = user ? "PUT" : "POST";
    const url = user ? `${API_URL}/api/admin/users/${user.id_users}` : `${API_URL}/api/admin/users`;

    try {
      const dataToSend = { ...formData };
      if (user && !dataToSend.password) delete dataToSend.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      alert("Gagal menghubungi server");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-100 border-dashed">
          <h2 className="text-lg font-bold text-[#0C2C55] flex items-center gap-2">
            Form {user ? 'Edit' : 'Pendaftaran'} Akun
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-2xl p-1 transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-2">Informasi Pribadi</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Aktif</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]"></textarea>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-2">Akses & Status</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Akses</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none">
                  <option value="Admin">Admin</option>
                  <option value="Superadmin">Superadmin</option>
                  <option value="Pelanggan">Pelanggan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none" placeholder={user ? "Kosongkan jika tidak diubah" : "Buat password"} required={!user} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Akun</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-5 sm:px-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white transition-colors">Batal</button>
            <button type="submit" className="bg-[#0C2C55] hover:bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
              {user ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}