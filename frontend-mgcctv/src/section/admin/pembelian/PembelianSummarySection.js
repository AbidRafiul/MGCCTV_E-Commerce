import { PackagePlus, ClipboardList, Boxes, WalletCards } from "lucide-react";

export default function PembelianSummarySection({ inventoryStats, formatNumber }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><PackagePlus size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Total Pembelian</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalTransaksi)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><ClipboardList size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Barang Masuk</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalBarangMasuk)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Boxes size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Total Item Faktur</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalProdukDibeli)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><WalletCards size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Nilai Pembelian</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Rp {formatNumber(inventoryStats.totalNilaiPembelian)}</h2>
      </article>
    </section>
  );
}
