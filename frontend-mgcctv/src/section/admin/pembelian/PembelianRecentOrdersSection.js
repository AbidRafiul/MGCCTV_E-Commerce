export default function PembelianRecentOrdersSection({ latestCompletedOrders, formatNumber, formatCurrency }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Pesanan Selesai Terbaru</h2>
      <div className="mt-5 space-y-3">
        {latestCompletedOrders.map((order) => (
          <div key={order.id_pesanan} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">#ORD-{String(order.id_pesanan).padStart(4, "0")}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {formatNumber(order.total_item)} unit | {formatCurrency(order.total_harga)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}