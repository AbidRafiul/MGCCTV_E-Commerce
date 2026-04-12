"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Package2, Phone, Home, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { AUTH_API_URL } from "@/lib/api";
import {
  ensureCheckoutProfileComplete,
  saveProfileCompletion, // Import fungsi save
} from "@/services/checkoutProfileService";
import { getCheckoutItems } from "@/services/cartService";
import CheckoutProfileDialog from "@/components/modals/CheckoutProfileDialog"; // Import Modal Shadcn

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
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

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
  
  // =======================================================
  // STATE UNTUK MODAL SHADCN
  // =======================================================
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

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

          // === LOGIKA AUTO POP-UP JIKA DATA KOSONG/"-" ===
          const isInvalid = (text) => !text?.trim() || text?.trim() === "-" || text?.trim() === "null";
          
          if (isInvalid(fetchedProfile.no_hp) || isInvalid(fetchedProfile.alamat)) {
            setProfileToEdit(fetchedProfile);
            setIsProfileModalOpen(true); // Langsung tembak buka modal!
          }
        }
      } catch (error) {
        console.error("Gagal mengambil profil pengiriman:", error);
      }
    };

    loadCheckoutData();
  }, []);

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

  // =======================================================
  // FUNGSI MEMBUKA MODAL SAAT TOMBOL "UBAH" DIKLIK
  // =======================================================
  const handleEditShippingProfile = () => {
    setProfileToEdit(shippingProfile); // Masukkan data saat ini ke form modal
    setIsProfileModalOpen(true);
  };

  // =======================================================
  // FUNGSI MENYIMPAN DATA DARI MODAL
  // =======================================================
  const handleSaveProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const savedProfile = await saveProfileCompletion({ token, ...updatedData });
      
      // Update UI langsung tanpa perlu refresh
      setShippingProfile(normalizeProfile(savedProfile));
      setIsProfileModalOpen(false); 
      return true;
    } catch (error) {
      return false; 
    }
  };

  // =======================================================
  // FUNGSI CHECKOUT & VALIDASI
  // =======================================================
  const handleFinishCheckout = async () => {
    if (checkoutItems.length === 0) {
      Swal.fire({
        title: "Checkout Kosong",
        text: "Belum ada produk yang dipilih untuk checkout.",
        icon: "warning",
        width: isMobile ? 280 : 360,
        padding: isMobile ? "1rem" : "1.25rem",
        confirmButtonColor: "#0C2C55",
        confirmButtonText: "Oke",
      });
      return;
    }

    // Pengecekan keamanan terakhir
    const { isComplete, profile } = await ensureCheckoutProfileComplete();

    if (!isComplete) {
      // Jika ternyata alamatnya dihapus/kosong, paksa buka modal
      setProfileToEdit(profile || shippingProfile);
      setIsProfileModalOpen(true);
      return;
    }

    router.push("/transaksi");
  };

  return (
    <AuthGuard>
      <Navbar />
      <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-5xl relative">
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
          <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
            <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
              Pesanan Anda
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Detail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Pesanan</span>
            </h1>
            
            {/* Breadcrumb Modern */}
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
                Belum ada produk untuk checkout
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Kembali ke keranjang dan pilih produk yang ingin Anda checkout.
              </p>
              <Link
                href="/keranjang"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0C2C55] px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
              >
                Kembali ke Keranjang
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
                      Checkout Pesanan
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-white md:text-[30px]">
                      Konfirmasi Pesanan Anda
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                      Pastikan produk, alamat pengiriman, dan total pembayaran sudah sesuai sebelum melanjutkan ke transaksi.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                      Total Checkout
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
                            <p>
                              Jumlah: <span className="font-semibold">{item.quantity}</span>
                            </p>
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

                <div className="h-fit rounded-[24px] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
                  <h2 className="text-lg font-bold text-[#0C2C55]">
                    Ringkasan Pesanan
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Total produk dipilih:{" "}
                    <span className="font-semibold text-[#0C2C55]">
                      {checkoutItems.length}
                    </span>
                  </p>
                  <p className="mt-4 text-2xl font-extrabold text-[#0C2C55]">
                    {formatCurrency(totalCheckout)}
                  </p>

                  <button
                    type="button"
                    onClick={handleFinishCheckout}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#28a745] px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />

      {/* RENDER MODAL SHADCN */}
      <CheckoutProfileDialog 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profileToEdit}
        onSave={handleSaveProfile}
      />
    </AuthGuard>
  );
}