"use client";

import { useState, useEffect } from "react";
import UserModal from "./components/UserModal";
import Swal from 'sweetalert2';

export default function DataPenggunaPage() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State untuk Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchUsers = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Cukup panggil res.json() SATU KALI saja
        const data = await res.json();
        setUsers(data);
        console.log("Data dari backend:", data); // Log ini pasti akan muncul sekarang
      } else {
        console.error("Response gagal dari server");
      }
    } catch (e) {
      console.error("Error saat fetch:", e);
    }
  };

  useEffect(() => {
    const loginAndFetch = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "superadmin@mgcctv.com", password: "superadmin123" })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          fetchUsers(data.token);
        }
      } catch (e) {
        console.error("Login failed", e);
      }
    };
    loginAndFetch();
  }, [API_URL]);

  const refreshData = () => {
    const token = localStorage.getItem("token");
    if (token) fetchUsers(token);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

const deleteUser = async (id) => {
    // 1. Pop-up Konfirmasi
    Swal.fire({
      title: 'Hapus Pengguna?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      
      // Jika tombol "Ya" diklik
      if (result.isConfirmed) {
        try {
          // Ganti port sesuaikan dengan environment kamu
          const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
            method: "DELETE",
            // Jangan lupa kirim token JWT di headers agar tidak ditolak backend
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          
          const data = await res.json();

          if (!res.ok) {
            // 2. Pop-up Error (Misal: karena ada riwayat transaksi)
            Swal.fire({
              title: 'Gagal Dihapus!',
              text: data.message,
              icon: 'error',
              confirmButtonColor: '#0C2C55'
            });
            return;
          }

          // 3. Pop-up Sukses
          Swal.fire({
            title: 'Terhapus!',
            text: data.message,
            icon: 'success',
            confirmButtonColor: '#0C2C55'
          });

          // Panggil fungsi untuk refresh/fetch ulang tabel data pengguna di sini
          // fetchUsers(); 
          
        } catch (error) {
          Swal.fire('Error!', 'Terjadi kesalahan jaringan ke server.', 'error');
        }
      }
    });
  };
const formatDate = (dateStr) => {
    if (!dateStr) return "-"; 
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-"; 
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };
  // Logika Filter
  const filteredUsers = users.filter(user => {
    const matchSearch = user.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Semua Role" || user.role === roleFilter;
    const matchStatus = statusFilter === "Semua Status" || user.status === statusFilter;
    
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Data Pengguna</h1>
          <p className="text-sm text-textMuted mt-1">Manajemen data admin dan pelanggan</p>
        </div>
      </div>

{/* Filter Bar */}
      <div className="bg-bgSurface p-4 rounded-xl shadow-sm border border-borderColor flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
        {/* Grup Input Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
          <input 
            type="text" 
            placeholder="Cari nama/email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto sm:flex-1 min-w-[200px] px-4 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
          />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="Semua Role">Semua Role</option>
            <option value="Superadmin">Superadmin</option>
            <option value="Admin">Admin</option>
            <option value="Pelanggan">Pelanggan</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
        
        {/* Tombol Tambah */}
        <button 
          onClick={openAddModal} 
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap sm:w-auto w-full flex justify-center"
        >
          + Tambah Admin
        </button>
      </div>

      {/* Tabel Card */}
        <div className="bg-bgSurface border border-borderColor rounded-xl shadow-sm overflow-hidden">
          {/* Tab Header & Export */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-borderColor px-2 sm:px-6">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 min-w-max">
                <div className={`pb-3 pt-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${roleFilter === 'Semua Role' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`} onClick={() => setRoleFilter('Semua Role')}>Semua Pengguna ({users.length})</div>
                <div className={`pb-3 pt-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${roleFilter === 'Admin' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`} onClick={() => setRoleFilter('Admin')}>Admin ({users.filter(u => u.role === 'Admin').length})</div>
                <div className={`pb-3 pt-4 text-sm font-medium border-b-2 cursor-pointer transition-colors ${roleFilter === 'Pelanggan' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textMain'}`} onClick={() => setRoleFilter('Pelanggan')}>Pelanggan ({users.filter(u => u.role === 'Pelanggan').length})</div>
              </div>
            </div>
            <button className="hidden sm:block px-3 py-1.5 border border-borderColor text-textMain rounded-md text-xs font-medium hover:bg-bgMain transition-colors mt-3 sm:mt-0">
              Export
            </button>
          </div>
          
        {/* Table Container dengan overflow */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-bgMain/50">
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Pengguna</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Role</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Email</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">No. HP</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Kota</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Tgl Daftar</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Status</th>
                <th className="py-3 px-6 text-xs font-semibold tracking-wider text-textMuted uppercase border-b border-borderColor">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id_users} className="hover:bg-bgMain/30 transition-colors">
                    <td className="py-4 px-6 border-b border-borderColor">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${user.role === 'Superadmin' ? 'bg-primary' : user.role === 'Admin' ? 'bg-success' : 'bg-slate-500'}`}>
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-textMain whitespace-nowrap">{user.nama}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 border-b border-borderColor">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'Superadmin' ? 'bg-blue-100 text-blue-700' : user.role === 'Admin' ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-b border-borderColor text-sm text-textMuted">{user.email}</td>
                    <td className="py-4 px-6 border-b border-borderColor text-sm text-textMuted">{user.no_hp}</td>
                    <td className="py-4 px-6 border-b border-borderColor text-sm text-textMuted">{user.alamat}</td>
                    <td className="py-4 px-6 border-b border-borderColor text-sm text-primary font-medium whitespace-nowrap">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-6 border-b border-borderColor">
                      <span className={`text-sm font-medium ${user.status === 'Aktif' ? 'text-success' : 'text-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-b border-borderColor">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(user)} className="px-3 py-1.5 border border-borderColor text-textMain rounded-md text-xs font-medium hover:bg-bgMain transition-colors">
                          Edit
                        </button>
                        <button onClick={() => deleteUser(user.id_users)} className="px-3 py-1.5 border border-danger-bg text-danger rounded-md text-xs font-medium hover:bg-danger hover:text-white transition-colors">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-textMuted text-sm">
                    Data pengguna tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Table */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-textMuted border-t border-borderColor gap-3">
          <span>Menampilkan {filteredUsers.length} dari {users.length} pengguna</span>
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          user={selectedUser} 
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}