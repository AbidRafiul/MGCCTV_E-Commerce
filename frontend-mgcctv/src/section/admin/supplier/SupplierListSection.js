"use client";

import { Building2, CalendarDays, Edit3, LoaderCircle, MapPin, Phone, Trash2, UserRound } from "lucide-react";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCreatorName = (supplier) => {
  if (supplier.created_by_nama) return supplier.created_by_nama;
  if (supplier.created_by) return `User ID ${supplier.created_by}`;
  return "-";
};

export default function SupplierListSection({
  suppliers,
  isLoading,
  actionSupplierId,
  openEditModal,
  handleDelete,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900">Daftar Supplier</h2>
        <p className="mt-1 text-sm text-slate-500">Data supplier yang terdaftar di sistem.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm text-slate-500">
          <LoaderCircle className="animate-spin" size={18} />
          <span>Memuat data supplier...</span>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">
          Belum ada supplier yang sesuai.
        </div>
      ) : (
        <>
          <div className="grid gap-4 p-5 md:hidden">
            {suppliers.map((supplier) => (
              <div key={supplier.id_supplier} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Building2 size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        ID {supplier.id_supplier}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">
                        {supplier.nama_supplier}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(supplier)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
                      title="Edit supplier"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(supplier)}
                      disabled={actionSupplierId === supplier.id_supplier}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                      title="Hapus supplier"
                    >
                      {actionSupplierId === supplier.id_supplier ? (
                        <LoaderCircle className="animate-spin" size={15} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400" />
                    {supplier.no_hp || "-"}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 text-slate-400" />
                    <span>{supplier.alamat || "-"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound size={15} className="text-slate-400" />
                    {getCreatorName(supplier)}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-slate-400" />
                    {formatDate(supplier.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Kontak</th>
                  <th className="px-6 py-3">Alamat</th>
                  <th className="px-6 py-3">Ditambahkan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id_supplier} className="transition hover:bg-blue-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{supplier.nama_supplier}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            ID {supplier.id_supplier}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          {supplier.no_hp || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                      <span className="line-clamp-2">{supplier.alamat || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2 font-semibold text-slate-800">
                          <UserRound size={14} className="text-slate-400" />
                          {getCreatorName(supplier)}
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-slate-400" />
                          {formatDate(supplier.created_at)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(supplier)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50"
                          title="Edit supplier"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(supplier)}
                          disabled={actionSupplierId === supplier.id_supplier}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                          title="Hapus supplier"
                        >
                          {actionSupplierId === supplier.id_supplier ? (
                            <LoaderCircle className="animate-spin" size={15} />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
