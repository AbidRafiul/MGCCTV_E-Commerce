"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Loader2, PackageSearch } from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/produkService";
import Link from "next/link";

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState(["Semua"]); 
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Batas maksimal produk per slide/halaman
  const produkPerHalaman = 9; 

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [produkData, kategoriData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      setAllProducts(produkData || []);
      if (kategoriData && kategoriData.length > 0) {
        const listNamaKategori = kategoriData.map(kat => kat.nama_kategori);
        setCategories(["Semua", ...listNamaKategori]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = allProducts.filter((p) => {
    if (activeCategory === "Semua") return true;
    return p.merek === activeCategory; 
  });

  // LOGIKA PAGINATION
  const jumlahHalaman = Math.max(1, Math.ceil(filteredProducts.length / produkPerHalaman));
  const indexTerakhir = currentPage * produkPerHalaman;
  const indexPertama = indexTerakhir - produkPerHalaman;
  const produkTampil = filteredProducts.slice(indexPertama, indexTerakhir);

  const pindahHalaman = (nomor) => {
    if (nomor === "...") return;
    setCurrentPage(nomor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (jumlahHalaman <= 5) {
      for (let i = 1; i <= jumlahHalaman; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(jumlahHalaman - 1, currentPage + 1);
      if (currentPage <= 3) end = 4;
      if (currentPage >= jumlahHalaman - 2) start = jumlahHalaman - 3;
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < jumlahHalaman - 2) pages.push("...");
      pages.push(jumlahHalaman);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Sinkronisasi gudang MG CCTV...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-[500px] max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
      
      {/* FILTER KATEGORI */}
      <div className="mb-8 flex flex-wrap gap-2.5 sm:mb-12 sm:gap-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 sm:px-6 sm:py-2.5 ${
              activeCategory === cat
                ? "bg-[#0C2C55] text-white border-[#0C2C55] shadow-lg shadow-blue-900/20"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID PRODUK */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:mb-16 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {produkTampil.length > 0 ? (
          produkTampil.map((product) => (
            <Link 
              href={`/produk/${product.id_produk}`} 
              key={product.id_produk} 
              className="group rounded-[22px] border border-gray-100 bg-white p-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:rounded-[28px] sm:p-5 lg:rounded-[32px] lg:p-6 lg:hover:-translate-y-2"
            >
              <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-[16px] bg-slate-50 p-3 sm:mb-5 sm:rounded-[20px] sm:p-5 lg:mb-6 lg:rounded-[24px] lg:p-6">
                <img 
                  src={product.gambar_produk || "/images/placeholder.jpg"} 
                  alt={product.nama_produk} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="line-clamp-2 text-sm font-bold text-[#0C2C55] sm:text-base lg:text-lg">
                  {product.nama_produk}
                </h3>
                <p className="text-base font-black text-blue-600 sm:text-xl lg:text-2xl">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.harga_produk)}
                </p>
                <div className="flex w-fit items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 sm:gap-1.5 sm:px-3">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 sm:h-4 sm:w-4" />
                  <span className="text-[#0C2C55] font-bold text-xs">4.8</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-[28px] border border-dashed border-gray-200 bg-white py-16 text-center sm:rounded-[40px] sm:py-20">
            <PackageSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">Belum ada produk untuk kategori "{activeCategory}"</p>
          </div>
        )}
      </div>

      {/* PAGINATION BOX - SEKARANG SELALU MUNCUL */}
      <div className="mt-8 flex justify-center sm:mt-10">
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Tombol Sebelumnya */}
          <button 
            disabled={currentPage === 1}
            onClick={() => pindahHalaman(currentPage - 1)}
            className="border-r border-gray-200 p-2 text-[#0C2C55] transition-all hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white sm:p-3"
          >
            <ChevronLeft size={18} className="stroke-[3px] sm:h-5 sm:w-5" />
          </button>
          
          {/* Angka-angka */}
          <div className="flex">
            {getPageNumbers().map((page, i) => (
              <button 
                key={i}
                onClick={() => pindahHalaman(page)}
                className={`border-r border-gray-100 px-3 py-2 text-xs font-bold transition-all last:border-r-0 sm:px-5 sm:py-3 sm:text-sm ${
                  page === "..." ? "cursor-default text-gray-400" : 
                  currentPage === page 
                  ? "bg-[#0C2C55] text-white" 
                  : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Tombol Selanjutnya */}
          <button 
            disabled={currentPage === jumlahHalaman || filteredProducts.length === 0}
            onClick={() => pindahHalaman(currentPage + 1)}
            className="border-l border-gray-200 p-2 text-[#0C2C55] transition-all hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white sm:p-3"
          >
            <ChevronRight size={18} className="stroke-[3px] sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

    </section>
  );
}
