import { useState } from "react";
import { Package, AlertTriangle, User, CheckCircle2, XCircle } from "lucide-react";

export const useNotifikasi = () => {
  // --- DUMMY DATA ---
  const initialNotifications = [
    { id: 1, type: "order", isRead: false, title: "Pesanan baru #ORD-0187 menunggu konfirmasi", description: "Budi Santoso - 2x Hikvision DS-2CD2143G2-I - Total: Rp 2.500.000", time: "5 menit lalu", actionLabel: "Konfirmasi" },
    { id: 2, type: "warning", isRead: false, title: "Stok hampir habis — DVR Dahua 8 Channel", description: "SKU: DAH-DVR8CH - Sisa stok: 3 unit. Segera lakukan restock.", time: "1 jam lalu", actionLabel: "Restock" },
    { id: 3, type: "user", isRead: false, title: "Pelanggan baru terdaftar", description: "Siti Rahayu (siti@email.com) baru mendaftar dari Madiun", time: "2 jam lalu", actionLabel: null },
    { id: 4, type: "success", isRead: true, title: "Pesanan #ORD-0185 berhasil diselesaikan", description: "Pembayaran Rp 5.600.000 dari Andi Wijaya telah dikonfirmasi", time: "Kemarin, 16:42", actionLabel: null },
    { id: 5, type: "error", isRead: true, title: "Pesanan #ORD-0183 dibatalkan pelanggan", description: "Rizal Maulana membatalkan Uniview IPC3614SB", time: "Kemarin, 09:15", actionLabel: null },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const readNotifs = notifications.filter((n) => n.isRead);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getStyleByType = (type) => {
    switch (type) {
      case "order":
        return {
          boxClass: "bg-blue-50/60 border-blue-200",
          iconBg: "bg-blue-500",
          icon: <Package size={18} className="text-white" />,
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
        };
      case "warning":
        return {
          boxClass: "bg-orange-50/60 border-orange-200",
          iconBg: "bg-orange-500",
          icon: <AlertTriangle size={18} className="text-white" />,
          btnClass: "bg-white hover:bg-orange-50 text-orange-600 border border-orange-200",
        };
      case "user":
        return {
          boxClass: "bg-green-50/60 border-green-200",
          iconBg: "bg-green-500",
          icon: <User size={18} className="text-white" />,
          btnClass: "",
        };
      case "success":
        return {
          boxClass: "bg-white border-slate-200",
          iconBg: "bg-green-100",
          icon: <CheckCircle2 size={18} className="text-green-500" />,
          btnClass: "",
        };
      case "error":
        return {
          boxClass: "bg-white border-slate-200",
          iconBg: "bg-red-100",
          icon: <XCircle size={18} className="text-red-500" />,
          btnClass: "",
        };
      default:
        return {
          boxClass: "bg-white border-slate-200",
          iconBg: "bg-slate-200",
          icon: <CheckCircle2 size={18} className="text-slate-500" />,
          btnClass: "",
        };
    }
  };

  return {
    unreadNotifs,
    readNotifs,
    markAllAsRead,
    getStyleByType
  };
};