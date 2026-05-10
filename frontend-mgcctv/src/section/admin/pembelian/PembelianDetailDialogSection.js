import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PembelianDetailDialogSection({
  detailDialog,
  products,
  itemFormData,
  formTotal,
  closePurchaseDetail,
  handleItemChange,
  addItemRow,
  removeItemRow,
  handleItemSubmit,
  isSubmitting,
  formatCurrency,
  formatNumber,
  formatDateTime,
}) {
  const detail = detailDialog.data;
  const isEditMode = detailDialog.mode === "edit";
  const formatSellingPrice = (value) => {
    const price = Number(value || 0);

    return price > 0 ? formatCurrency(price) : "-";
  };

  return (
    <Dialog open={detailDialog.open} onOpenChange={(open) => !open && closePurchaseDetail()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden rounded-2xl bg-white p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEditMode ? "Tambah Item Pembelian" : "Detail Pembelian"} {detail?.no_faktur || ""}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEditMode
              ? "Pilih barang, isi jumlah, dan harga beli untuk faktur ini."
              : "Rincian item dalam satu faktur pembelian."}
          </DialogDescription>
        </DialogHeader>

        {detailDialog.isLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={18} />
            Memuat detail pembelian...
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Supplier</p>
                <p className="mt-1 font-bold text-slate-900">{detail?.nama_supplier || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Tanggal</p>
                <p className="mt-1 font-bold text-slate-900">{formatDateTime(detail?.tanggal)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Admin</p>
                <p className="mt-1 font-bold text-slate-900">{detail?.nama_admin || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Total Faktur</p>
                <p className="mt-1 font-bold text-blue-700">{formatCurrency(detail?.total)}</p>
              </div>
            </div>

            {isEditMode ? (
              <form onSubmit={handleItemSubmit} className="rounded-2xl border border-slate-200">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-slate-900">Barang Pembelian</p>
                  <button
                    type="button"
                    onClick={addItemRow}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    <PlusCircle size={14} />
                    Tambah Item
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  {(itemFormData.items || []).map((item, index) => {
                    const product = products.find((row) => String(row.id_produk) === String(item.id_produk));
                    const margin = Number(product?.margin ?? item.margin ?? 5);
                    const hargaBeli = Number(item.harga_beli || 0);
                    const hargaJual = hargaBeli > 0 ? Math.ceil(hargaBeli + (hargaBeli * margin / 100)) : 0;
                    const subtotal = Number(item.jumlah || 0) * hargaBeli;
                    const isExistingItem = Boolean(item.id_tr_pembelian);

                    return (
                      <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[1fr_110px_140px_130px_130px_40px]">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Produk</label>
                          <select
                            value={item.id_produk}
                            onChange={(e) => handleItemChange(index, "id_produk", e.target.value)}
                            required
                            disabled={isSubmitting || isExistingItem}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                          >
                            <option value="">-- Pilih --</option>
                            {products.map((row) => (
                              <option key={row.id_produk} value={row.id_produk}>
                                {row.nama_produk} (Stok: {formatNumber(row.stok)})
                              </option>
                            ))}
                          </select>
                          {hargaBeli > 0 ? (
                            <p className="mt-1 text-[11px] font-semibold text-slate-400">Margin {formatNumber(margin)}%</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Jumlah</label>
                          <input
                            type="number"
                            value={item.jumlah}
                            onChange={(e) => handleItemChange(index, "jumlah", e.target.value)}
                            required
                            min="1"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Harga Beli</label>
                          <input
                            type="number"
                            value={item.harga_beli}
                            onChange={(e) => handleItemChange(index, "harga_beli", e.target.value)}
                            required
                            min="1"
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Harga Jual</label>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-emerald-700">
                            {hargaJual > 0 ? formatCurrency(hargaJual) : "-"}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Subtotal</label>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-blue-700">
                            {formatCurrency(subtotal)}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            disabled={isSubmitting || (itemFormData.items || []).length === 1}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Hapus item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <DialogFooter className="sticky bottom-0 z-10 items-start justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-10px_25px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Total Item Baru</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(formTotal)}</p>
                  </div>
                  <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      onClick={closePurchaseDetail}
                      disabled={isSubmitting}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                      {isSubmitting ? "Menyimpan..." : "Simpan Item"}
                    </button>
                  </div>
                </DialogFooter>
              </form>
            ) : (
              <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produk</th>
                    <th className="px-4 py-3 font-semibold">Jumlah</th>
                    <th className="px-4 py-3 font-semibold">Harga Beli</th>
                    <th className="px-4 py-3 font-semibold">Harga Jual</th>
                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.items || []).map((item) => (
                    <tr key={item.id_tr_pembelian} className="border-t border-slate-100 text-sm">
                      <td className="px-4 py-4 font-semibold text-slate-900">{item.nama_produk}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">{formatNumber(item.jumlah)}</td>
                      <td className="px-4 py-4 font-medium text-slate-700">{formatCurrency(item.harga_beli)}</td>
                      <td className="px-4 py-4 font-bold text-emerald-700">{formatSellingPrice(item.harga_produk)}</td>
                      <td className="px-4 py-4 font-bold text-blue-700">{formatCurrency(item.sub_total)}</td>
                    </tr>
                  ))}
                  {(detail?.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
                        Belum ada item barang di faktur ini.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
