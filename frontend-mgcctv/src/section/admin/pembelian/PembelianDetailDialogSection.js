import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PembelianDetailDialogSection({
  detailDialog,
  closePurchaseDetail,
  formatCurrency,
  formatNumber,
  formatDateTime,
}) {
  const detail = detailDialog.data;

  return (
    <Dialog open={detailDialog.open} onOpenChange={(open) => !open && closePurchaseDetail()}>
      <DialogContent className="max-h-[86vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Detail Pembelian {detail?.no_faktur || ""}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Rincian item dalam satu faktur pembelian.
          </DialogDescription>
        </DialogHeader>

        {detailDialog.isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={18} />
            Memuat detail pembelian...
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto px-6 py-5">
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

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produk</th>
                    <th className="px-4 py-3 font-semibold">Jumlah</th>
                    <th className="px-4 py-3 font-semibold">Harga Beli</th>
                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.items || []).map((item) => (
                    <tr key={item.id_tr_pembelian} className="border-t border-slate-100 text-sm">
                      <td className="px-4 py-4 font-semibold text-slate-900">{item.nama_produk}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">{formatNumber(item.jumlah)}</td>
                      <td className="px-4 py-4 font-medium text-slate-700">{formatCurrency(item.harga_beli)}</td>
                      <td className="px-4 py-4 font-bold text-blue-700">{formatCurrency(item.sub_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
