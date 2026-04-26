import { ChevronDown, ChevronLeft, ChevronRight, Check, Loader2, Package } from "lucide-react";
import { STATUS_META, STATUS_OPTIONS } from "@/hooks/admin/pesanan/usePesanan";

// --- SUB KOMPONEN (Hanya dipakai di file ini) ---
function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  const Icon = meta?.icon || Package;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit ${meta?.badgeClass || "bg-slate-50 border border-slate-200 text-slate-600"}`}>
      <Icon size={12} />
      <span className="text-[11px] font-bold">{status}</span>
    </div>
  );
}

function ActionButtons({ order, onChangeStatus, isMenuOpen, onToggleMenu, isUpdating }) {
  const meta = STATUS_META[order.status];
  const primaryAction = meta?.primaryAction;
  return (
    <div className="relative flex items-center gap-2">
      {primaryAction ? (
        <button onClick={() => onChangeStatus(order.id_pesanan, primaryAction.nextStatus)} disabled={isUpdating} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all disabled:opacity-70 ${primaryAction.className}`}>
          {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <primaryAction.icon size={12} />}
          {primaryAction.label}
        </button>
      ) : (
        <div className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-bold ${meta?.accentClass || "border-slate-200 bg-slate-50 text-slate-600"}`}>
          <meta.icon size={12} /> Tidak Ada Aksi
        </div>
      )}
      <button onClick={() => onToggleMenu(order.id_pesanan)} disabled={isUpdating} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-70">
        <ChevronDown size={12} /> Pilih Aksi
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Ubah Status</p>
          <div className="mt-1 space-y-1">
            {STATUS_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              const isActive = option.value === order.status;
              return (
                <button key={option.value} onClick={() => onChangeStatus(order.id_pesanan, option.value)} disabled={isUpdating} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-70 ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className="flex items-center gap-2"><OptionIcon size={14} />{option.label}</span>
                  {isActive && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- KOMPONEN UTAMA TABEL ---
export default function PesananTableSection({
  loading, paginatedOrders, filteredOrders, currentPage, setCurrentPage, totalPages,
  openActionMenu, toggleActionMenu, updatingOrderId, handleChangeStatus
}) {
  return (
    <>
      <div className="p-4 pb-0 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0C2C55] flex items-center gap-2"><Package size={16} className="text-slate-400" /> Daftar Pesanan</h2>
        <span className="text-[11px] text-slate-500">Menampilkan {filteredOrders.length} pesanan</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
          <Loader2 className="animate-spin" size={18} /><span>Memuat pesanan dari backend...</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pelanggan</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Produk</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Metode</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-500">Belum ada pesanan.</td></tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id_pesanan} className="hover:bg-slate-50/50 align-top">
                      <td className="py-4 px-4 text-xs font-bold text-[#0C2C55] whitespace-nowrap">{order.id}</td>
                      <td className="py-4 px-4 text-xs text-blue-500 font-medium whitespace-nowrap">{order.date}</td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-semibold text-slate-700">{order.customer}</p>
                        <p className="text-[10px] text-blue-500">{order.city}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 min-w-[220px]">{order.product}</td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-800 whitespace-nowrap">{order.total}</td>
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">{order.method}</td>
                      <td className="py-4 px-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <ActionButtons order={order} onChangeStatus={handleChangeStatus} isMenuOpen={openActionMenu === order.id_pesanan} onToggleMenu={toggleActionMenu} isUpdating={updatingOrderId === order.id_pesanan} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
            <p className="text-[11px] text-slate-500">
              Menampilkan <span className="font-bold">{paginatedOrders.length}</span> dari <span className="font-bold">{filteredOrders.length}</span> pesanan
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold ${currentPage === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}