"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const paymentMethods = [
    {
      name: "BNI",
      image: "/images/BNI.jpg",
    },
    {
      name: "BRI",
      image: "/images/bri.jpg",
    },
    {
      name: "Mandiri",
      image: "/images/mandiri.jpg",
    },
    {
      name: "GoPay",
      image: "/images/gopay.jpg",
    },
  ];

  return (
    <footer className="relative mt-10 overflow-hidden bg-[#0B203F] px-5 pb-5 pt-10 text-white md:mt-16 md:px-16 md:pb-8 md:pt-14">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_28%)]" />
      <div className="absolute left-[-8%] top-10 h-40 w-40 rotate-12 rounded-[2.5rem] border border-white/8 bg-white/[0.03] shadow-[0_0_80px_rgba(59,130,246,0.08)] backdrop-blur-sm md:h-56 md:w-56" />
      <div className="absolute right-[8%] top-[-3rem] h-32 w-32 rounded-full border border-cyan-300/10 bg-cyan-400/10 blur-2xl md:h-44 md:w-44" />
      <div className="absolute bottom-16 right-[-2rem] h-48 w-48 rotate-45 rounded-[3rem] border border-white/6 bg-white/[0.025] md:h-64 md:w-64" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl rounded-[24px] border border-white/8 bg-white/[0.04] px-5 py-6 shadow-[0_20px_80px_rgba(3,10,24,0.35)] backdrop-blur-md md:px-8 md:py-7">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
          <div className="space-y-3 md:space-y-6">
            <Link href="/" className="group flex items-center gap-1">
              <span className="text-lg font-bold tracking-tighter text-white md:text-xl">
                MG<span className="text-sky-400">CCTV</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-300 md:text-[13px]">
              Solusi keamanan pintar untuk rumah dan bisnis Anda. Kami menghadirkan teknologi pengawasan terbaik dengan instalasi profesional dan harga yang tetap terjangkau.
            </p>
          </div>

          <div>
            <h3 className="mb-3 border-l-4 border-sky-400 pl-3 text-[15px] font-bold md:mb-5 md:text-base">
              Menu Cepat
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 md:space-y-3 md:text-[13px]">
              <li><Link href="/beranda" className="transition hover:text-sky-300">Beranda</Link></li>
              <li><Link href="/produk" className="transition hover:text-sky-300">Produk Unggulan</Link></li>
              <li><Link href="/tentang" className="transition hover:text-sky-300">Tentang Kami</Link></li>
              <li><Link href="/profile" className="transition hover:text-sky-300">Profil Saya</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 border-l-4 border-sky-400 pl-3 text-[15px] font-bold md:mb-5 md:text-base">
              Kontak Kami
            </h3>
            <ul className="space-y-3 text-xs text-slate-300 md:space-y-3 md:text-[13px]">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-300/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <a href="tel:6281234567890" className="transition hover:text-white">0812-3456-7890</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-300/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <a href="mailto:mgcctv@gmail.com" className="transition hover:text-white">mgcctv@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-300/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>Madiun, Jawa Timur, Indonesia</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 border-l-4 border-sky-400 pl-3 text-[15px] font-bold md:mb-5 md:text-base">
              Ikuti Kami
            </h3>
            <div className="flex gap-3 md:gap-4">
              <a
                href="https://instagram.com/mgcctv"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/10 shadow-lg transition hover:-translate-y-0.5 hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-pink-600 md:h-10 md:w-10 md:rounded-xl"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition md:h-[22px] md:w-[22px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/10 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-500 md:h-10 md:w-10 md:rounded-xl"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition md:h-[22px] md:w-[22px]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
              </a>
              <a
                href="mailto:mgcctv@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/10 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 md:h-10 md:w-10 md:rounded-xl"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition md:h-[22px] md:w-[22px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-gradient-to-br from-white/8 to-white/[0.03] p-3.5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">Trusted Security</p>
              <p className="mt-2 text-xs font-semibold text-white md:text-[13px]">Instalasi rapi, perangkat resmi, dan support after sales yang responsif.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-center md:mt-9 md:flex-row md:pt-6">
          <p className="text-[10px] text-slate-400 md:text-left md:text-xs">
            Copyright {currentYear} <span className="font-semibold text-white">MG CCTV</span>. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 md:text-[11px]">
              Metode pembayaran didukung
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="group flex h-10 min-w-[74px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_10px_30px_rgba(2,8,23,0.18)] transition hover:-translate-y-0.5 md:h-11 md:min-w-[88px]"
                >
                  <div className="relative h-full w-full bg-white">
                    <Image
                      src={method.image}
                      alt={`Logo pembayaran ${method.name}`}
                      fill
                      sizes="88px"
                      className="object-contain p-1.5 md:p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
