"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import Swal from "sweetalert2";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { AUTH_API_URL } from "@/lib/api";
import {
  ensureCheckoutProfileComplete,
  openCheckoutProfileEditor,
} from "@/services/checkoutProfileService";
import { clearCheckoutItems, getCheckoutItems } from "@/services/cartService";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
  };
};

export default function CheckoutPage() {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingProfile, setShippingProfile] = useState(null);
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
          setShippingProfile(
            normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null),
          );
        }
      } catch (error) {
        console.error("Gagal mengambil profil pengiriman:", error);
      }
    };

    loadCheckoutData();
  }, []);

  const totalCheckout = checkoutItems.reduce(
    (total, item) => total + item.harga_produk * item.quantity,
    0,
  );

  const handleEditShippingProfile = async () => {
    const updatedProfile = await openCheckoutProfileEditor();

    if (!updatedProfile) {
      return;
    }

    setShippingProfile(normalizeProfile(updatedProfile));
  };

  const handleFinishCheckout = () => {
    const proceed = async () => {
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

      const canContinue = await ensureCheckoutProfileComplete();

      if (!canContinue) {
        return;
      }

      const orderLines = checkoutItems
        .map(
          (item, index) =>
            `${index + 1}. ${item.nama_produk} (${item.merek}) x${item.quantity} - ${new Intl.NumberFormat(
              "id-ID",
              {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              },
            ).format(item.harga_produk * item.quantity)}`,
        )
        .join("\n");

      const totalText = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(totalCheckout);

      const message = `Halo Admin MG CCTV, saya ingin checkout produk berikut:\n\n${orderLines}\n\nTotal: ${totalText}`;

      window.open(
        `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      clearCheckoutItems();
    };

    proceed();
  };

  return (
    <AuthGuard>
      <Navbar />
       <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 px-5 py-2 sm:py-4">
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-[#0C2C55] sm:text-3xl lg:text-4xl">
              Pesanan
            </h2>
            <nav aria-label="Breadcrumb" className="mt-4">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <li>
                  <Link href="/beranda" className="transition hover:text-slate-800">
                    Beranda
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/produk" className="transition hover:text-slate-800">
                    Produk
                  </Link>
                </li>
                <li>/</li>
                <li className="font-medium text-slate-700">Pesanan</li>
              </ol>
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
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(item.harga_produk)}
                            </span>
                          </p>
                        </div>
                        <p className="pt-1 text-sm font-extrabold text-[#0C2C55] sm:text-base">
                          Subtotal{" "}
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.harga_produk * item.quantity)}
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
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(totalCheckout)}
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
          )}
        </div>
      </section>
      <Footer />
    </AuthGuard>
  );
}
