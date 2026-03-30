"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: "/beranda", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function Navbar() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setIsLogin(!!localStorage.getItem("token"));
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const syncAuth = async () => {
      const token = localStorage.getItem("token");
      setIsLogin(!!token);
      if (!token) return setProfile(null);

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProfile(data.user);
      } catch {
        setProfile(null);
      }
    };

    handleScroll();
    syncAuth();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: "Sesi Anda akan diakhiri.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#64748b', 
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      shape: 'rounded-xl'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        
        Swal.fire({ title: 'Berhasil Logout!', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => {
          window.location.href = "/beranda";
        });
      }
    });
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const profileInitial = profile?.nama?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3" : "bg-white py-4"
    }`}>
      
      {/* HAPUS max-w, gunakan w-full penuh dengan padding kiri-kanan */}
      <div className="w-full px-6 md:px-12 lg:px-20 flex justify-between items-center">
        
        {/* BAGIAN 1: LOGO (KIRI) - Diberi flex-1 agar mendorong menu ke tengah */}
        <div className="flex-1 flex justify-start z-50">
          <Link href="/beranda" className="flex items-center gap-2 group cursor-pointer">
            <img src="/images/logo.jpg" alt="MG Logo" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-2xl text-[#0C2C55] tracking-tight transition-colors">
              CCTV
            </span>
          </Link>
        </div>

        {/* BAGIAN 2: DESKTOP MENU (TENGAH) */}
        <div className="hidden lg:flex flex-1 justify-center gap-8 xl:gap-12 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[#0C2C55] font-semibold hover:text-blue-600 transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>

        {/* BAGIAN 3: DESKTOP ACTIONS (KANAN) */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-4 xl:gap-6">
          <div className="relative">
            <Search size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
            <input type="text" placeholder="Cari perangkat..." className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm w-44 xl:w-56 focus:w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
          </div>

          <button className="text-[#0C2C55] hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
          </button>

          <div className="flex items-center gap-4 pl-4 xl:pl-6 border-l border-slate-200">
            {!isLogin ? (
              <Link href="/login" className="bg-[#0C2C55] text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">Login</Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">{profileInitial}</div>
                  <span className="font-bold text-[#0C2C55] text-sm group-hover:text-blue-600 transition-colors whitespace-nowrap">{profile?.nama || "User"}</span>
                </Link>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE TOGGLE (Tampil di HP) */}
        <div className="flex items-center gap-5 lg:hidden z-50">
          <button className="text-[#0C2C55] hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#0C2C55] hover:text-blue-600 transition-colors">
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>

      <div className={`absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 origin-top overflow-hidden lg:hidden ${isMobileMenuOpen ? "max-h-[600px] border-t border-slate-100" : "max-h-0"}`}>
        {/* MOBILE TOGGLE - Ikon Polos, Elegan & Minimalis */}
        <div className="flex items-center gap-5 lg:hidden z-50">
          <button className="text-[#0C2C55] hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#0C2C55] hover:text-blue-600 transition-colors">
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN - Desain Bersih & Modern */}
      <div className={`absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 origin-top overflow-hidden lg:hidden ${isMobileMenuOpen ? "max-h-[600px] border-t border-slate-100" : "max-h-0"}`}>
        <div className="px-6 py-6 flex flex-col gap-6">
          
          <div className="relative">
            <Search size={18} className="absolute inset-y-0 left-4 my-auto text-slate-400" />
            <input type="text" placeholder="Cari perangkat CCTV..." className="w-full bg-slate-50 border border-slate-100 rounded-full py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMobileMenu} className="font-bold text-[#0C2C55] text-lg hover:text-blue-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col gap-3">
            {!isLogin ? (
              <Link href="/login" onClick={closeMobileMenu} className="w-full bg-[#0C2C55] text-white py-3.5 rounded-full text-center font-bold hover:bg-blue-800 transition-colors">
                Login / Masuk
              </Link>
            ) : (
              <>
                <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{profileInitial}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0C2C55] truncate">{profile?.nama || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{profile?.email || "-"}</p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <LogOut size={18} /> Keluar Akun
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}