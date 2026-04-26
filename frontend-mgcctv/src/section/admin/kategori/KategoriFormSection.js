import { FolderPlus } from "lucide-react";

export default function KategoriFormSection({
  namaKategori, setNamaKategori, handleSubmit, isSaving, 
  editingKategoriId, handleCancelEdit, error, success
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FolderPlus size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-slate-500">Isikan kategori CCTV.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={namaKategori}
          onChange={(event) => setNamaKategori(event.target.value)}
          placeholder="Contoh: CCTV Indoor"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Menyimpan..." : editingKategoriId ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
        {editingKategoriId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal Edit
          </button>
        )}
      </form>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
    </section>
  );
}