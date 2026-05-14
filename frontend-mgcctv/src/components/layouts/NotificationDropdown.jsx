"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api"; // Pastikan path ini sesuai dengan file api.js lu

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Menghitung jumlah notifikasi yang belum dibaca (is_read === 0)
  const unreadNotifCount = notifications.filter(n => n.is_read === 0).length;

  // Fungsi untuk mengambil data notifikasi dari Backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      if (res.ok) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error("Gagal ambil notif:", error);
    }
  };

  // Fungsi untuk menandai semua notifikasi sudah dibaca
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state lokal supaya titik merah langsung hilang
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("Gagal tandai dibaca:", error);
    }
  };

  useEffect(() => {
    // Ambil data pertama kali komponen dimuat
    fetchNotifications();

    // Polling setiap 30 detik (biar notif masuk otomatis tanpa di-refresh)
    const notifInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Refresh notif kalau user pindah tab browser lalu balik lagi
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);

    // Bersihkan interval & event listener kalau komponen dibongkar
    return () => {
      clearInterval(notifInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Fungsi buat nentuin icon berdasarkan tipe notifikasi
  const getNotifIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} className="text-green-500" />;
    if (type === 'stok' || type === 'warning') return <AlertTriangle size={18} className="text-amber-500" />;
    if (type === 'pesanan' || type === 'pembayaran' || type === 'status_order') return <CheckCircle2 size={18} className="text-blue-500" />;
    if (type === 'transaksi') return <Package size={18} className="text-orange-500" />;
    return <Bell size={18} className="text-blue-500" />;
  };

  // Fungsi buat nge-format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative z-50">
      {/* TOMBOL LONCENG */}
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

      {/* DROPDOWN ISI NOTIFIKASI */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 10, scale: 0.95 }} 
              transition={{ duration: 0.2 }} 
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
            >
              {/* HEADER DROPDOWN */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900">Notifikasi</h3>
                {unreadNotifCount > 0 && (
                  <button type="button" onClick={handleMarkAllAsRead} className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                    Tandai dibaca
                  </button>
                )}
              </div>
              
              {/* LIST NOTIFIKASI */}
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? notifications.map((notif) => (
                  <div key={notif.id_notifikasi} className={`p-4 border-b border-slate-50 flex gap-3 ${notif.is_read === 0 ? 'bg-blue-50/30' : ''}`}>
                    <div className="mt-0.5 shrink-0">{getNotifIcon(notif.tipe)}</div>
                    <div className="flex-1 space-y-1">
                      <h4 className={`text-sm font-bold ${notif.is_read === 0 ? 'text-slate-900' : 'text-slate-700'}`}>{notif.judul}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.pesan}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    {notif.is_read === 0 && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>}
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-400 text-sm">Belum ada notifikasi</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}