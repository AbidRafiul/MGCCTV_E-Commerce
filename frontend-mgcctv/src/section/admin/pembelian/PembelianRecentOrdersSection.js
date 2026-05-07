export default function PembelianRecentOrdersSection({ latestPurchases, formatNumber, formatCurrency }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-0">
      <h2 className="text-lg font-bold text-slate-900">Pembelian Terbaru</h2>
      <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {latestPurchases.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Belum ada pembelian.
          </p>
        ) : (
          latestPurchases.map((purchase) => (
            <div key={purchase.id_pembelian} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{purchase.no_faktur || `#PB-${purchase.id_pembelian}`}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{purchase.item_ringkas || "-"}</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatNumber(purchase.total_barang)} unit | {formatCurrency(purchase.total)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
