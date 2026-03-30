"use client";

import { useState, useRef } from "react";

export default function GallerySlider({ galeriData }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fungsi untuk mendeteksi slide mana yang sedang aktif saat digeser
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    // Mengambil lebar satu elemen gambar
    const itemWidth = scrollRef.current.children[0].offsetWidth;
    // Menghitung index gambar yang sedang tampil di tengah
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(newIndex);
  };

  if (galeriData.length === 0) {
    return <div className="text-center py-10 text-slate-400 italic">Belum ada foto galeri.</div>;
  }

  return (
    <div className="relative">
      {/* Container Foto */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {galeriData.map((item) => (
          <div key={item.id_cms_konten} className="w-[85vw] md:w-auto shrink-0 snap-center aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-md group border border-slate-100 bg-white">
            <img src={item.url_gambar} alt="Galeri MGCCTV" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        ))}
      </div>

      {/* Penanda Slide (Dots) - Hanya tampil di Mobile */}
      <div className="flex justify-center items-center gap-2 mt-2 md:hidden">
        {galeriData.map((_, index) => (
          <div 
            key={index} 
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-6 bg-blue-600" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}