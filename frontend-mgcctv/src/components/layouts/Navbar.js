"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isLogin, setIsLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogin(!!token);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogin(false);
    window.location.reload();
  };

  const menuClass =
    "relative text-[#0C2C55] font-semibold transition-all duration-300 hover:text-blue-600 " +
    "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 " +
    "after:bottom-[-4px] after:left-0 after:bg-blue-600 after:origin-bottom-right " +
    "after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-lg" : "bg-white"
      }`}
    >
      {/* LOGO AREA */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="flex-shrink-0">
          <img
            src="/images/logo.jpeg"
            alt="MG Logo"
            /* h-10 (40px) akan terlihat sejajar dan seimbang dengan text-3xl */
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span className="font-bold text-3xl text-[#0C2C55] tracking-tight group-hover:text-blue-600 transition-colors">
          CCTV
        </span>
      </div>

      {/* --- MENU UTAMA (SEKARANG DI KANAN) --- */}
      {/* ml-auto mendorong menu ke kanan, mr-12 memberikan jarak ke search bar */}
      <div className="hidden lg:flex gap-10 items-center ml-auto mr-12">
        <Link href="/beranda" className={menuClass}>
          Beranda
        </Link>
        <Link href="/produk" className={menuClass}>
          Produk
        </Link>
        <Link href="/tentang" className={menuClass}>
          Tentang Kami
        </Link>
      </div>

      {/* ACTIONS (Search, Cart, Auth) */}
      <div className="flex gap-5 items-center shrink-0">
        <div className="relative hidden md:block text-[#0C2C55]">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari perangkat..."
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-2xl text-sm w-40 focus:w-60 focus:ring-2 focus:ring-blue-500 transition-all duration-300 outline-none"
          />
        </div>

        <div className="relative p-2 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors group">
          <span className="text-xl group-hover:scale-110 block transition-transform">
            🛒
          </span>
        </div>

        <div className="flex items-center gap-4 ml-2 pl-5 border-l border-gray-200">
          {!isLogin ? (
            <Link
              href="/login"
              className="bg-[#0C2C55] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md group-hover:ring-2 group-hover:ring-blue-300 transition-all">
                  👤
                </div>
                <span className="hidden sm:inline font-bold text-[#0C2C55] group-hover:text-blue-600 transition-colors">
                  Profile
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors group"
                title="Logout"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="group-hover:rotate-12 transition-transform"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
