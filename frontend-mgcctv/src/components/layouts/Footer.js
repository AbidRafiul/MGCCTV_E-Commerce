"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Padding mobile dikurangi (pt-12 pb-6)
    <footer className="bg-[#0C2C55] text-white pt-12 pb-6 md:pt-20 md:pb-10 px-5 md:px-20 mt-12 md:mt-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[150px] opacity-20 -mr-32 -mt-32"></div>
      
      {/* Gap di mobile dikurangi jadi gap-8 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
        
        {/* BRAND SECTION */}
        <div className="space-y-3 md:space-y-6">
          <Link href="/" className="flex items-center gap-1 group">
             {/* Logo text di HP dikecilkan */}
             <span className="font-bold text-xl md:text-2xl tracking-tighter text-white">
               MG<span className="text-blue-400">CCTV</span>
             </span>
          </Link>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Solusi keamanan pintar untuk rumah dan bisnis Anda. Kami menghadirkan teknologi pengawasan terbaik dengan instalasi profesional dan harga yang tetap terjangkau.
          </p>
        </div>

        {/* QUICK MENU */}
        <div>
          <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 border-l-4 border-blue-500 pl-3">Menu Cepat</h3>
          {/* Teks list jadi xs di HP */}
          <ul className="text-xs md:text-sm space-y-2 md:space-y-4 text-gray-400">
            <li><Link href="/beranda" className="hover:text-blue-400 transition-all">Beranda</Link></li>
            <li><Link href="/produk" className="hover:text-blue-400 transition-all">Produk Unggulan</Link></li>
            <li><Link href="/tentang" className="hover:text-blue-400 transition-all">Tentang Kami</Link></li>
            <li><Link href="/profile" className="hover:text-blue-400 transition-all">Profil Saya</Link></li>
          </ul>
        </div>

        {/* CONTACT INFO */}
        <div>
          <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 border-l-4 border-blue-500 pl-3">Kontak Kami</h3>
          <ul className="text-xs md:text-sm space-y-3 md:space-y-4 text-gray-400">
            <li className="flex items-center gap-3">
              {/* Kotak ikon dikecilkan p-1.5 di HP */}
              <span className="bg-blue-600/20 p-1.5 md:p-2 rounded-md md:rounded-lg text-blue-400">📞</span>
              <a href="tel:6281234567890" className="hover:text-white transition">0812-3456-7890</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-600/20 p-1.5 md:p-2 rounded-md md:rounded-lg text-blue-400">✉️</span>
              <a href="mailto:mgcctv@gmail.com" className="hover:text-white transition">mgcctv@gmail.com</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-600/20 p-1.5 md:p-2 rounded-md md:rounded-lg text-blue-400">📍</span>
              <span>Madiun, Jawa Timur, Indonesia</span>
            </li>
          </ul>
        </div>

        {/* SOCIAL MEDIA SECTION */}
        <div>
          <h3 className="font-bold text-base md:text-lg mb-3 md:mb-6 border-l-4 border-blue-500 pl-3">Ikuti Kami</h3>
          <div className="flex gap-3 md:gap-4">
            {/* Tombol sosmed dari w-11 ke w-9 di HP */}
            <a href="https://instagram.com/mgcctv" target="_blank" className="w-9 h-9 md:w-11 md:h-11 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 transition-all group shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition md:w-[22px] md:h-[22px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://wa.me/6281234567890" target="_blank" className="w-9 h-9 md:w-11 md:h-11 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-green-500 transition-all group shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition md:w-[22px] md:h-[22px]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
            </a>
            <a href="mailto:mgcctv@gmail.com" className="w-9 h-9 md:w-11 md:h-11 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all group shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition md:w-[22px] md:h-[22px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER */}
      <div className="border-t border-white/10 mt-10 md:mt-16 pt-6 md:pt-8 flex justify-center items-center text-center">
        <p className="text-gray-500 text-[10px] md:text-xs">
          © {currentYear} <span className="text-white font-semibold">MG CCTV</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}