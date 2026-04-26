import { Search, Filter, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default function LaporanTableSection({ 
  activeTab, setActiveTab, transactions, restockTransactions, formatCurrency, statusStyles 
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Riwayat Data</h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "penjualan" ? "Daftar pesanan dari pembeli." : "Daftar barang yang baru masuk ke gudang."}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab("penjualan")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "penjualan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowUpCircle size={16} className={activeTab === "penjualan" ? "text-emerald-500" : ""} /> Penjualan
          </button>
          <button
            onClick={() => setActiveTab("pembelian")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "pembelian" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowDownCircle size={16} className={activeTab === "pembelian" ? "text-blue-500" : ""} /> Barang Masuk
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row px-6 py-4 border-b border-slate-100">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Search size={16} /> {activeTab === "penjualan" ? "Cari nomor invoice / nama pelanggan" : "Cari nama produk / admin"}
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              {activeTab === "penjualan" ? (
                <>
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Item</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 font-semibold">ID Log</th>
                  <th className="px-6 py-4 font-semibold">Nama Produk</th>
                  <th className="px-6 py-4 font-semibold text-center">Jumlah</th>
                  <th className="px-6 py-4 font-semibold">Admin</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {activeTab === "penjualan" && transactions.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600">
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-900">{t.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{t.date}</p>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-800">{t.customer}</p>
                  <p className="mt-1 text-xs text-slate-400">{t.channel}</p>
                </td>
                <td className="px-6 py-4 align-top text-xs text-slate-500">{t.items}</td>
                <td className="px-6 py-4 align-top font-semibold text-slate-900">{formatCurrency(t.total)}</td>
                <td className="px-6 py-4 align-top">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[t.status]}`}>{t.status}</span>
                </td>
              </tr>
            ))}
            {activeTab === "pembelian" && restockTransactions.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600 bg-blue-50/10">
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-900">{t.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{t.date}</p>
                </td>
                <td className="px-6 py-4 align-top font-bold text-slate-800">{t.product}</td>
                <td className="px-6 py-4 align-top text-center">
                  <span className="inline-flex items-center justify-center font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-xl">+{t.jumlah}</span>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">{t.admin}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}