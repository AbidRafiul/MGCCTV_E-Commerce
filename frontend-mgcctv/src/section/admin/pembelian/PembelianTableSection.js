export default function PembelianTableSection({ productsByStock, formatCurrency, formatNumber, formatDateTime, statusTone }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daftar Stok Produk</h2>
          <p className="mt-1 text-sm text-slate-500">Data ini terhubung langsung ke tabel `ms_produk`.</p>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">Stok</th>
              <th className="px-4 py-3 font-semibold">Tanggal Masuk</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {productsByStock.map((product) => {
              const tone = statusTone(product.stok);
              return (
                <tr key={product.id_produk} className="border-t border-slate-100 text-sm text-slate-600">
                  <td className="px-4 py-4 font-semibold text-slate-900">{product.nama_produk}</td>
                  <td className="px-4 py-4 font-medium text-slate-800">{formatCurrency(product.harga_produk)}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatNumber(product.stok)}</td>
                  <td className="px-4 py-4 font-medium text-slate-600">{formatDateTime(product.tanggal_masuk_terakhir)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.className}`}>{tone.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}