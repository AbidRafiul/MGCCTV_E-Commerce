import { Eye, Loader2, Trash2 } from "lucide-react";

export default function PembelianTableSection({
  purchases,
  deletingId,
  openPurchaseDetail,
  deletePurchase,
  formatCurrency,
  formatNumber,
  formatDateTime,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">List Faktur Pembelian</h2>
          <p className="mt-1 text-sm text-slate-500">Data faktur dari ms_pembelian dengan ringkasan detail barang.</p>
        </div>
      </div>
      <div className="mt-5 max-h-[640px] overflow-auto rounded-2xl border border-slate-100">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Faktur</th>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Ringkasan Item</th>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">Barang</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  Belum ada data pembelian.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id_pembelian} className="border-t border-slate-100 text-sm text-slate-600">
                  <td className="px-4 py-4 font-semibold text-slate-900">{purchase.no_faktur || "-"}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{purchase.nama_supplier || "-"}</td>
                  <td className="max-w-[280px] px-4 py-4 font-medium text-slate-700">
                    <span className="line-clamp-2">{purchase.item_ringkas || "-"}</span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatNumber(purchase.jumlah_item)}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatNumber(purchase.total_barang)}</td>
                  <td className="px-4 py-4 font-bold text-blue-700">{formatCurrency(purchase.total)}</td>
                  <td className="px-4 py-4 font-medium text-slate-600">{formatDateTime(purchase.tanggal || purchase.created_at)}</td>
                  <td className="px-4 py-4 font-medium text-slate-700">{purchase.nama_admin || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPurchaseDetail(purchase)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 text-blue-600 transition hover:bg-blue-50"
                        title="Lihat detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePurchase(purchase)}
                        disabled={deletingId === purchase.id_pembelian}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Hapus faktur"
                      >
                        {deletingId === purchase.id_pembelian ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
