"use client";

import { ShieldCheck, Zap, Smartphone } from "lucide-react";
import { useState } from "react";

export default function WhyUs({ data }) {
  const sectionDesc = data?.content_value || "Kami memberikan lebih dari sekadar kamera pengawas, kami memberikan ketenangan pikiran untuk aset berharga Anda.";

  const [scrollProgress, setScrollProgress] = useState(0);

  // Fungsi untuk menggerakkan indikator saat di-swipe
  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(isNaN(scrollRatio) ? 0 : scrollRatio * 100);
  };

  const features = [
    {
      title: "Ultra HD Quality",
      desc: "Nikmati kualitas visual tanpa kompromi dengan sensor mutakhir. Gambar tetap tajam dan jernih bahkan dalam kondisi minim cahaya berkat fitur Advanced Night Vision kami.",
      icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      img: "https://images.unsplash.com/photo-1558002038-1055907df827",
      styles: ""
    },
    {
      title: "Fast Installation",
      desc: "Waktu Anda berharga. Tim teknisi profesional kami menjamin pemasangan rapi, cepat, dan tanpa ribet, sehingga sistem keamanan Anda langsung siap digunakan.",
      icon: <Zap className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />,
      img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
      styles: "md:-translate-y-6 shadow-xl border-blue-100" 
    },
    {
      title: "Akses Dimana Saja",
      desc: "Pantau keamanan properti langsung dari genggaman. Aplikasi seluler kami yang responsif memungkinkan akses real-time kapan saja dan dari mana saja secara stabil.",
      icon: <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-green-500" />,
      img: "https://images.unsplash.com/photo-1661326248003-094982639fb7",
      styles: ""
    }
  ];

  return (
    <section className="relative px-4 md:px-6 py-16 md:py-24 bg-slate-50 overflow-hidden">
      <div className="absolute top-0 left-0 md:left-1/4 w-48 md:w-64 h-48 md:h-64 bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-0 right-0 md:right-1/4 w-48 md:w-64 h-48 md:h-64 bg-indigo-100 rounded-full blur-[100px] opacity-50"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-2xl md:text-5xl text-[#0C2C55] font-extrabold tracking-tight">
            Kenapa MG CCTV Jadi <span className="text-blue-600">Pilihan Utama?</span>
          </h2>
          <p className="mt-3 md:mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base px-2">
            {sectionDesc}
          </p>
        </div>

        <div>
          {/* CONTAINER KARTU (Scrollbar disembunyikan sepenuhnya) */}
          <div 
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-5 md:gap-8 lg:gap-10 items-stretch pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {features.map((item, index) => (
              <div 
                key={index}
                className={`w-[85vw] max-w-[320px] md:w-auto md:max-w-none snap-center shrink-0 group flex flex-col bg-white rounded-2xl md:rounded-3xl p-3 shadow-lg border border-gray-100 hover:border-blue-300 transition-all duration-300 ${item.styles}`}
              >
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl h-40 md:h-48 shrink-0">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C55]/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white/90 backdrop-blur-md p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-md">
                    {item.icon}
                  </div>
                </div>
                
                <div className="p-4 md:p-6 flex flex-col grow">
                  <h3 className="text-lg md:text-2xl text-[#0C2C55] font-bold mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm grow">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* INDIKATOR SCROLL AESTHETIC (Hanya muncul di Mobile) */}
          <div className="md:hidden mt-6 flex justify-center items-center">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full w-1/2 bg-blue-600 rounded-full transition-transform duration-100 ease-out"
                style={{ transform: `translateX(${scrollProgress}%)` }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}