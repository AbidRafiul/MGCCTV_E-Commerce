"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";
import { ReceiptText, Package, CheckCircle2 } from "lucide-react";

export const useHistory = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0,
    completed_orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleNavigate = (key) => {
    if (key === "profile") {
      router.push("/profile");
      return;
    }
    if (key === "orders") {
      router.push("/riwayat");
      return;
    }
    if (key === "password") {
      router.push("/ubah-password");
      return;
    }
    if (key === "logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        setIsLoading(true);

        // Ambil data Orders dan Profile secara bersamaan
        const [ordersRes, profileRes] = await Promise.all([
          fetch(`${AUTH_API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${AUTH_API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Cek apakah ini akun Google
        if (profileRes.ok) {
          const profileData = await profileRes.json().catch(() => ({}));
          const user = profileData?.user ?? profileData?.data?.user ?? profileData?.data ?? null;
          setIsGoogleAccount(Boolean(user?.is_google_account));
        }

        // Olah data Orders
        const ordersData = await ordersRes.json().catch(() => ({}));
        if (!ordersRes.ok) {
          throw new Error(ordersData?.message || "Gagal mengambil riwayat pesanan");
        }
        
        setOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);
        setSummary(
          ordersData?.summary || {
            total_orders: 0,
            total_spent: 0,
            pending_orders: 0,
            completed_orders: 0,
          },
        );
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const summaryCards = useMemo(
    () => [
      {
        key: "total",
        label: "Total Pesanan",
        value: `${summary.total_orders}`,
        note: "Seluruh transaksi Anda",
        icon: ReceiptText,
        className: "border-slate-200 bg-white text-[#0C2C55]",
        iconWrap: "bg-blue-50 text-blue-600",
      },
      {
        key: "process",
        label: "Sedang Berjalan",
        value: `${summary.pending_orders}`,
        note: "Menunggu update berikutnya",
        icon: Package,
        className: "border-blue-100 bg-blue-50/70 text-blue-800",
        iconWrap: "bg-white text-blue-600",
      },
      {
        key: "done",
        label: "Pesanan Selesai",
        value: `${summary.completed_orders}`,
        note: "Pesanan berhasil dituntaskan",
        icon: CheckCircle2,
        className: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
        iconWrap: "bg-white text-emerald-600",
      },
    ],
    [summary],
  );

  return {
    router, orders, summary, isLoading, expandedOrderId, setExpandedOrderId,
    handleNavigate, summaryCards, isGoogleAccount
  };
};