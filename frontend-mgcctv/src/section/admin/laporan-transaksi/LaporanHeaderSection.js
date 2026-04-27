import { CalendarRange, Download, RotateCcw } from "lucide-react";

export default function LaporanHeaderSection({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyDateFilter,
  resetDateFilter,
  exportReportToExcel,
  isExporting,
  dateRangeLabel,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Admin Report</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Laporan Transaksi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Lihat riwayat penjualan barang ke pelanggan dan catatan stok masuk toko MG CCTV.</p>
          <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <CalendarRange size={14} /> {dateRangeLabel}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={applyDateFilter}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <CalendarRange size={16} /> Terapkan
            </button>
            <button
              type="button"
              onClick={resetDateFilter}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              type="button"
              onClick={exportReportToExcel}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0C2C55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download size={16} />
              {isExporting ? "Mengunduh..." : "Export Laporan"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
