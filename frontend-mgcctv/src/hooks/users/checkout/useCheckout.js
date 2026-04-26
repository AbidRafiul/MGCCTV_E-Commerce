"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AUTH_API_URL, API_BASE_URL } from "@/lib/api";
import {
  ensureCheckoutProfileComplete,
  saveProfileCompletion,
} from "@/services/checkoutProfileService";
import {
  clearCheckoutItems,
  clearPurchasedCartItems,
  getCheckoutItems,
} from "@/services/cartService";

// Helper Functions
const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;
  return {
    id_users: user.id_users || user.id || null,
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
  };
};

const saveTransactionReview = (payload) => {
  if (typeof window === "undefined") return;
  const existingTransaction = localStorage.getItem("lastMidtransTransaction");
  const parsedTransaction = existingTransaction ? JSON.parse(existingTransaction) : {};
  localStorage.setItem(
    "lastMidtransTransaction",
    JSON.stringify({ ...parsedTransaction, ...payload }),
  );
};

const clearCheckoutSessionMeta = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("selectedPaymentMethod");
};

const parseJsonSafely = async (response) => {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText };
  }
};

const syncTransactionStatus = async ({ token, orderId, statusBayar }) => {
  if (!token || !orderId || !statusBayar) return;
  try {
    await fetch(`${API_BASE_URL}/api/transaksi/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        status_bayar: statusBayar,
      }),
    });
  } catch (error) {
    console.error("Gagal sinkron status transaksi:", error);
  }
};

export const useCheckout = () => {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-2ALWnVkFsU0xIYc_";

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  
  useEffect(() => {
    const loadCheckoutData = async () => {
      setCheckoutItems(getCheckoutItems());
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const response = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          const fetchedProfile = normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null);
          setShippingProfile(fetchedProfile);

          const isInvalid = (text) => !text?.trim() || text?.trim() === "-" || text?.trim() === "null";
          
          if (isInvalid(fetchedProfile.no_hp) || isInvalid(fetchedProfile.alamat)) {
            setProfileToEdit(fetchedProfile);
            setIsProfileModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil profil pengiriman:", error);
      }
    };
    loadCheckoutData();
  }, []);

  const handleUpdateQuantity = (id_produk, delta) => {
    setCheckoutItems((prevItems) => 
      prevItems.map((item) => {
        if (item.id_produk === id_produk) {
          const newQuantity = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const totalCheckout = useMemo(
    () => checkoutItems.reduce((total, item) => total + Number(item.harga_produk || 0) * Number(item.quantity || 0), 0),
    [checkoutItems],
  );

  const totalUnits = useMemo(
    () => checkoutItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [checkoutItems],
  );

  const handleEditShippingProfile = () => {
    setProfileToEdit(shippingProfile);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const savedProfile = await saveProfileCompletion({ token, ...updatedData });
      setShippingProfile(normalizeProfile(savedProfile));
      setIsProfileModalOpen(false); 
      return true;
    } catch {
      return false; 
    }
  };

  const cleanupAfterSuccessfulPayment = async (paidItems) => {
    try {
      await clearPurchasedCartItems(paidItems);
    } catch (error) {
      console.error("Gagal membersihkan item keranjang setelah pembayaran:", error);
      clearCheckoutItems();
    } finally {
      clearCheckoutSessionMeta();
    }
  };

  const handleFinishCheckout = async () => {
    if (checkoutItems.length === 0) {
      toast.warning("Belum ada produk yang dipilih untuk checkout.");
      return;
    }
    const { isComplete, profile } = await ensureCheckoutProfileComplete();
    if (!isComplete) {
      setProfileToEdit(profile || shippingProfile);
      setIsProfileModalOpen(true);
      return;
    }
    setIsConfirmPaymentOpen(true);
  };

  const processPayment = async () => {
    setIsLoadingPayment(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesi login tidak ditemukan. Silakan login ulang.");
        router.push("/login");
        return;
      }
      
      let userId = shippingProfile?.id_users ? Number(shippingProfile.id_users) : null;
      if (!userId && token) {
        try {
          const payloadBase64 = token.split('.')[1];
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64));
            userId = Number(decoded.id_users || decoded.id || decoded.sub || 0);
          }
        } catch (e) {
          console.error("Failed to decode token for user ID:", e);
        }
      }

      if (!userId) {
        toast.error("User tidak dikenali. Silakan login ulang.");
        return;
      }
      if (typeof window === "undefined" || !window.snap) {
        toast.error("Snap Midtrans belum siap. Coba beberapa detik lagi.");
        return;
      }
      
      const payload = {
        id_users: userId,
        payment_method: paymentMethod,
        items: checkoutItems.map(item => ({
          id_produk: item.id_produk,
          quantity: item.quantity,
          harga: item.harga_produk,
          nama_produk: item.nama_produk
        })),
        total_harga: Number(totalCheckout),
        shipping: shippingProfile 
      };

      const res = await fetch(`${API_BASE_URL}/api/transaksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await parseJsonSafely(res);
      
      if (res.ok && data.token) {
        localStorage.setItem("selectedPaymentMethod", paymentMethod);
        saveTransactionReview({
          order_id: data.order_id,
          token: data.token,
          redirect_url: data.redirect_url || "",
          total_harga: Number(totalCheckout),
          payment_method: paymentMethod,
          items: checkoutItems,
          created_at: new Date().toISOString(),
          review_status: "pending",
        });

        window.snap.pay(data.token, {
          onSuccess: async function (result) {
            saveTransactionReview({
              review_status: "success",
              payment_type: result?.payment_type || paymentMethod,
              transaction_time: result?.transaction_time || new Date().toISOString(),
              settlement_time: result?.settlement_time || null,
              va_numbers: result?.va_numbers || [],
              pdf_url: result?.pdf_url || "",
              snap_result: result || null,
            });
            await cleanupAfterSuccessfulPayment(checkoutItems);
            toast.success("Pembayaran berhasil dilakukan.");
            router.push("/transaksi");
          },
          onPending: function (result) {
            saveTransactionReview({
              review_status: "pending",
              payment_type: result?.payment_type || paymentMethod,
              transaction_time: result?.transaction_time || new Date().toISOString(),
              va_numbers: result?.va_numbers || [],
              pdf_url: result?.pdf_url || "",
              snap_result: result || null,
            });
            toast.info("Menunggu pembayaran Anda.");
            router.push("/transaksi");
          },
          onError: function (result) {
            saveTransactionReview({
              review_status: "expired",
              payment_type: result?.payment_type || paymentMethod,
              transaction_time: result?.transaction_time || new Date().toISOString(),
              snap_result: result || null,
            });
            void syncTransactionStatus({ token, orderId: data.order_id, statusBayar: "expired" });
            toast.error("Pembayaran gagal diproses.");
            router.push("/transaksi");
          },
          onClose: function () {
            saveTransactionReview({ review_status: "expired" });
            void syncTransactionStatus({ token, orderId: data.order_id, statusBayar: "expired" });
            toast.warning("Anda menutup popup tanpa menyelesaikan pembayaran.");
            router.push("/transaksi");
          }
        });
      } else {
        toast.error(data.message || "Gagal membuat transaksi, token tidak ditemukan");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Terjadi kesalahan pada sistem.");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  return {
    checkoutItems, shippingProfile, isLoadingPayment, isConfirmPaymentOpen, setIsConfirmPaymentOpen,
    paymentMethod, setPaymentMethod, midtransClientKey,
    isProfileModalOpen, setIsProfileModalOpen, profileToEdit,
    handleUpdateQuantity, totalCheckout, totalUnits, handleEditShippingProfile, handleSaveProfile,
    handleFinishCheckout, processPayment
  };
};