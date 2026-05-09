import { Loader2, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PembelianFormSection({
  suppliers,
  formData,
  isFormOpen,
  closeCreateForm,
  handleFormChange,
  handleFormSubmit,
  isSubmitting,
}) {
  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeCreateForm()}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle className="text-lg font-bold text-slate-900">Tambah Pembelian</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Simpan data supplier, nomor faktur, dan tanggal pembelian.
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

          </div>

          <DialogFooter className="mx-0 mb-0 items-center justify-between rounded-none border-t border-slate-200 bg-white px-6 py-4 sm:flex-row">
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
