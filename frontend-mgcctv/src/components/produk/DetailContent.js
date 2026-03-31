"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { ensureCheckoutProfileComplete } from "@/services/checkoutProfileService";
import { addCartItem, saveCheckoutItems } from "@/services/cartService";

export default function DetailContent({ product }) {
  const router = useRouter();

  const handleAddToCart = () => {
    addCartItem(product);
    router.push("/keranjang");
  };

  const handleBuyNow = async () => {
    const canContinue = await ensureCheckoutProfileComplete();

    if (!canContinue) {
      return;
    }

    saveCheckoutItems([
      {
        ...product,
        quantity: 1,
      },
    ]);
    router.push("/checkout");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-6">
      {/* --- KARTU UTAMA (Gambar & Tombol) --- */}
      <div className="bg-[#f4f7f8] rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row gap-10 items-center">
        {/* Box Gambar Putih */}
        <div className="w-full md:w-1/3 aspect-square bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-6 shadow-sm">
          <img
            src={product.gambar_produk || "/placeholder-cctv.png"}
            alt={product.nama_produk}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info Harga & Aksi */}
        <div className="w-full md:w-2/3 space-y-4">
          <div className="space-y-1">
            <h4 className="text-[#0C2C55] font-bold text-sm tracking-wide uppercase">
              {product.merek}
            </h4>
            <h2 className="text-2xl font-extrabold text-[#0C2C55] leading-tight">
              {product.nama_produk}
            </h2>
          </div>

          <p className="text-2xl font-bold text-[#0C2C55]">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.harga_produk)}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="bg-[#0C2C55] text-white py-2.5 px-5 rounded-md font-bold text-xs flex items-center gap-2 hover:bg-blue-900 transition-all shadow-md"
            >
              Masukan ke Keranjang <ShoppingCart size={16} />
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-[#28a745] text-white py-2.5 px-8 rounded-md font-bold text-xs hover:bg-green-700 transition-all shadow-md"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* --- KARTU DETAIL (Spek & Deskripsi) --- */}
      <div className="bg-[#f4f7f8] rounded-[32px] p-8 md:p-10 space-y-8 text-[#0C2C55]">
        {/* List Info Singkat */}
        <div className="space-y-2 text-sm font-semibold">
          <div className="flex gap-2">
            <span className="text-gray-400 w-36">Nama Produk :</span>
            <span>{product.nama_produk}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-36">Merk :</span>
            <span>{(product.merek || product.nama_kategori)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-36">Estimasi Pengiriman :</span>
            <span>2-3 Hari Kerja</span>
          </div>
        </div>

        {/* Paragraf Deskripsi */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm">Deskripsi Produk :</h4>
          <p className="text-xs leading-relaxed text-[#3a5a65] font-medium text-justify">
            {product.deskripsi_produk || "Deskripsi produk belum tersedia."}
          </p>
        </div>

        {/* List Keunggulan */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm">Keunggulan Produk :</h4>
          <ul className="text-xs space-y-1 text-[#3a5a65] font-medium list-disc list-inside ml-1">
            <li>Resolusi Tinggi (Original {product.merek})</li>
            <li>Tahan Cuaca Extreme</li>
            <li>Support Penglihatan Malam (Infrared)</li>
            <li>Garansi Resmi MG CCTV</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
