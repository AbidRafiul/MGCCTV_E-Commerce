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
    <section className="px-6 pb-20 max-w-6xl mx-auto min-h-[500px]">
      
      {/* FILTER KATEGORI */}
      <div className="flex flex-wrap gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            className={`px-8 py-2.5 rounded-full font-bold border transition-all duration-300 ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {produkTampil.length > 0 ? (
          produkTampil.map((product) => (
            <Link 
              href={`/produk/${product.id_produk}`} 
              key={product.id_produk} 
              className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="aspect-square bg-slate-50 rounded-[24px] mb-6 flex items-center justify-center p-6 overflow-hidden">
                <img 
                  src={product.gambar_produk || "/images/placeholder.jpg"} 
                  alt={product.nama_produk} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-[#0C2C55] line-clamp-2">
                  {product.nama_produk}
                </h3>
                <p className="text-blue-600 font-black text-2xl">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.harga_produk)}
                </p>
                <div className="flex items-center gap-1.5 bg-yellow-50 w-fit px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-[#0C2C55] font-bold text-xs">4.8</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <PackageSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">Belum ada produk untuk kategori "{activeCategory}"</p>
          </div>
        )}
      </div>

      {/* PAGINATION BOX - SEKARANG SELALU MUNCUL */}
      <div className="flex justify-center mt-10">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Tombol Sebelumnya */}
          <button 
            disabled={currentPage === 1}
            onClick={() => pindahHalaman(currentPage - 1)}
            className="p-3 text-[#0C2C55] hover:bg-gray-50 border-r border-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all"
          >
            <ChevronLeft size={20} className="stroke-[3px]" />
          </button>
          
          {/* Angka-angka */}
          <div className="flex">
            {getPageNumbers().map((page, i) => (
              <button 
                key={i}
                onClick={() => pindahHalaman(page)}
                className={`px-5 py-3 text-sm font-bold transition-all border-r border-gray-100 last:border-r-0 ${
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
            className="p-3 text-[#0C2C55] hover:bg-gray-50 border-l border-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all"
          >
            <ChevronRight size={20} className="stroke-[3px]" />
          </button>
        </div>
      </div>

    </section>
  );
}