import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { exportToExcel } from "@/utils/exportExcel";

export const usePengguna = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Error saat fetch:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Pengguna?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0C2C55",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        Swal.fire({ title: "Terhapus!", text: data.message, icon: "success", confirmButtonColor: "#0C2C55" });
        fetchUsers();
      } catch (error) {
        Swal.fire("Error!", error.message || "Terjadi kesalahan.", "error");
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch = user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Semua Role" || user.role === roleFilter;
    const matchStatus = statusFilter === "Semua Status" || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      Swal.fire("Data Kosong", "Tidak ada data untuk diekspor.", "warning");
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
      "Tanggal Daftar": new Date(user.created_at).toLocaleDateString("id-ID"),
    }));

    exportToExcel(dataToExport, "Laporan_Data_Pengguna_MGCCTV", "Data Pengguna");
  };

  return {
    users, filteredUsers, isModalOpen, setIsModalOpen, selectedUser,
    searchTerm, setSearchTerm, roleFilter, setRoleFilter, statusFilter, setStatusFilter,
    openAddModal, openEditModal, deleteUser, handleExportExcel, fetchUsers
  };
};