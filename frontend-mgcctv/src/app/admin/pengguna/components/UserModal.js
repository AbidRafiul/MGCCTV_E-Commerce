"use client";

import { useState, useEffect } from "react";

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    no_hp: "",
    alamat: "",
    role: "Admin",
    status: "Aktif",
    password: ""
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        username: user.username || "",
        email: user.email || "",
        no_hp: user.no_hp || "",
        alamat: user.alamat || "",
        role: user.role || "Admin",
        status: user.status || "Aktif",
        password: "" 
      });
    } else {
      setFormData({
        nama: "",
        username: "",
        email: "",
        no_hp: "",
        alamat: "",
        role: "Admin",
        status: "Aktif",
        password: ""
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = user ? "PUT" : "POST";
    const url = user 
      ? `${API_URL}/api/admin/users/${user.id_users}` 
      : `${API_URL}/api/admin/users`;

    try {
      const dataToSend = { ...formData };
      if (user && !dataToSend.password) {
        delete dataToSend.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Terjadi kesalahan saat menyimpan data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Gagal menghubungi server");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Container Modal */}
      <div className="bg-bgSurface w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-borderColor border-dashed">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            Form {user ? 'Edit' : 'Pendaftaran'} Akun
          </h2>
          <button 
            onClick={onClose} 
            className="text-textMuted hover:text-danger text-2xl font-medium leading-none p-1 rounded-md transition-colors"
          >
            &times;
          </button>
        </div>
        
        {/* Body Modal (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Kolom Kiri: Info Pribadi */}
            <div className="space-y-4">
              <h4 className="text-xs text-primary uppercase font-bold tracking-wider mb-2">Informasi Pribadi</h4>
              
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Nama sesuai identitas" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Username untuk login" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Email Aktif</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="contoh@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Nomor Telepon / WA</label>
                <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0812..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Alamat / Kota</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-y" placeholder="Masukkan alamat untuk keperluan instalasi"></textarea>
              </div>
            </div>

            {/* Kolom Kanan: Kredensial */}
            <div className="space-y-4">
              <h4 className="text-xs text-primary uppercase font-bold tracking-wider mb-2">Kredensial & Hak Akses</h4>
              
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Role Akses</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="Admin">Admin</option>
                  <option value="Superadmin">Superadmin</option>
                  <option value="Pelanggan">Pelanggan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={user ? "Kosongkan jika tidak ingin mengubah password" : "Buat password"} required={!user} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Status Akun</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              
              {/* Alert Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6 flex gap-3 items-start">
                <span className="text-xl leading-none">ℹ️</span>
                <p className="text-sm text-blue-800 m-0">Pengguna akan menerima email selamat datang otomatis jika email aktif terdeteksi.</p>
              </div>
            </div>
          </div>
          
          {/* Footer Modal (Sticky Button) */}
          <div className="p-5 sm:px-6 border-t border-borderColor border-dashed bg-bgMain/30 flex justify-end gap-3 mt-auto sticky bottom-0">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-borderColor text-textMain rounded-lg text-sm font-medium hover:bg-bgSurface transition-colors">
              Batal
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              {user ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}