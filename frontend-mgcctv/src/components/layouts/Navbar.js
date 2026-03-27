"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";
import Swal from "sweetalert2";

const navLinks = [
  { href: "/beranda", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function Navbar() {
  const [isLogin, setIsLogin] = useState(() =>
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const syncLoginState = () => {
      const token = localStorage.getItem("token");
      setIsLogin(!!token);

      if (!token) {
        setProfile(null);
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data profile");
        }

        setProfile(data.user || null);
      } catch {
        setProfile(null);
      }
    };

    const handleFocus = () => {
      syncLoginState();
      fetchProfile();
    };

    handleScroll();
    handleFocus();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleFocus);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleFocus);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Apakah yakin untuk logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLogin(false);
    setProfile(null);
    setIsMobileMenuOpen(false);
    window.location.reload();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const profileInitial = profile?.nama?.trim()?.charAt(0)?.toUpperCase() || "P";

  const menuClass =
    "relative text-[#0C2C55] font-semibold transition-all duration-300 hover:text-blue-600 " +
    "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 " +
    "after:bottom-[-4px] after:left-0 after:bg-blue-600 after:origin-bottom-right " +
    "after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-white"
      }`}
    >
      {/* LOGO AREA */}
      <Link href="/beranda" className="flex items-center gap-3 group cursor-pointer">
        <div className="shrink-0">
          <img
            src="/images/logo.jpg"
            alt="MG Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span className="font-bold text-3xl text-[#0C2C55] tracking-tight group-hover:text-blue-600 transition-colors">
          CCTV
        </span>
      </Link>

      {/* MENU UTAMA */}
      <div className="hidden lg:flex gap-10 items-center ml-auto mr-12">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className={menuClass}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* ACTIONS (Search, Cart, Auth) */}
      <div className="flex gap-5 items-center shrink-0">
        <div className="relative hidden md:block text-[#0C2C55]">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari perangkat..."
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-2xl text-sm w-40 focus:w-60 focus:ring-2 focus:ring-blue-500 transition-all duration-300 outline-none"
          />
        </div>

        <button
          type="button"
          className="relative p-2 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors group hidden lg:block"
          aria-label="Keranjang"
        >
          <ShoppingCart
            size={20}
            className="text-[#0C2C55] transition-transform group-hover:scale-110"
          />
        </button>

        <div className="hidden lg:flex items-center gap-4 ml-2 pl-5 border-l border-gray-200">
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
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md group-hover:ring-2 group-hover:ring-blue-300 transition-all text-sm font-semibold">
                  {profileInitial}
                </div>
                <div className="flex min-w-0 max-w-[180px] flex-col">
                  <span className="truncate font-bold text-[#0C2C55] group-hover:text-blue-600 transition-colors">
                    {profile?.nama || "Profile"}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {profile?.email || "-"}
                  </span>
                </div>
              </Link>
              <button
                type="button"
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

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="rounded-full bg-blue-50 p-2 text-[#0C2C55] transition-colors hover:bg-blue-100"
            aria-label="Keranjang"
          >
            <ShoppingCart size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded-full bg-[#0C2C55] p-2 text-white transition-colors hover:bg-blue-700"
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full border-t border-slate-200 bg-white px-4 pb-5 pt-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <div className="relative text-[#0C2C55]">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari perangkat..."
                className="w-full rounded-2xl border border-slate-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {isLogin && profile && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {profileInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0C2C55]">
                    {profile.nama || "Profile"}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {profile.email || "-"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-xl px-3 py-2 font-semibold text-[#0C2C55] transition hover:bg-blue-50 hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              {!isLogin ? (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-[#0C2C55] px-4 py-3 text-center font-bold text-white transition hover:bg-blue-700"
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-blue-50 px-4 py-3 text-center font-semibold text-[#0C2C55] transition hover:bg-blue-100"
                  >
                    Buka Profil
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-500 transition hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
