"use client";

import { useState } from "react";
import { Package, AlertTriangle, User, CheckCircle2, XCircle, CheckCheck } from "lucide-react";

// --- DUMMY DATA (Sesuai Desain Figma) ---
const initialNotifications = [
  {
    id: 1,
    type: "order",
    isRead: false,
    title: "Pesanan baru #ORD-0187 menunggu konfirmasi",
    description: "Budi Santoso - 2x Hikvision DS-2CD2143G2-I - Total: Rp 2.500.000",
    time: "5 menit lalu",
    actionLabel: "Konfirmasi",
  },
  {
    id: 2,
    type: "warning",
    isRead: false,
    title: "Stok hampir habis — DVR Dahua 8 Channel",
    description: "SKU: DAH-DVR8CH - Sisa stok: 3 unit. Segera lakukan restock.",
    time: "1 jam lalu",
    actionLabel: "Restock",
  },
  {
    id: 3,
    type: "user",
    isRead: false,
    title: "Pelanggan baru terdaftar",
    description: "Siti Rahayu (siti@email.com) baru mendaftar dari Madiun",
    time: "2 jam lalu",
    actionLabel: null,
  },
  {
    id: 4,
    type: "success",
    isRead: true,
    title: "Pesanan #ORD-0185 berhasil diselesaikan",
    description: "Pembayaran Rp 5.600.000 dari Andi Wijaya telah dikonfirmasi",
    time: "Kemarin, 16:42",
    actionLabel: null,
  },
  {
    id: 5,
    type: "error",
    isRead: true,
    title: "Pesanan #ORD-0183 dibatalkan pelanggan",
    description: "Rizal Maulana membatalkan Uniview IPC3614SB",
    time: "Kemarin, 09:15",
    actionLabel: null,
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const readNotifs = notifications.filter((n) => n.isRead);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Icon diperkecil jadi size={18}
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

  return (
    <div className="p-5 md:p-8  w-full max-w-10xl mx-auto">
      
      {/* SECTION: BELUM DIBACA */}
      {unreadNotifs.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-blue-600">
              {unreadNotifs.length} notifikasi belum dibaca
            </h2>
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm w-fit"
            >
              <CheckCheck size={14} />
              Tandai Semua Dibaca
            </button>
          </div>

          <div className="space-y-2.5">
            {unreadNotifs.map((notif) => {
              const style = getStyleByType(notif.type);
              return (
                <div 
                  key={notif.id} 
                  // Padding di dalam box dikecilkan jadi p-3
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${style.boxClass} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Container diperkecil (w-9 h-9) */}
                    <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center shadow-sm ${style.iconBg}`}>
                      {style.icon}
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex flex-col justify-center pt-0.5">
                      <h3 className="text-sm font-bold text-[#0C2C55] mb-0.5 leading-tight">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-1 leading-tight">
                        {notif.description}
                      </p>
                      <span className="text-[11px] font-semibold text-blue-500 leading-none">
                        {notif.time}
                      </span>
                    </div>
                  </div>

                  {/* Action Button diperkecil */}
                  {notif.actionLabel && (
                    <div className="mt-3 sm:mt-0 sm:ml-4 shrink-0">
                      <button className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors shadow-sm ${style.btnClass}`}>
                        {notif.actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PEMISAH */}
      <div className="border-t border-slate-200 border-dashed my-6"></div>

      {/* SECTION: SUDAH DIBACA */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Sudah Dibaca
        </h2>
        <div className="space-y-2.5">
          {readNotifs.map((notif) => {
             const style = getStyleByType(notif.type);
             return (
               <div 
                 key={notif.id} 
                 className={`flex items-start gap-3 p-3 rounded-lg border ${style.boxClass} opacity-75 hover:opacity-100 transition-opacity`}
               >
                 <div className="shrink-0 pt-0.5">
                   {style.icon}
                 </div>
                 <div className="flex flex-col">
                   <h3 className="text-[13px] font-semibold text-slate-700 mb-0.5 leading-tight">
                     {notif.title}
                   </h3>
                   <p className="text-[11px] text-slate-500 mb-1 leading-tight">
                     {notif.description}
                   </p>
                   <span className="text-[10px] font-medium text-slate-400 leading-none">
                     {notif.time}
                   </span>
                 </div>
               </div>
             );
          })}
          
          {readNotifs.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">Belum ada notifikasi yang dibaca.</p>
          )}
        </div>
      </div>

    </div>
  );
}