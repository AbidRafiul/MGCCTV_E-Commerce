"use client";

import Link from "next/link";
import { 
  Menu, Search, ShoppingCart, X, LogOut, User, 
  Bell, CheckCircle2, AlertTriangle, Package 
} from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";
import { getCartCount } from "@/services/cartService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/beranda", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/tentang", label: "Tentang Kami" },
];

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // --- STATE NOTIFIKASI MENGGUNAKAN API ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Hitung yang belum dibaca (dilonggarkan dengan == 0 atau false)
  const unreadNotifCount = notifications.filter(n => n.is_read == 0 || n.is_read === false).length;

  const router = useRouter();

  // FUNGSI FETCH NOTIFIKASI (DENGAN LOG DEBUGGING)
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    console.log('=== DEBUG NOTIFIKASI MULAI ===');
    console.log('1. Cek Token Notif:', token ? 'Token Ada' : 'Token Kosong');
    if (!token || token === "undefined" || token === "null") return;

    try {
      const res = await fetch("http://localhost:3000/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('2. Status HTTP API:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('3. Data Mentah API Notifikasi:', data);
        
        // Pastikan format array
        const notifArray = Array.isArray(data) ? data : (data?.data || data?.notifications || []);
        console.log('4. Data Notif Hasil Filter (Array):', notifArray);
        
        setNotifications(notifArray);
      } else {
         console.error('API merespons dengan status error:', res.status);
      }
    } catch (error) {
      console.error('5. Error Fetch Notif (Jaringan/CORS):', error);
    }
  };

  // FUNGSI TANDAI SATU DIBACA
  const handleNotificationClick = async (idNotifikasi, linkTujuan) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;

    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id_notifikasi === idNotifikasi ? { ...n, is_read: 1 } : n
      )
    );

    try {
      await fetch(`http://localhost:3000/api/notifications/${idNotifikasi}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Gagal menandai notifikasi dibaca:", error);
    }

    if (linkTujuan) {
      setIsNotifOpen(false);
      router.push(linkTujuan);
    }
  };

  // FUNGSI TANDAI SEMUA DIBACA
  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;

    // Optimistic Update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));

    try {
      await fetch("http://localhost:3000/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Gagal menandai semua notifikasi dibaca:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const syncAuth = () => {
      const token = localStorage.getItem("token");
      const isValidToken = token && token !== "undefined" && token !== "null";
      
      setIsLogin(!!isValidToken);

      if (!isValidToken) {
        setProfile(null);
        setCartCount(0);
        setNotifications([]); 
      } else {
        fetchNotifications();
      }
    };

    const syncCartCount = async () => {
      const token = localStorage.getItem("token");
      const isValidToken = token && token !== "undefined" && token !== "null";
      
      if (isValidToken) {
        try {
          const count = await getCartCount();
          setCartCount(count);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const isValidToken = token && token !== "undefined" && token !== "null";
      
      if (!isValidToken) return;

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setProfile(data.user);
        } else {
          // Jika token tidak valid di mata server, hapus sesi login (optional tapi direkomendasikan)
          setProfile(null);
          setIsLogin(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        setProfile(null);
      }
    };

    const handleFocus = () => {
      syncAuth();
      fetchProfile();
      syncCartCount();
    };

    handleScroll();
    handleFocus();

    // Polling notifikasi setiap 30 detik
    const notifInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      const isValidToken = token && token !== "undefined" && token !== "null";
      if (isValidToken) fetchNotifications();
    }, 30000);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleFocus);
    window.addEventListener("cart-updated", syncCartCount);

    return () => {
      clearInterval(notifInterval);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleFocus);
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("mgcctv-cart");
    localStorage.removeItem("mgcctv-checkout");

    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";

    setIsLogin(false);
    setProfile(null);
    setCartCount(0);
    setNotifications([]);
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);

    window.dispatchEvent(new Event("cart-updated"));

    toast.success("Berhasil Logout", {
      description: "Anda telah keluar dari sesi dengan aman.",
    });

    setTimeout(() => {
      window.location.href = "/beranda";
    }, 1000);
  };

  const profileInitial = profile?.nama?.trim()?.charAt(0)?.toUpperCase() || "U";

  const getNotifIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} className="text-green-500" />;
    if (type === 'stok' || type === 'warning') return <AlertTriangle size={18} className="text-amber-500" />;
    if (type === 'pesanan' || type === 'package' || type === 'transaksi') return <Package size={18} className="text-blue-500" />;
    return <Bell size={18} className="text-blue-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <>
      <nav
        suppressHydrationWarning
        className={`fixed top-0 w-full z-[100] transition-all duration-300 font-sans ${
          isScrolled
            ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-200/50 py-3"
            : "bg-white py-4 md:py-5"
        }`}
      >
        <div className="w-full px-5 md:px-8 xl:px-12 2xl:px-20 flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center gap-4 xl:gap-8 z-50">
            <Link href="/beranda" className="flex items-center gap-2 group cursor-pointer shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img src="/images/logo.jpg" alt="MG CCTV" className="h-6 w-auto object-contain" />
                </div>
              </div>
              <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">CCTV</span>
            </Link>

            <div className="hidden lg:block w-px h-8 bg-slate-200"></div>

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-4 py-2 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:text-blue-600 transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-end items-center gap-3 xl:gap-5">
            {/* Search Desktop */}
            <div className="hidden lg:block relative text-slate-600">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input type="text" placeholder="Cari CCTV..." className="pl-9 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 border border-transparent rounded-full text-sm w-48 xl:w-64 focus:w-72 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none" />
            </div>

            {/* ICONS DESKTOP */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              
              {/* Notifikasi */}
              {isLogin && (
                <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2.5 rounded-full transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    <Bell size={20} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                        >
                          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-extrabold text-slate-900">Notifikasi</h3>
                            {unreadNotifCount > 0 && (
                              <button type="button" onClick={handleMarkAllRead} className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                                Tandai dibaca
                              </button>
                            )}
                          </div>
                          <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notif) => (
                                <div 
                                  key={notif.id_notifikasi} 
                                  onClick={() => handleNotificationClick(notif.id_notifikasi, notif.link_tujuan || notif.link)}
                                  className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${(notif.is_read == 0 || notif.is_read === false) ? 'bg-blue-50/30' : ''}`}
                                >
                                  <div className="mt-0.5 shrink-0">{getNotifIcon(notif.tipe)}</div>
                                  <div className="flex-1 space-y-1">
                                    <h4 className={`text-sm font-bold ${(notif.is_read == 0 || notif.is_read === false) ? 'text-slate-900' : 'text-slate-700'}`}>{notif.judul}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.pesan}</p>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-1">{formatDate(notif.created_at)}</p>
                                  </div>
                                  {(notif.is_read == 0 || notif.is_read === false) && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>}
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center text-slate-400 text-sm">Belum ada notifikasi</div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Cart */}
              <button type="button" onClick={() => router.push("/keranjang")} className="relative p-2.5 rounded-full text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors shrink-0">
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center shrink-0 border-l border-slate-200 pl-4 ml-2">
              {isMounted && (!isLogin ? (
                  <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap ml-2">
                    Masuk
                  </Link>
                ) : (
                  <div className="relative ml-2">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow w-full text-left"
                    >
                      <div className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                          {profileInitial}
                        </div>
                        <div className="flex min-w-0 max-w-[120px] flex-col justify-center">
                          <span className="truncate font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                            {profile?.nama || "User"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                          >
                            <div className="flex flex-col py-2">
                              <Link 
                                href="/profile" 
                                onClick={() => setIsDropdownOpen(false)}
                                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                              >
                                <User size={16} /> Profil Saya
                              </Link>
                              <Link 
                                href="/riwayat" 
                                onClick={() => setIsDropdownOpen(false)}
                                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                              >
                                <Package size={16} /> Pesanan Saya
                              </Link>
                              <div className="w-full h-px bg-slate-100 my-1"></div>
                              <button 
                                onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }}
                                className="px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 w-full text-left"
                              >
                                <LogOut size={16} /> Logout
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>

            {/* MOBILE ICONS */}
            <div className="flex items-center gap-2 lg:hidden z-50">
              {isLogin && (
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2.5 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                  <Bell size={18} />
                  {unreadNotifCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">{unreadNotifCount}</span>}
                </button>
              )}

              <button type="button" onClick={() => router.push("/keranjang")} className="relative p-2.5 rounded-full text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors">
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 lg:hidden overflow-hidden">
              <div className="px-6 py-6 flex flex-col gap-6">
                <div className="relative">
                  <Search size={18} className="absolute inset-y-0 left-4 my-auto text-slate-400" />
                  <input type="text" placeholder="Cari CCTV..." className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" />
                </div>

                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-slate-700 text-base hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-3 rounded-2xl">
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  {isMounted && (!isLogin ? (
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                        Masuk ke Akun
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                            {profileInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{profile?.nama || "User"}</p>
                            <p className="text-xs font-medium text-slate-500 truncate">{profile?.email || "-"}</p>
                          </div>
                          <User size={20} className="text-slate-400" />
                        </Link>
                        <button onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }} className="w-full py-4 flex items-center justify-center gap-2 font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100">
                          <LogOut size={18} /> Keluar Akun
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} className="relative w-full max-w-[400px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl ring-1 ring-slate-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                  <LogOut size={28} className="ml-1" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Akhiri Sesi?</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Anda akan keluar dari akun ini. Anda harus masuk kembali untuk melihat keranjang dan pesanan Anda.</p>
                <div className="flex w-full gap-3">
                  <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                  <button onClick={handleLogout} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 hover:shadow-lg transition-all">Ya, Keluar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}