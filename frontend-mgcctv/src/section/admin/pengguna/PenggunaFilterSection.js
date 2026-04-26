import { Search, Plus } from "lucide-react";

export default function PenggunaFilterSection({ 
  searchTerm, setSearchTerm, roleFilter, setRoleFilter, statusFilter, setStatusFilter, openAddModal 
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text" placeholder="Cari nama/email..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
            <option value="Semua Role">Semua Role</option>
            <option value="Superadmin">Superadmin</option>
            <option value="Admin">Admin</option>
            <option value="Pelanggan">Pelanggan</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none">
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>
      <button onClick={openAddModal} className="w-full xl:w-auto flex items-center justify-center gap-2 bg-[#0C2C55] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
        <Plus size={18} /> Tambah Admin
      </button>
    </div>
  );
}