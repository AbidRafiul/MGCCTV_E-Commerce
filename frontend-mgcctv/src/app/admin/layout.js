"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    if(confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"; 
      window.location.reload(); 
    }
  };

  // SVG Icons helper
  const icons = {
    dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    box: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    plusSquare: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    category: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    cart: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    userPlus: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    layout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    bell: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
  };

  // Struktur Menu Lengkap (Sesuai Figma)
  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", section: "UTAMA", icon: icons.dashboard },
    
    { name: "Data Barang", href: "/admin/barang", section: "MANAJEMEN", icon: icons.box },
    { name: "Tambah Barang", href: "/admin/barang/tambah", section: "MANAJEMEN", icon: icons.plusSquare },
    { name: "Kategori Barang", href: "/admin/kategori", section: "MANAJEMEN", icon: icons.category },
    { name: "Pesanan", href: "/admin/pesanan", section: "MANAJEMEN", icon: icons.cart, badge: 8 },
    { name: "Data Pengguna", href: "/admin/pengguna", section: "MANAJEMEN", icon: icons.users },
    { name: "Tambah User", href: "/admin/pengguna/tambah", section: "MANAJEMEN", icon: icons.userPlus },
    
    { name: "Kelola CMS", href: "/admin/cms", section: "KONTEN & ANALITIK", icon: icons.layout },
    
    { name: "Notifikasi", href: "/admin/notifikasi", section: "SISTEM", icon: icons.bell, badge: 3 },
    { name: "Pengaturan", href: "/admin/pengaturan", section: "SISTEM", icon: icons.settings },
  ];

  const sections = [...new Set(menuItems.map(item => item.section))];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-inter w-full overflow-hidden">
      
      {/* HEADER MOBILE */}
      <header className="md:hidden bg-white p-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-40 shadow-sm w-full">
        {/* 2. Logo Baru untuk Mobile */}
        <div className="text-2xl font-bold flex items-center gap-1.5 text-slate-800">
          <Image 
            src="/images/icon1.jpeg" // Path ke ikon logo
            alt="MG"
            width={38} // Sesuaikan lebar agar proporsional
            height={38} // Sesuaikan tinggi
            className="object-contain" // Pastikan gambar tidak terpotong
          />
          <span>CCTV</span>
        </div>
        <button 
          className="p-2 rounded-lg hover:bg-slate-100 text-2xl text-slate-600"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* SIDEBAR KIRI (Sesuai Figma) */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 
        flex flex-col z-50 transition-transform duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          {/* 3. Logo Baru untuk Desktop Sidebar */}
          <div className="text-2xl font-bold flex items-center gap-1.5 text-slate-800">
            <Image 
              src="/images/icon1.jpeg" // Path ke ikon logo
              alt="MG Icon"
              width={38} // Sesuaikan lebar agar proporsional
              height={38} // Sesuaikan tinggi
              className="object-contain" // Pastikan gambar tidak terpotong
            />
            <span>CCTV</span>
          </div>
          <button className="md:hidden ml-auto text-xl text-slate-500" onClick={toggleSidebar}>✕</button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow overflow-y-auto px-4 py-4 scrollbar-hide space-y-6">
          {sections.map(section => (
            <div key={section}>
              <div className="text-[11px] font-bold text-slate-400 mb-3 px-3 tracking-wider">
                {section}
              </div>
              <div className="space-y-1">
                {menuItems.filter(item => item.section === section).map(item => {
                  // Pengecekan agar state aktif lebih akurat
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      onClick={() => setIsSidebarOpen(false)} 
                      className={`
                        group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-slate-600 hover:bg-blue-50 hover:text-primary'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Ikon Menu */}
                        <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </div>
                      
                      {/* Badge Bulat Oranye */}
                      {item.badge && (
                        <span className={`
                          text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1.5
                          ${isActive ? 'bg-white text-primary' : 'bg-orange-500 text-white'}
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
        
        {/* FOOTER SIDEBAR: User Profile & Logout (Sesuai Figma) */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 text-sm">
                A
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate text-slate-800">Admin MG CCTV</div>
                <div className="text-[11px] text-primary font-medium truncate">Super Admin</div>
              </div>
            </div>
            
            {/* Tombol Logout Merah Kotak */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-200 shrink-0"
              title="Keluar"
            >
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}