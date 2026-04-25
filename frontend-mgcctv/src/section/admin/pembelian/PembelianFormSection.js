import { PackagePlus, Loader2, PlusCircle } from "lucide-react";

export default function PembelianFormSection({ products, formData, handleFormChange, handleFormSubmit, isSubmitting }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-10"><PackagePlus size={100} /></div>
      <h2 className="relative z-10 text-lg font-bold text-blue-900">+ Form Restock Barang</h2>
      <p className="relative z-10 mt-1 text-sm text-blue-700/80">Catat stok masuk dari supplier.</p>
      
      <form onSubmit={handleFormSubmit} className="relative z-10 mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Pilih Produk</label>
          <select
            name="id_produk" value={formData.id_produk} onChange={handleFormChange} required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Pilih --</option>
            {products.map((p) => (
              <option key={p.id_produk} value={p.id_produk}>{p.nama_produk} (Sisa: {p.stok})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Jumlah Masuk</label>
          <input
            type="number" name="qty_masuk" value={formData.qty_masuk} onChange={handleFormChange} required min="1"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit" disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
          {isSubmitting ? "Menyimpan..." : "Simpan Stok Baru"}
        </button>
      </form>
    </section>
  );
}