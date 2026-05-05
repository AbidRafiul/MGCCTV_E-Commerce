"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from 'sweetalert2';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  
  // State Profil Dinamis (Username, Email, Role)
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // 1. Ambil DATA DARI LOCAL STORAGE
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")?.toLowerCase();
    
    // Set userRole ke state untuk UI footer sidebar
    setUserRole(role);

    const parseJwt = (token) => {
      try {
        const base64 = token.split(".")[1];
        const payload = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(payload);
      } catch {
        return null;
      }
    };

    const decoded = token ? parseJwt(token) : null;
    const isExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;

    //  2. Ekstrak Username & Email dari token payload
    if (decoded) {
      setUserName(decoded.username || decoded.nama || "Admin");
      setUserEmail(decoded.email || "");
    }

    const currentRole = role?.toLowerCase();
    const isRoleAllowed = ["admin", "superadmin"].includes(currentRole);

    // 3. Proteksi Login & Expire Token
    if (!token || !role || !isRoleAllowed || isExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.replace("/login");
      return;
    }

    // 4. Proteksi Spesifik Superadmin (admin/pengguna)
    if (pathname.includes("/admin/pengguna") && role !== "superadmin") {
      alert("Akses ditolak: Halaman ini khusus Superadmin.");
      router.replace("/admin"); 
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:3000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const notifs = data.notifications || data.data || data || [];
          const count = Array.isArray(notifs) ? notifs.filter(n => n.is_read == 0 || n.is_read === false).length : 0;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Gagal memuat notifikasi sidebar:", error);
      }
    };
    
    if (isAllowed) {
      fetchNotifications();
    }
  }, [isAllowed]);

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
      cancelButtonColor: '#3085d6', 
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      shape: 'rounded-xl'
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
          router.replace("/login"); 
        });
      }
    });
  };

  // SVG Icons helper
  const icons = {
    dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    box: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    cart: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    layout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    report: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6m4 6V7m4 10V4M5 20h14" /></svg>,
    purchase: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 6h12M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" /></svg>,
    category: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 12 12 17 22 12"></polyline>
      <polyline points="2 17 12 22 22 17"></polyline>
    </svg>
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", section: "UTAMA", icon: icons.dashboard },
    { name: "Data Barang", href: "/admin/barang", section: "MANAJEMEN", icon: icons.box },
    { name: "Kategori Barang", href: "/admin/kategori", section: "MANAJEMEN", icon: icons.category },
    { name: "Pesanan", href: "/admin/pesanan", section: "MANAJEMEN", icon: icons.cart, badge: 8 },
    { name: "Pembelian", href: "/admin/pembelian", section: "MANAJEMEN", icon: icons.purchase },
    { name: "Data Pengguna", href: "/admin/pengguna", section: "MANAJEMEN", icon: icons.users },
    { name: "Laporan Transaksi", href: "/admin/laporan-transaksi", section: "MANAJEMEN", icon: icons.report },
    { name: "Kelola CMS", href: "/admin/cms", section: "KONTEN & ANALITIK", icon: icons.layout },
    { name: "Notifikasi", href: "/admin/notifikasi", section: "SISTEM", icon: icons.bell, badge: unreadCount > 0 ? unreadCount : null },
    { name: "Pengaturan", href: "/admin/pengaturan", section: "SISTEM", icon: icons.settings },
  ];

  //  Sembunyikan 'Data Pengguna' jika bukan Superadmin
  const filteredMenuItems = menuItems.filter(item => {
    if (item.href.includes("/admin/pengguna")) {
      return userRole === "superadmin";
    }
    return true;
  });

  const sections = [...new Set(filteredMenuItems.map(item => item.section))];

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Memeriksa akses MGCCTV...
      </div>
    );
  }

  return (
    // Mengunci layar secara penuh, tidak bisa scroll di area wrapper (Side Bar Tetap diam)
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      
      {/* Overlay Hitam untuk Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" onClick={toggleSidebar}></div>
      )}

      {/* SIDEBAR - Diatur h-full agar diam di tempat */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 h-full
      `}>
        <div className="h-20 flex items-center px-6 border-b border-transparent shrink-0">
          <div className="text-2xl font-bold flex items-center gap-1.5 text-slate-800">
            <Image src="/images/icon1.jpeg" alt="MG Icon" width={38} height={38} className="object-contain" />
            <span>CCTV</span>
          </div>
          <button className="md:hidden ml-auto text-xl text-slate-500" onClick={toggleSidebar}>✕</button>
        </div>

        {/* Daftar Menu - Scroll internal jika menu terlalu banyak */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide space-y-6">
          {sections.map(section => (
            <div key={section}>
              <div className="text-[11px] font-bold text-slate-400 mb-3 px-3 tracking-wider uppercase">
                {section}
              </div>
              <div className="space-y-1">
                {filteredMenuItems.filter(item => item.section === section).map(item => {
                  const isActive = item.href === "/admin" 
                    ? pathname === "/admin" 
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)} 
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 leading-none
                        ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}
                      `}>
                      <div className="flex items-center gap-3">
                        <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1.5
                          ${isActive ? 'bg-white text-blue-600' : 'bg-orange-500 text-white'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* FOOTER SIDEBAR - Desain Profesional & Dinamis */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Avatar (Inisial Username) */}
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-sm uppercase shadow-sm shadow-blue-600/20">
                {userName ? userName.charAt(0) : "A"}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                {/* Baris 1: Username & Role Badge */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-slate-800 truncate capitalize leading-none">
                    {userName || "Admin"}
                  </span>
                  <span className="bg-blue-50 text-blue-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center justify-center uppercase tracking-wide shrink-0 border border-blue-100 leading-none">
                    {userRole}
                  </span>
                </div>
                {/* Baris 2: Email (Kecil & Truncate dengan Tooltip) */}
                <span className="text-[11px] font-medium text-slate-400 truncate mt-1" title={userEmail}>
                  {userEmail || "admin@mgcctv.com"}
                </span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 shrink-0" title="Keluar">
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* CONTAINER KANAN (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- HEADER KHUSUS MOBILE (BARU DITAMBAHKAN) --- */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <Image src="/images/icon1.jpeg" alt="MG Icon" width={32} height={32} className="object-contain" />
            <span className="text-lg font-bold text-slate-800">MGCCTV</span>
          </div>
          {/* Tombol Burger di Kanan */}
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors border border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* AREA KONTEN UTAMA - Hanya area ini yang bisa di-scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>

    </div>
  );
}
