import { Edit3, Trash2, Download } from "lucide-react";

export default function PenggunaTableSection({ 
  filteredUsers, allUsersCount, roleFilter, setRoleFilter, handleExportExcel, openEditModal, deleteUser 
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 px-6 bg-white">
        <div className="flex gap-6 overflow-x-auto">
          {["Semua Role", "Admin", "Pelanggan"].map((role) => (
            <div
              key={role}
              className={`pb-3 pt-4 text-sm font-bold border-b-2 cursor-pointer transition-colors ${roleFilter === role ? "border-[#0C2C55] text-[#0C2C55]" : "border-transparent text-slate-400 hover:text-slate-700"}`}
              onClick={() => setRoleFilter(role)}
            >
              {role} {role === "Semua Role" ? `(${allUsersCount})` : ""}
            </div>
          ))}
        </div>
        <button onClick={handleExportExcel} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 mt-3 sm:mt-0 mb-3 sm:mb-0">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Pengguna</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Tgl Daftar</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id_users} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{user.nama}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">{user.role}</span></td>
                <td className="px-6 py-4 text-xs text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-600">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold ${user.status === "Aktif" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{user.status}</span></td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {(user.role === "Admin" || user.role === "Superadmin") && (
                      <button onClick={() => openEditModal(user)} className="p-1.5 rounded-lg border border-blue-200 text-blue-600 bg-white"><Edit3 size={14} /></button>
                    )}
                    <button onClick={() => deleteUser(user.id_users)} className="p-1.5 rounded-lg border border-red-200 text-red-500 bg-white"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}