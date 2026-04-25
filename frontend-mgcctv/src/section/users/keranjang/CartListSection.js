"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

export default function CartListSection({
  router, cartItems, selectedIds, loading,
  handleIncrease, handleDecrease, handleRemove, 
  toggleSelectItem, handleToggleSelectAll, handleCheckout,
  totalItems, selectedItems, selectedTotal, isAllSelected
}) {

  if (loading) {
    return (
      <div className="rounded-[24px] bg-white p-6 text-center shadow-sm sm:rounded-[28px] sm:p-8">
        <p className="text-sm font-medium text-slate-500 sm:text-base">
          Memuat data keranjang...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-[28px] sm:px-6 sm:py-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
          <ShoppingCart size={28} />
        </div>
        <h2 className="mt-5 text-lg font-bold text-[#0C2C55] sm:text-xl">
          Keranjang masih kosong
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Produk yang Anda masukkan ke keranjang akan tampil di halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {cartItems.map((item) => {
        const isSelected = selectedIds.includes(item.id_produk);
        const isMaxStockReached =
          item.stok_tersedia !== null &&
          item.stok_tersedia !== undefined &&
          item.quantity >= item.stok_tersedia;

        return (
          <div
            key={item.id_produk}
            className={`rounded-[22px] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:rounded-[28px] sm:p-6 ${
              isSelected ? "ring-2 ring-blue-100" : ""
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <label className="mt-7 flex shrink-0 cursor-pointer items-center sm:mt-9">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(item.id_produk)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2.5 sm:h-24 sm:w-24 sm:p-3">
                  <img
                    src={item.gambar_produk || "/images/placeholder.jpg"}
                    alt={item.nama_produk}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0 space-y-1.5 sm:space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600 sm:text-xs sm:tracking-[0.25em]">
                    {item.merek}
                  </p>
                  <h2 className="text-base font-bold leading-6 text-[#0C2C55] sm:text-lg">
                    {item.nama_produk}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    Stok tersedia: {item.stok_tersedia ?? "-"}
                  </p>
                  <p className="text-sm font-extrabold text-[#0C2C55] sm:text-base">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(item.harga_produk)}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
                <div className="flex w-full items-center justify-between overflow-hidden rounded-xl border border-slate-200 sm:w-auto sm:justify-start">
                  <button
                    type="button"
                    onClick={() => handleDecrease(item.id_produk, item.quantity)}
                    className="flex h-11 w-11 items-center justify-center text-[#0C2C55] transition-colors hover:bg-slate-50"
                    aria-label={`Kurangi jumlah ${item.nama_produk}`}
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex h-11 flex-1 items-center justify-center border-x border-slate-200 px-3 text-sm font-bold text-[#0C2C55] sm:min-w-12 sm:flex-none">
                    {item.quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleIncrease(item.id_produk, item.quantity)}
                    disabled={isMaxStockReached}
                    className="flex h-11 w-11 items-center justify-center text-[#0C2C55] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                    aria-label={`Tambah jumlah ${item.nama_produk}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id_produk)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100 sm:w-auto"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-[20px] bg-white px-4 py-4 shadow-sm sm:rounded-[24px] sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 sm:text-base">
              Total item di keranjang:{" "}
              <span className="text-[#0C2C55]">{totalItems}</span>
            </p>
            <p className="text-sm text-slate-500">
              Produk dipilih:{" "}
              <span className="font-semibold text-[#0C2C55]">
                {selectedItems.length}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Total checkout terpilih:{" "}
              <span className="font-extrabold text-[#0C2C55]">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(selectedTotal)}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#28a745] border border-slate-200 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}