"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";
import { getCartCount } from "@/services/cartService";
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: "/beranda", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function Navbar() {
  // Pelindung Hydration
  const [isMounted, setIsMounted] = useState(false); 
  const [isLogin, setIsLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const syncAuth = async () => {
      const token = localStorage.getItem("token");
      setIsLogin(!!token);
<<<<<<< HEAD
      if (!token) return setProfile(null);
=======

      if (!token) {
        setProfile(null);
      }
    };

    const syncCartCount = () => {
      setCartCount(getCartCount());
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setProfile(null);
        return;
      }
>>>>>>> main

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setProfile(data.user || null);
        }
      } catch {
        setProfile(null);
      }
    };

<<<<<<< HEAD
=======
    const handleFocus = () => {
      syncLoginState();
      fetchProfile();
      syncCartCount();
    };

>>>>>>> main
    handleScroll();
    syncAuth();

<<<<<<< HEAD
=======
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleFocus);
    window.addEventListener("cart-updated", syncCartCount);
>>>>>>> main
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", syncAuth);
    return () => {
<<<<<<< HEAD
=======
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleFocus);
      window.removeEventListener("cart-updated", syncCartCount);
>>>>>>> main
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: "Sesi Anda akan diakhiri.",
      icon: 'warning',
      showCancelButton: true,
      width: isMobile ? 320 : 420,
      padding: isMobile ? "1.25rem" : "1.75rem",
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#64748b', 
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        
        Swal.fire({
          title: 'Berhasil Logout!',
          icon: 'success',
          width: isMobile ? 300 : 380,
          padding: isMobile ? "1.1rem" : "1.5rem",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "/beranda";
        });
      }
    });
  };

<<<<<<< HEAD
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const profileInitial = profile?.nama?.trim()?.charAt(0)?.toUpperCase() || "U";
=======
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const profileInitial = profile?.nama?.trim()?.charAt(0)?.toUpperCase() || "P";

  const handleAddToCart = () => {
    router.push("/keranjang");
  }

  const menuClass =
    "relative text-[#0C2C55] font-semibold transition-all duration-300 hover:text-blue-600 " +
    "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 " +
    "after:bottom-[-4px] after:left-0 after:bg-blue-600 after:origin-bottom-right " +
    "after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left";
>>>>>>> main

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3" : "bg-white py-4"
    }`}>
      
      {/* CONTAINER EDGE-TO-EDGE */}
      <div className="w-full px-6 md:px-12 lg:px-20 flex justify-between items-center">
        
        {/* BAGIAN 1: LOGO (KIRI) */}
        <div className="flex-1 flex justify-start z-50">
          <Link href="/beranda" className="flex items-center gap-2 group cursor-pointer">
            <img src="/images/logo.jpg" alt="MG Logo" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-2xl text-[#0C2C55] tracking-tight transition-colors">
              CCTV
            </span>
          </Link>
        </div>

<<<<<<< HEAD
        {/* BAGIAN 2: DESKTOP MENU (TENGAH) */}
        <div className="hidden lg:flex flex-1 justify-center gap-8 xl:gap-12 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[#0C2C55] font-semibold hover:text-blue-600 transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>
=======
        <button
          onClick={handleAddToCart}
          type="button"
          className="relative p-2 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors group hidden lg:block"
          aria-label="Keranjang"
        >
          <ShoppingCart
            size={20}
            className="text-[#0C2C55] transition-transform group-hover:scale-110"
          />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold leading-none text-white shadow-sm">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </button>
>>>>>>> main

        {/* BAGIAN 3: DESKTOP ACTIONS (KANAN) */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-4 xl:gap-6">
          
          <div className="relative text-[#0C2C55]">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari perangkat..."
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-44 xl:w-56 focus:w-64 focus:ring-2 focus:ring-blue-500 transition-all duration-300 outline-none"
            />
          </div>

          <button type="button" className="relative p-2 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors group">
            <ShoppingCart size={20} className="text-[#0C2C55] transition-transform group-hover:scale-110" />
          </button>

          {/* AUTH PELINDUNG HYDRATION */}
          <div className="flex items-center gap-4 pl-4 xl:pl-6 border-l border-slate-200">
            {isMounted && (
              <>
                {!isLogin ? (
                  <Link href="/login" className="bg-[#0C2C55] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 whitespace-nowrap">
                    Login
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/profile" className="flex items-center gap-2 group">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md group-hover:ring-2 group-hover:ring-blue-300 transition-all text-sm font-semibold">
                        {profileInitial}
                      </div>
                      <div className="flex min-w-0 max-w-[150px] flex-col">
                        <span className="truncate font-bold text-[#0C2C55] text-sm group-hover:text-blue-600 transition-colors">
                          {profile?.nama || "User"}
                        </span>
                        <span className="truncate text-xs text-slate-500">
                          {profile?.email || "-"}
                        </span>
                      </div>
                    </Link>
                    <button type="button" onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                      <LogOut size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* MOBILE TOGGLE */}
        <div className="flex items-center gap-3 lg:hidden z-50">
          <button type="button" className="rounded-full bg-blue-50 p-2 text-[#0C2C55] transition-colors hover:bg-blue-100">
=======
        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={handleAddToCart}
            className="relative rounded-full bg-blue-50 p-2 text-[#0C2C55] transition-colors hover:bg-blue-100"
          >
>>>>>>> main
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
          <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full bg-[#0C2C55] p-2 text-white transition-colors hover:bg-blue-700">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN - BERSAHABAT DENGAN HYDRATION */}
      <div className={`absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 origin-top overflow-hidden lg:hidden ${isMobileMenuOpen ? "max-h-[600px] border-t border-slate-100" : "max-h-0"}`}>
        <div className="px-6 py-6 flex flex-col gap-6">
          
          <div className="relative">
            <Search size={18} className="absolute inset-y-0 left-4 my-auto text-slate-400" />
            <input type="text" placeholder="Cari perangkat CCTV..." className="w-full bg-slate-50 border border-slate-100 rounded-full py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMobileMenu} className="font-bold text-[#0C2C55] text-lg hover:text-blue-600 transition-colors px-2 py-2 rounded-xl hover:bg-blue-50">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col gap-3">
            {isMounted && (
              <>
                {!isLogin ? (
                  <Link href="/login" onClick={closeMobileMenu} className="w-full bg-[#0C2C55] text-white py-3.5 rounded-xl text-center font-bold hover:bg-blue-800 transition-colors">
                    Login / Masuk
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">{profileInitial}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0C2C55] truncate">{profile?.nama || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{profile?.email || "-"}</p>
                      </div>
                    </Link>
                    <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut size={18} /> Keluar Akun
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
