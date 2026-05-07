"use client";

import React from "react";
import { Plus, Search, Truck } from "lucide-react";

const SupplierHeaderSection = ({
  totalSupplier,
  filteredSupplier,
  searchTerm,
  setSearchTerm,
  openAddModal,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Data Supplier</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola kontak dan alamat supplier untuk kebutuhan stok barang.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Menampilkan {filteredSupplier} dari {totalSupplier} supplier
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari supplier..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Tambah Supplier
          </button>
        </div>
      </div>
    </section>
  );
};

export default SupplierHeaderSection;
