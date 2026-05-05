import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LaporanTableSection({ 
  activeTab, setActiveTab, transactions, restockTransactions, formatCurrency, statusStyles 
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!searchQuery) return transactions;
    const lowerQuery = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.id?.toLowerCase().includes(lowerQuery) ||
        t.customer?.toLowerCase().includes(lowerQuery)
    );
  }, [transactions, searchQuery]);

  const filteredRestockTransactions = useMemo(() => {
    if (!restockTransactions) return [];
    if (!searchQuery) return restockTransactions;
    const lowerQuery = searchQuery.toLowerCase();
    return restockTransactions.filter(
      (t) =>
        t.product?.toLowerCase().includes(lowerQuery) ||
        t.admin?.toLowerCase().includes(lowerQuery) ||
        t.id?.toLowerCase().includes(lowerQuery)
    );
  }, [restockTransactions, searchQuery]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Riwayat Data</h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "penjualan" ? "Daftar pesanan dari pembeli." : "Daftar barang yang baru masuk ke gudang."}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => {
              setActiveTab("penjualan");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "penjualan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowUpCircle size={16} className={activeTab === "penjualan" ? "text-emerald-500" : ""} /> Penjualan
          </button>
          <button
            onClick={() => {
              setActiveTab("pembelian");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "pembelian" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowDownCircle size={16} className={activeTab === "pembelian" ? "text-blue-500" : ""} /> Barang Masuk
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row px-6 py-4 border-b border-slate-100">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-colors">
          <Search size={16} className="shrink-0" /> 
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "penjualan" ? "Cari nomor invoice / nama pelanggan..." : "Cari nama produk / admin..."}
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-b-3xl">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
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
            {activeTab === "penjualan" && filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  Tidak ada data penjualan yang cocok dengan "{searchQuery}".
                </td>
              </tr>
            )}
            {activeTab === "penjualan" && filteredTransactions.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-900">{t.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(t.date)}</p>
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
            
            {activeTab === "pembelian" && filteredRestockTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                  Tidak ada data barang masuk yang cocok dengan "{searchQuery}".
                </td>
              </tr>
            )}
            {activeTab === "pembelian" && filteredRestockTransactions.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 text-sm text-slate-600 bg-blue-50/10 hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-slate-900">{t.id}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(t.date)}</p>
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
