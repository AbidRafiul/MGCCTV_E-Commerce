import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PembelianFormSection({
  products,
  suppliers,
  formData,
  formTotal,
  isFormOpen,
  closeCreateForm,
  handleFormChange,
  handleItemChange,
  addItemRow,
  removeItemRow,
  handleFormSubmit,
  isSubmitting,
  formatCurrency,
}) {
  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeCreateForm()}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle className="text-lg font-bold text-slate-900">Tambah Pembelian</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Satu faktur bisa berisi beberapa barang dari supplier yang sama.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="flex max-h-[calc(90vh-92px)] flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Supplier</label>
                <select
                  name="id_supplier" value={formData.id_supplier} onChange={handleFormChange} required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Pilih supplier --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id_supplier} value={supplier.id_supplier}>{supplier.nama_supplier}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">No Faktur</label>
                <input
                  type="text" name="no_faktur" value={formData.no_faktur} onChange={handleFormChange}
                  placeholder="Opsional"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Tanggal</label>
                <input
                  type="date" name="tanggal" value={formData.tanggal} onChange={handleFormChange} required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">Barang Pembelian</p>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  <PlusCircle size={14} />
                  Tambah Item
                </button>
              </div>

              <div className="space-y-3 p-4">
                {formData.items.map((item, index) => {
                  const subtotal = Number(item.jumlah || 0) * Number(item.harga_beli || 0);
                  return (
                    <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[1fr_120px_150px_150px_40px]">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">Produk</label>
                        <select
                          value={item.id_produk}
                          onChange={(e) => handleItemChange(index, "id_produk", e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Pilih --</option>
                          {products.map((p) => (
                            <option key={p.id_produk} value={p.id_produk}>{p.nama_produk} (Stok: {p.stok})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">Jumlah</label>
                        <input
                          type="number" value={item.jumlah} onChange={(e) => handleItemChange(index, "jumlah", e.target.value)}
                          required min="1"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">Harga Beli</label>
                        <input
                          type="number" value={item.harga_beli} onChange={(e) => handleItemChange(index, "harga_beli", e.target.value)}
                          required min="1"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">Subtotal</label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900">
                          {formatCurrency(subtotal)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={formData.items.length === 1}
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
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 items-center justify-between rounded-none border-t border-slate-200 bg-white px-6 py-4 sm:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Total Faktur</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(formTotal)}</p>
            </div>
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={closeCreateForm}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit" disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                {isSubmitting ? "Menyimpan..." : "Simpan Pembelian"}
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
