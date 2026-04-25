import { Edit3, LoaderCircle, Tag, Trash2, X } from "lucide-react";

export default function KategoriListSection({
  kategori, isLoading, editingKategoriId, handleEdit, handleDelete, actionKategoriId
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">Daftar Kategori</h2>
        <p className="mt-1 text-sm text-slate-500">Total {kategori.length} kategori tersedia.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-12 text-slate-500">
          <LoaderCircle className="animate-spin" size={18} />
          <span>Memuat kategori...</span>
        </div>
      ) : kategori.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Belum ada kategori yang ditambahkan.
        </div>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {kategori.map((item) => (
            <div key={item.id_kategori} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">ID {item.id_kategori}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.nama_kategori}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
                    title="Edit kategori"
                  >
                    {editingKategoriId === item.id_kategori ? <X size={16} /> : <Edit3 size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={actionKategoriId === item.id_kategori}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    title="Hapus kategori"
                  >
                    {actionKategoriId === item.id_kategori ? (
                      <LoaderCircle className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}