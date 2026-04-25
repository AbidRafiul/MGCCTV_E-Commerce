"use client";

import { usePengguna } from "@/hooks/admin/pengguna/usePengguna";
import UserModal from "./components/UserModal";
import PenggunaFilterSection from "@/section/admin/pengguna/PenggunaFilterSection";
import PenggunaTableSection from "@/section/admin/pengguna/PenggunaTableSection";

export default function DataPenggunaPage() {
  const {
    users, filteredUsers, isModalOpen, setIsModalOpen, selectedUser,
    searchTerm, setSearchTerm, roleFilter, setRoleFilter, statusFilter, setStatusFilter,
    openAddModal, openEditModal, deleteUser, handleExportExcel, fetchUsers
  } = usePengguna();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Data Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1">Manajemen data admin dan pelanggan</p>
      </div>

      <PenggunaFilterSection 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        roleFilter={roleFilter} setRoleFilter={setRoleFilter} 
        statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
        openAddModal={openAddModal} 
      />

      <PenggunaTableSection 
        filteredUsers={filteredUsers} 
        allUsersCount={users.length} 
        roleFilter={roleFilter} setRoleFilter={setRoleFilter} 
        handleExportExcel={handleExportExcel} 
        openEditModal={openEditModal} 
        deleteUser={deleteUser} 
      />

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}