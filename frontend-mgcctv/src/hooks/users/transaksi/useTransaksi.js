"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Clock3, CircleX } from "lucide-react";
import { AUTH_API_URL } from "@/lib/api";
import { getCheckoutItems } from "@/services/cartService";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
  };
};

export const useTransaksi = () => {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDeadline, setPaymentDeadline] = useState("");
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    const loadTransactionPreview = async () => {
      setIsLoading(true);

      try {
        if (typeof window !== "undefined") {
          const savedTransaction = localStorage.getItem("lastMidtransTransaction");
          if (savedTransaction) {
            const parsedTransaction = JSON.parse(savedTransaction);
            setTransactionData(parsedTransaction);
            setCheckoutItems(
              Array.isArray(parsedTransaction.items) && parsedTransaction.items.length > 0
                ? parsedTransaction.items
                : getCheckoutItems(),
            );

            const baseDate = parsedTransaction.created_at
              ? new Date(parsedTransaction.created_at)
              : new Date();
            const deadline = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);

            setPaymentDeadline(
              deadline.toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "short",
              }),
            );
          } else {
            setCheckoutItems(getCheckoutItems());
          }
        } else {
          setCheckoutItems(getCheckoutItems());
        }

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setShippingProfile(null);
          return;
        }

        const response = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setShippingProfile(
            normalizeProfile(
              data?.user ?? data?.data?.user ?? data?.data ?? null,
            ),
          );
        }
      } catch (error) {
        console.error("Gagal memuat preview transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactionPreview();
  }, []);

  const totalAmount = useMemo(() => {
    if (transactionData?.total_harga) {
      return Number(transactionData.total_harga);
    }

    return checkoutItems.reduce(
      (total, item) =>
        total + Number(item.harga_produk || 0) * Number(item.quantity || 0),
      0,
    );
  }, [checkoutItems, transactionData]);

  const paymentLabel = useMemo(() => {
    if (!transactionData) return "Midtrans Sandbox";
    if (transactionData.payment_method === "qris") return "QRIS Midtrans Sandbox";
    if (transactionData.payment_bank) {
      return `Transfer Bank ${transactionData.payment_bank}`;
    }
    return "Transfer Bank Midtrans Sandbox";
  }, [transactionData]);

  const reviewStatus = transactionData?.review_status || "pending";

  const statusConfig = useMemo(() => {
    if (reviewStatus === "success") {
      return {
        heroBadge: "Pembayaran Berhasil",
        heroTitle: "Transaksi Berhasil Dibayarkan",
        heroDescription:
          "Pembayaran Anda sudah berhasil diterima melalui Midtrans. Pesanan akan masuk ke proses berikutnya.",
        statusLabel: "Berhasil dibayar",
        statusClass: "bg-emerald-50 text-emerald-700",
        icon: BadgeCheck,
      };
    }

    if (reviewStatus === "failed") {
      return {
        heroBadge: "Pembayaran Gagal",
        heroTitle: "Transaksi Belum Berhasil",
        heroDescription:
          "Pembayaran belum berhasil diproses. Anda bisa membuat transaksi baru dari halaman detail pesanan.",
        statusLabel: "Pembayaran gagal",
        statusClass: "bg-red-50 text-red-700",
        icon: CircleX,
      };
    }

    if (reviewStatus === "expired") {
      return {
        heroBadge: "Pembayaran Kedaluwarsa",
        heroTitle: "Transaksi Kedaluwarsa",
        heroDescription:
          "Pembayaran tidak diselesaikan, jadi transaksi ini sudah ditandai sebagai kedaluwarsa. Anda bisa membuat transaksi baru dari halaman detail pesanan.",
        statusLabel: "Pembayaran gagal",
        statusClass: "bg-red-50 text-red-700",
        icon: CircleX,
      };
    }

    return {
      heroBadge: "Menunggu Pembayaran",
      heroTitle: "Transaksi Menunggu Pembayaran",
      heroDescription:
        "Pembayaran Anda masih menunggu penyelesaian. Setelah lunas, status transaksi akan berubah menjadi berhasil.",
      statusLabel: "Menunggu pembayaran",
      statusClass: "bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  }, [reviewStatus]);

  const handleRetryTransaction = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lastMidtransTransaction");
    }
  };

  return {
    checkoutItems,
    shippingProfile,
    isLoading,
    paymentDeadline,
    transactionData,
    totalAmount,
    paymentLabel,
    reviewStatus,
    statusConfig,
    handleRetryTransaction,
  };
};