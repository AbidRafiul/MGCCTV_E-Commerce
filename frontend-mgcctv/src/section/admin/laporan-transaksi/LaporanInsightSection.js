import { PackageCheck, ArrowUpRight, PackagePlus } from "lucide-react";

export default function LaporanInsightSection({ activeTab, currentTopProducts, formatCurrency }) {
  return (
    <div className="space-y-6 min-h-0">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PackageCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Info Toko</h2>
            <p className="text-sm text-slate-500">Ringkasan aktivitas minggu ini.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {activeTab === "penjualan" ? (
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <ArrowUpRight size={16} />
                <p className="text-sm font-semibold">Penjualan naik</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Insight ini sekarang membaca produk yang benar-benar paling sering terjual dari transaksi user yang berhasil.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <PackagePlus size={16} />
                <p className="text-sm font-semibold">Stok aman</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                Ringkasan restok menampilkan produk yang paling sering ditambah dan admin yang paling aktif input stok.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-0">
        <h2 className="text-lg font-bold text-slate-900">
          {activeTab === "penjualan" ? "Produk Terlaris" : "Sering Di-restok"}
        </h2>
        <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
          {currentTopProducts.map((product, index) => (
            <div key={product.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-700 shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {product.sold} {activeTab === "penjualan" ? "unit terjual" : "unit restok"}
                    </p>
                    {activeTab === "penjualan" ? (
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {formatCurrency(product.revenue || 0)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 uppercase">
                  {product.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
