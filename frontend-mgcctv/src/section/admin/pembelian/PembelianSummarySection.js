import { PackagePlus, ClipboardList, AlertTriangle, ShoppingCart } from "lucide-react";

export default function PembelianSummarySection({ inventoryStats, formatNumber }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><PackagePlus size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Total Produk</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalProduk)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><ClipboardList size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Total Stok Saat Ini</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalStok)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><AlertTriangle size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Stok Tipis / Habis</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.stokTipis + inventoryStats.stokHabis)}</h2>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><ShoppingCart size={20} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Unit Terjual</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(inventoryStats.totalTerjual)}</h2>
      </article>
    </section>
  );
}