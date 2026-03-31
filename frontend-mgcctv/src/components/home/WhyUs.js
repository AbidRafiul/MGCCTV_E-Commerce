"use client";

import { ShieldCheck, Zap, Smartphone } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function WhyUs({ data }) {
  const sectionDesc = data?.content_value || "Kami memberikan lebih dari sekadar kamera pengawas, kami memberikan ketenangan pikiran untuk aset berharga Anda.";

  const [scrollProgress, setScrollProgress] = useState(0);

  // Fungsi untuk menggerakkan indikator saat di-swipe (Mobile)
  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(isNaN(scrollRatio) ? 0 : scrollRatio * 100);
  };

  const features = [
    {
      title: "Ultra HD Quality",
      desc: "Nikmati kualitas visual tanpa kompromi. Gambar tetap tajam dan jernih bahkan dalam kondisi minim cahaya berkat fitur Advanced Night Vision kami.",
      icon: <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />,
      img: "https://images.unsplash.com/photo-1558002038-1055907df827",
      offset: "md:mt-0" // Posisi normal
    },
    {
      title: "Fast Installation",
      desc: "Waktu Anda berharga. Tim teknisi profesional kami menjamin pemasangan rapi, cepat, dan tanpa ribet, sistem langsung siap digunakan.",
      icon: <Zap className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />,
      img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
      offset: "md:-translate-y-8" // Posisi sedikit naik ke atas untuk efek zigzag yang estetik
    },
    {
      title: "Akses Dimana Saja",
      desc: "Pantau properti langsung dari genggaman. Aplikasi seluler responsif memungkinkan akses real-time kapan saja dan dari mana saja secara stabil.",
      icon: <Smartphone className="w-6 h-6 md:w-7 md:h-7 text-green-500" />,
      img: "https://images.unsplash.com/photo-1661326248003-094982639fb7",
      offset: "md:mt-0" // Posisi normal
    }
  ];

  // Konfigurasi Animasi saat di-scroll
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative px-4 py-20 md:px-6 md:py-32 bg-slate-50 overflow-hidden font-sans">
      {/* Dekorasi Ambient Glow Background */}
      <div className="absolute top-0 left-0 md:-left-20 w-64 md:w-96 h-64 md:h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 md:-right-20 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADING SECTION dengan animasi Scroll */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            Nilai Lebih Kami
          </span>
          <h2 className="text-3xl md:text-5xl text-slate-900 font-extrabold tracking-tight mt-2">
            Kenapa Memilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">MGCCTV?</span>
          </h2>
          <p className="mt-4 md:mt-6 text-slate-500 max-w-2xl mx-auto text-sm md:text-lg px-2 leading-relaxed">
            {sectionDesc}
          </p>
        </motion.div>

        {/* CONTAINER KARTU */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Scrollable container untuk Mobile, Grid untuk Desktop */}
          <div 
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-8 items-stretch pb-8 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {features.map((item, index) => (
              <motion.div 
                variants={cardVariants}
                key={index}
                className={`w-[85vw] max-w-[340px] md:w-auto md:max-w-none snap-center shrink-0 ${item.offset}`}
              >
                {/* Desain Kartu Modern */}
                <div className="group flex h-full flex-col bg-white rounded-3xl p-3 shadow-sm ring-1 ring-slate-200 hover:ring-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                  
                  {/* Container Gambar & Icon */}
                  <div className="relative overflow-hidden rounded-2xl h-48 md:h-56 shrink-0 bg-slate-100">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    {/* Overlay gradasi agar icon lebih menonjol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
                    
                    {/* Icon mengambang (Glassmorphism) */}
                    <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl shadow-lg transform transition-transform group-hover:-translate-y-1">
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Container Teks */}
                  <div className="p-5 md:p-6 flex flex-col grow">
                    <h3 className="text-xl md:text-2xl text-slate-900 font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base grow">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* INDIKATOR SCROLL AESTHETIC (Hanya muncul di Mobile) */}
          <div className="md:hidden mt-2 flex justify-center items-center">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full w-1/2 bg-blue-600 rounded-full transition-transform duration-100 ease-out"
                style={{ transform: `translateX(${scrollProgress}%)` }}
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}