"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { 
  CreditCard, 
  MapPin, 
  Package2, 
  Phone, 
  Home, 
  ChevronRight, 
  Plus, 
  Minus 
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
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
import CheckoutProfileDialog from "@/components/modals/CheckoutProfileDialog";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    id_users: user.id_users || user.id || null,
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const saveTransactionReview = (payload) => {
  if (typeof window === "undefined") return;

  const existingTransaction = localStorage.getItem("lastMidtransTransaction");
  const parsedTransaction = existingTransaction ? JSON.parse(existingTransaction) : {};

  localStorage.setItem(
    "lastMidtransTransaction",
    JSON.stringify({
      ...parsedTransaction,
      ...payload,
    }),
  );
};

const clearCheckoutSessionMeta = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("selectedPaymentMethod");
  localStorage.removeItem("selectedPaymentBank");
};

const parseJsonSafely = async (response) => {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      message: rawText,
    };
  }
};

const syncTransactionStatus = async ({ token, orderId, statusBayar }) => {
  if (!token || !orderId || !statusBayar) {
    return;
  }

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

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  
  // =======================================================
  // STATE UNTUK METODE PEMBAYARAN
  // =======================================================
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [selectedBank, setSelectedBank] = useState("");
  const midtransClientKey =
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-2ALWnVkFsU0xIYc_";

  // =======================================================
  // STATE UNTUK MODAL SHADCN
  // =======================================================
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  
  useEffect(() => {
    const loadCheckoutData = async () => {
      setCheckoutItems(getCheckoutItems());

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) return;

      try {
        const response = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // =======================================================
  // FITUR UPDATE QUANTITY
  // =======================================================
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
    () =>
      checkoutItems.reduce(
        (total, item) => total + Number(item.harga_produk || 0) * Number(item.quantity || 0),
        0,
      ),
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

  // =======================================================
  // FUNGSI CHECKOUT & VALIDASI SEBELUM KONFIRMASI
  // =======================================================
  const handleFinishCheckout = async () => {
    if (checkoutItems.length === 0) {
      toast.warning("Belum ada produk yang dipilih untuk checkout.");
      return;
    }

    // Validasi Pembayaran Bank
    if (paymentMethod === "transfer" && !selectedBank) {
      toast.error("Silakan pilih bank tujuan transfer terlebih dahulu.");
      return;
    }

    // Pengecekan keamanan terakhir
    const { isComplete, profile } = await ensureCheckoutProfileComplete();

    if (!isComplete) {
      setProfileToEdit(profile || shippingProfile);
      setIsProfileModalOpen(true);
      return;
    }

    // Tampilkan pop-up konfirmasi pembayaran (AlertDialog Shadcn)
    setIsConfirmPaymentOpen(true);
  };

  // =======================================================
  // FUNGSI PROSES PEMBAYARAN SETELAH KONFIRMASI
  // =======================================================
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
      
      // Fallback: extract user ID from JWT token if not found in profile
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
      
      // Siapkan data payload ke backend - Otomatis tersinkronisasi karena checkoutItems & totalCheckout terbaru
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await parseJsonSafely(res);
      
      if (res.ok && data.token) {
        localStorage.setItem("selectedPaymentMethod", paymentMethod);
        localStorage.setItem("selectedPaymentBank", selectedBank);
        saveTransactionReview({
          order_id: data.order_id,
          token: data.token,
          redirect_url: data.redirect_url || "",
          total_harga: Number(totalCheckout),
          payment_method: paymentMethod,
          payment_bank: selectedBank,
          items: checkoutItems,
          created_at: new Date().toISOString(),
          review_status: "pending",
        });

        // Trigger Midtrans Snap Pop-up
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
            void syncTransactionStatus({
              token,
              orderId: data.order_id,
              statusBayar: "expired",
            });
            toast.error("Pembayaran gagal diproses.");
            router.push("/transaksi");
          },
          onClose: function () {
            saveTransactionReview({
              review_status: "expired",
            });
            void syncTransactionStatus({
              token,
              orderId: data.order_id,
              statusBayar: "expired",
            });
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

  return (
    <AuthGuard>
      {/* Script Midtrans Sandbox */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={midtransClientKey}
        strategy="lazyOnload"
      />

      <Navbar />
      <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-5xl relative">
          <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
          <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
            <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
              Pesanan Anda
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Detail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Pesanan</span>
            </h1>
            
            <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
              <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
                <Home size={14} className="mb-[1px]" />
                Beranda
              </Link>
              <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
              <Link href="/produk" className="hover:text-blue-600 transition-colors shrink-0">
                Produk
              </Link>
              <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
              <span className="text-slate-900 truncate max-w-[120px] sm:max-w-[300px] shrink-0">
                Pesanan 
              </span>
            </nav>
          </div>
        
          {checkoutItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-[28px] sm:px-6 sm:py-14">
              <h2 className="text-lg font-bold text-[#0C2C55] sm:text-xl">
                Belum ada produk untuk ditampilkan
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Pilih produk dari keranjang atau gunakan tombol beli sekarang dari halaman produk untuk masuk ke detail pesanan.
              </p>
              <Link
                href="/keranjang"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
              >
                Ke Keranjang
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] p-5 text-white shadow-sm sm:rounded-[28px] sm:p-6">
                <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-sky-300/10 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                      Detail Pesanan
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-white md:text-[30px]">
                      Tinjau Pesanan Anda
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                      Periksa produk, alamat pengiriman, dan metode pembayaran terlebih dahulu. Setelah itu klik Bayar Sekarang untuk membuka Midtrans sandbox.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                      Total Pesanan
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-white">
                      {formatCurrency(totalCheckout)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Produk Dipilih
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-[#0C2C55]">
                        {checkoutItems.length}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Produk siap diproses
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Package2 size={20} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Total Unit
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-[#0C2C55]">
                        {totalUnits}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Akumulasi semua quantity
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CreditCard size={20} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Status Alamat
                      </p>
                      <p className="mt-2 text-lg font-extrabold text-[#0C2C55]">
                        {shippingProfile?.alamat ? "Siap Digunakan" : "Perlu Dilengkapi"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {shippingProfile?.nama || "Lengkapi profil pengiriman"}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                      <MapPin size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  {/* CARD ALAMAT PENGIRIMAN */}
                  <div className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-500">
                          Alamat Pengiriman
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-extrabold text-[#0C2C55]">
                              {shippingProfile?.nama || "Nama belum tersedia"}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {shippingProfile?.alamat || "Alamat pengiriman belum tersedia."}
                            </p>
                          </div>
                          <div className="flex flex-col items-start gap-2 sm:items-end">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-[#0C2C55]">
                              <Phone size={14} />
                              {shippingProfile?.no_hp || "-"}
                            </div>
                            <button
                              type="button"
                              onClick={handleEditShippingProfile}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              Ubah
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD METODE PEMBAYARAN */}
                  <div className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CreditCard size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-500">
                          Metode Pembayaran
                        </p>
                        
                        <div className="mt-3 flex flex-col sm:flex-row gap-3">
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                            <input 
                              type="radio" 
                              name="payment" 
                              value="transfer" 
                              className="hidden" 
                              checked={paymentMethod === 'transfer'} 
                              onChange={() => {
                                setPaymentMethod('transfer');
                              }} 
                            />
                            <span className="font-bold text-sm">Transfer Bank</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                            <input 
                              type="radio" 
                              name="payment" 
                              value="qris" 
                              className="hidden" 
                              checked={paymentMethod === 'qris'} 
                              onChange={() => {
                                setPaymentMethod('qris');
                                setSelectedBank(""); 
                              }} 
                            />
                            <span className="font-bold text-sm">QRIS</span>
                          </label>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* LIST PRODUK */}
                  {checkoutItems.map((item) => (
                    <div
                      key={item.id_produk}
                      className="rounded-[22px] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2.5 sm:h-24 sm:w-24">
                          <img
                            src={item.gambar_produk || "/images/placeholder.jpg"}
                            alt={item.nama_produk}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600 sm:text-xs">
                            {item.merek}
                          </p>
                          <h2 className="text-base font-bold text-[#0C2C55] sm:text-lg">
                            {item.nama_produk}
                          </h2>
                          <div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">Jumlah:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id_produk, -1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center font-bold text-[#0C2C55]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.id_produk, 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                            <p>
                              Harga satuan:{" "}
                              <span className="font-semibold">
                                {formatCurrency(item.harga_produk)}
                              </span>
                            </p>
                          </div>
                          <p className="pt-1 text-sm font-extrabold text-[#0C2C55] sm:text-base">
                            Subtotal {formatCurrency(item.harga_produk * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 h-fit rounded-[24px] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
                  <div>
                    <h2 className="text-lg font-bold text-[#0C2C55]">
                      Ringkasan Pesanan
                    </h2>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Total Produk:</span>
                        <span className="font-bold text-[#0C2C55]">{checkoutItems.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Total Unit:</span>
                        <span className="font-bold text-[#0C2C55]">{totalUnits}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 mt-2">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Pembayaran</p>
                        <p className="mt-1 text-2xl font-extrabold text-[#0C2C55]">
                          {formatCurrency(totalCheckout)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishCheckout}
                    disabled={isLoadingPayment}
                    className={`mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-colors 
                      ${isLoadingPayment ? "bg-slate-400 cursor-not-allowed" : "bg-[#28a745] hover:bg-green-700"}
                    `}
                  >
                    {isLoadingPayment ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-2">
                    Setelah Anda klik <span className="font-bold text-blue-500">Bayar Sekarang</span>, popup Midtrans sandbox akan terbuka untuk menyelesaikan pembayaran.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />

      <CheckoutProfileDialog 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profileToEdit}
        onSave={handleSaveProfile}
      />

      <AlertDialog open={isConfirmPaymentOpen} onOpenChange={setIsConfirmPaymentOpen}>
        <AlertDialogContent className="max-w-md rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C2C55]">Konfirmasi Pembayaran</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Apakah Anda yakin ingin melanjutkan pembayaran sejumlah <strong>{formatCurrency(totalCheckout)}</strong>? Pastikan pesanan dan alamat pengiriman Anda sudah benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={processPayment}
              className="rounded-xl bg-[#28a745] hover:bg-green-700 text-white"
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
