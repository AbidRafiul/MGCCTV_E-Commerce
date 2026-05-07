import { PlusCircle } from "lucide-react";

export default function PembelianHeaderSection({ openCreateForm }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Inventory Overview</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Pembelian & Stok</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kelola penambahan stok barang dari supplier dan pantau sisa inventaris gudang secara real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Tambah Pembelian
        </button>
      </div>
    </section>
  );
}
