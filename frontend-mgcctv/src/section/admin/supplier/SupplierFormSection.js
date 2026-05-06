"use client";

import { Building2, LoaderCircle, MapPin, Phone, Save, X } from "lucide-react";

export default function SupplierFormSection({
  isOpen,
  formData,
  selectedSupplier,
  isSaving,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(selectedSupplier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Supplier" : "Tambah Supplier"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {isEditing ? "Perbarui informasi supplier." : "Lengkapi data supplier baru."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-red-500"
            title="Tutup form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-4 px-5 py-5 sm:px-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nama Supplier
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  name="nama_supplier"
                  value={formData.nama_supplier}
                  onChange={onChange}
                  placeholder="Contoh: PT Sumber CCTV Indonesia"
                  className="w-full rounded-lg border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                No. Handphone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={onChange}
                  placeholder="081234567890"
                  className="w-full rounded-lg border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Alamat
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={onChange}
                  rows={4}
                  placeholder="Alamat lengkap supplier"
                  className="min-h-28 w-full resize-none rounded-lg border border-slate-200 px-10 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mx-6">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
              {isSaving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
