"use client";

import { useState, useEffect } from "react";
import UserModal from "./components/UserModal";
import Swal from "sweetalert2";
import { Search, Plus, Edit3, Trash2, Download } from "lucide-react";
import { exportToExcel } from "@/utils/exportExcel";

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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Response gagal dari server");
      }
    } catch (e) {
      console.error("Error saat fetch:", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUsers(token);
    }
  }, []);

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
    Swal.fire({
      title: "Hapus Pengguna?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0C2C55", // Disamakan dengan tema biru
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            Swal.fire({
              title: "Gagal Dihapus!",
              text: data.message,
              icon: "error",
              confirmButtonColor: "#0C2C55",
            });
            return;
          }

          Swal.fire({
            title: "Terhapus!",
            text: data.message,
            icon: "success",
            confirmButtonColor: "#0C2C55",
          });

          refreshData();
        } catch (error) {
          Swal.fire("Error!", "Terjadi kesalahan jaringan ke server.", "error");
        }
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Logika Filter
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Semua Role" || user.role === roleFilter;
    const matchStatus =
      statusFilter === "Semua Status" || user.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      Swal.fire(
        "Data Kosong",
        "Tidak ada data pengguna yang bisa diekspor.",
        "warning",
      );
      return;
    }

    const dataToExport = filteredUsers.map((user, index) => ({
      No: index + 1,
      "Nama Lengkap": user.nama,
      Role: user.role,
      Email: user.email,
      "No. Handphone": user.no_hp || "-",
      "Kota/Alamat": user.alamat || "-",
      Status: user.status,
      "Tanggal Daftar": formatDate(user.created_at),
    }));

    const columnWidths = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 35 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
    ];

    // Panggil pabrik Excel kita!
    exportToExcel(
      dataToExport,
      "Laporan_Data_Pengguna_MGCCTV",
      "Data Pengguna",
      columnWidths,
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Data Pengguna
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Manajemen data admin dan pelanggan
          </p>
        </div>
      </div>

      {/* FILTER BAR - Responsif */}
      <div className="bg-bgSurface p-4 rounded-xl shadow-sm border border-borderColor flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm border border-borderColor rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50"
            />
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm border border-borderColor rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 cursor-pointer"
            >
              <option value="Semua Role">Semua Role</option>
              <option value="Superadmin">Superadmin</option>
              <option value="Admin">Admin</option>
              <option value="Pelanggan">Pelanggan</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm border border-borderColor rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-slate-50 cursor-pointer"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full xl:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus size={18} /> Tambah Admin
        </button>
      </div>

      {/* CONTAINER UTAMA DATA */}
      <div className="bg-bgSurface border border-borderColor rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Header (Bisa di-scroll nyamping di HP) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-borderColor px-4 sm:px-6 bg-white">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="flex gap-6 min-w-max">
              <div
                className={`pb-3 pt-4 text-sm font-bold border-b-2 cursor-pointer transition-colors ${roleFilter === "Semua Role" ? "border-[#0C2C55] text-[#0C2C55]" : "border-transparent text-textMuted hover:text-textMain"}`}
                onClick={() => setRoleFilter("Semua Role")}
              >
                Semua Pengguna ({users.length})
              </div>
              <div
                className={`pb-3 pt-4 text-sm font-bold border-b-2 cursor-pointer transition-colors ${roleFilter === "Admin" ? "border-[#0C2C55] text-[#0C2C55]" : "border-transparent text-textMuted hover:text-textMain"}`}
                onClick={() => setRoleFilter("Admin")}
              >
                Admin ({users.filter((u) => u.role === "Admin").length})
              </div>
              <div
                className={`pb-3 pt-4 text-sm font-bold border-b-2 cursor-pointer transition-colors ${roleFilter === "Pelanggan" ? "border-[#0C2C55] text-[#0C2C55]" : "border-transparent text-textMuted hover:text-textMain"}`}
                onClick={() => setRoleFilter("Pelanggan")}
              >
                Pelanggan ({users.filter((u) => u.role === "Pelanggan").length})
              </div>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-borderColor text-textMain rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors mt-3 sm:mt-0 mb-3 sm:mb-0"
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* ========================================== */}
        {/* 1. MOBILE VIEW (Card Layout) - < 768px */}
        {/* ========================================== */}
        <div className="block md:hidden p-4">
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id_users}
                  className="bg-white p-4 rounded-xl border border-borderColor shadow-sm space-y-3 relative hover:border-blue-100 transition-colors"
                >
                  {/* Avatar & Nama */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm ${user.role === "Superadmin" ? "bg-[#0C2C55]" : user.role === "Admin" ? "bg-blue-500" : "bg-slate-400"}`}
                    >
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden pr-16">
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {user.nama}
                      </h3>
                      <p className="text-[11px] font-medium text-textMuted truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    {/* Badge Status */}
                    <span
                      className={`shrink-0 absolute top-4 right-4 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${user.status === "Aktif" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {user.status}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-borderColor">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">
                        Role
                      </span>
                      <span
                        className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold ${user.role === "Superadmin" ? "bg-blue-100 text-blue-700" : user.role === "Admin" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">
                        Terdaftar
                      </span>
                      <span className="font-semibold text-xs text-slate-600">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">
                        No. HP
                      </span>
                      <span className="font-semibold text-xs text-slate-600">
                        {user.no_hp || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">
                        Kota
                      </span>
                      <span className="font-semibold text-xs text-slate-600 text-right line-clamp-1">
                        {user.alamat || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-end pt-3 border-t border-borderColor gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id_users)}
                      className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-textMuted text-sm">
              Data pengguna tidak ditemukan.
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 2. DESKTOP VIEW (Table Layout) - >= 768px */}
        {/* ========================================== */}
        <div className="hidden md:block w-full overflow-x-auto custom-scrollbar p-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">No. HP</th>
                <th className="px-6 py-4">Kota</th>
                <th className="px-6 py-4">Tgl Daftar</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id_users}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${user.role === "Superadmin" ? "bg-[#0C2C55]" : user.role === "Admin" ? "bg-blue-500" : "bg-slate-400"}`}
                        >
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">
                          {user.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.role === "Superadmin" ? "bg-blue-100 text-blue-700" : user.role === "Admin" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-xs">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-xs">
                      {user.no_hp || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500 text-xs truncate max-w-[150px]">
                      {user.alamat || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600 text-xs">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${user.status === "Aktif" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* UPDATE: Tombol Desktop disamakan memakai ikon */}
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 md:p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors bg-white shadow-sm"
                          title="Edit"
                        >
                          <Edit3 size={14} className="md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id_users)}
                          className="p-1.5 md:p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-10 text-center text-textMuted text-sm"
                  >
                    Data pengguna tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Table */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-textMuted border-t border-borderColor gap-3 bg-white">
          <span>
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </span>
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
