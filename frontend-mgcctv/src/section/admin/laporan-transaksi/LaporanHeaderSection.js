import { CalendarRange, Download } from "lucide-react";

export default function LaporanHeaderSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Admin Report</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Laporan Transaksi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Lihat riwayat penjualan barang ke pelanggan dan catatan stok masuk toko MG CCTV.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <CalendarRange size={16} /> 1 Apr 2026 - 12 Apr 2026
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0C2C55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900">
            <Download size={16} /> Export Laporan
          </button>
        </div>
      </div>
    </section>
  );
}