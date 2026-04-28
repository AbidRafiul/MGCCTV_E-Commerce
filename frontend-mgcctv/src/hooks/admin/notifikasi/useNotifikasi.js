import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, User, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export const useNotifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  // Mengambil data notifikasi dari API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log("Data Notifikasi:", data);
      if (response.ok) {
        // Asumsi API mengembalikan array notifikasi di data.notifications atau langsung array data
        setNotifications(data.notifications || data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  // Fungsi untuk menandai 1 notifikasi telah dibaca dan mengarahkan ke link tujuan (jika ada)
  const handleRead = async (id, link_tujuan) => {
    try {
      const token = localStorage.getItem("token");
      
      // Jika id valid (bukan notif statis tanpa ID backend), update status di server
      if (id) {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Update state lokal tanpa harus fetch ulang
          setNotifications(prev => prev.map(n => 
            (n.id_notifikasi === id || n.id === id) ? { ...n, is_read: 1 } : n
          ));
        }
      }

      // Navigasi ke rute yang diberikan (jika ada)
      if (link_tujuan) {
        router.push(link_tujuan);
      }
    } catch (error) {
      console.error("Gagal menandai notifikasi dibaca:", error);
    }
  };

  // Fungsi untuk menandai seluruh notifikasi dibaca sekaligus
  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Update seluruh isi array state
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (error) {
      console.error("Gagal menandai semua sebagai dibaca:", error);
    }
  };

  // Memisahkan notifikasi berdasarkan status (asumsi is_read bertipe boolean atau 0/1)
  const unreadNotifs = notifications.filter((n) => n.is_read == 0 || n.is_read === false);
  const readNotifs = notifications.filter((n) => n.is_read == 1 || n.is_read === true);

  // Penyesuaian gaya ikon dengan tipe enum database ('transaksi', 'pembayaran', 'status_order')
  const getStyleByType = (type) => {
    switch (type) {
      case "transaksi":
      case "order":
        return {
          boxClass: "bg-blue-50/60 border-blue-200",
          iconBg: "bg-blue-500",
          icon: <Package size={18} className="text-white" />,
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
        };
      case "pembayaran":
        return {
          boxClass: "bg-orange-50/60 border-orange-200",
          iconBg: "bg-orange-500",
          icon: <CreditCard size={18} className="text-white" />,
          btnClass: "bg-white hover:bg-orange-50 text-orange-600 border border-orange-200",
        };
      case "status_order":
      case "success":
        return {
          boxClass: "bg-emerald-50/60 border-emerald-200",
          iconBg: "bg-emerald-500",
          icon: <CheckCircle2 size={18} className="text-white" />,
          btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent",
        };
      case "user":
        return {
          boxClass: "bg-green-50/60 border-green-200",
          iconBg: "bg-green-500",
          icon: <User size={18} className="text-white" />,
          btnClass: "bg-white hover:bg-green-50 text-green-600 border border-green-200",
        };
      case "warning":
        return {
          boxClass: "bg-orange-50/60 border-orange-200",
          iconBg: "bg-orange-500",
          icon: <AlertTriangle size={18} className="text-white" />,
          btnClass: "bg-white hover:bg-orange-50 text-orange-600 border border-orange-200",
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
          btnClass: "bg-slate-100 text-slate-600 border-slate-300",
        };
    }
  };

  return {
    notifications,
    unreadNotifs,
    readNotifs,
    handleMarkAllRead,
    handleRead,
    getStyleByType
  };
};
