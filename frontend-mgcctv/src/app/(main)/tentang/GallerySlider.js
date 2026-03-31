"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

export default function GallerySlider({ galeriData }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.children[0].offsetWidth;
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(newIndex);
  };

  if (!galeriData || galeriData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm mx-4 md:mx-0">
        <ImageOff size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Koleksi foto galeri belum tersedia.</p>
      </div>
    );
  }

  // Animasi container & item
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative font-sans">
      {/* Container Foto */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex md:grid md:grid-cols-3 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-6 pb-6 -mx-5 px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {galeriData.map((item) => (
          <motion.div 
            variants={itemVariants}
            key={item.id_cms_konten} 
            className="w-[85vw] max-w-[320px] md:w-auto shrink-0 snap-center aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden shadow-sm group border border-slate-100 bg-slate-50 relative cursor-pointer ring-1 ring-slate-200/50 hover:ring-blue-300 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500"
          >
            <img 
              src={item.url_gambar} 
              alt="Galeri MGCCTV" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {/* Overlay Gradient saat di-hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Penanda Slide (Dots) - Hanya tampil di Mobile */}
      <div className="flex justify-center items-center gap-2 mt-2 md:hidden">
        {galeriData.map((_, index) => (
          <div 
            key={index} 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              activeIndex === index ? "w-8 bg-blue-600 shadow-md shadow-blue-600/30" : "w-2 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}