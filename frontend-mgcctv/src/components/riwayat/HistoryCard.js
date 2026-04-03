"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
  Home,
  ChevronRight
} from "lucide-react";
import NavBox from "../profile/NavBox";

const orders = [
  {
    id: "ORD-240301",
    productName: "Camera Dome 2MP",
    quantity: 1,
    total: "Rp 450.000",
    date: "01 Maret 2026",
    status: "Diproses",
    statusClass: "border-blue-100 bg-blue-50 text-blue-700",
    icon: Clock3,
    accentClass: "from-blue-500/12 to-cyan-400/5",
  },
  {
    id: "ORD-240228",
    productName: "Camera Dome 2MP",
    quantity: 1,
    total: "Rp 450.000",
    date: "28 Februari 2026",
    status: "Dikirim",
    statusClass: "border-orange-100 bg-orange-50 text-orange-700",
    icon: Truck,
    accentClass: "from-orange-500/12 to-amber-400/5",
  },
  {
    id: "ORD-240220",
    productName: "Camera Dome 2MP",
    quantity: 1,
    total: "Rp 450.000",
    date: "20 Februari 2026",
    status: "Selesai",
    statusClass: "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: PackageCheck,
    accentClass: "from-emerald-500/12 to-lime-400/5",
  },
];

const summaryCards = [
  {
    key: "total",
    label: "Total Pesanan",
    value: `${orders.length}`,
    note: "Seluruh transaksi terakhir",
    icon: ReceiptText,
    className: "border-slate-200 bg-white text-[#0C2C55]",
    iconWrap: "bg-blue-50 text-blue-600",
  },
  {
    key: "process",
    label: "Sedang Diproses",
    value: `${orders.filter((item) => item.status === "Diproses").length}`,
    note: "Menunggu update berikutnya",
    icon: Package,
    className: "border-blue-100 bg-blue-50/70 text-blue-800",
    iconWrap: "bg-white text-blue-600",
  },
  {
    key: "done",
    label: "Pesanan Selesai",
    value: `${orders.filter((item) => item.status === "Selesai").length}`,
    note: "Siap untuk beli lagi",
    icon: CheckCircle2,
    className: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
    iconWrap: "bg-white text-emerald-600",
  },
];

export default function HistoryCard() {
  const router = useRouter();

  const totalSpent = useMemo(() => "Rp 1.350.000", []);

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

  return (
    <section className="min-h-screen bg-[#f5f6f8] px-4 pb-10 pt-32 md:px-8 sm:pt-36 lg:px-16">
           <div className="mx-auto max-w-5xl relative">
                {/* Ambient Glow */}
                <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
                <div className="relative z-10 mb-10 px-2 sm:px-4 flex flex-col items-start gap-4">
                  <span className="inline-block rounded-full bg-blue-100/80 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur-md shadow-sm">
                    Riwayat Pesanan
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                    Pesanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Saya</span>
                  </h1>
                  
                  {/* Breadcrumb Modern */}
                  <nav className="flex items-center text-xs sm:text-sm font-bold text-slate-500 bg-white/80 px-4 py-2.5 rounded-full backdrop-blur-md ring-1 ring-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden mt-2">
                    <Link href="/beranda" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors shrink-0">
                      <Home size={14} className="mb-[1px]" />
                      Beranda
                    </Link>
                    <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
                    <Link href="/riwayat" className="hover:text-blue-600 transition-colors shrink-0">
                      Riwayat Pesanan
                    </Link>
                  </nav>
                </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <NavBox activeItem="orders" onNavigate={handleNavigate} canAccessPassword />

          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
            <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0C2C55_0%,#123e74_55%,#1d5ca2_100%)] px-5 py-6 md:px-8 md:py-8">
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-sky-300/10 blur-2xl" />

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                    Pesanan Saya
                  </span>
                  <h3 className="mt-3 text-2xl font-bold text-white md:text-[30px]">
                    Riwayat Belanja
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                    Pantau status pesanan anda dan lakukan pembelian ulang dengan lebih cepat kapan saja.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">Total Belanja</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{totalSpent}</p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className={`rounded-2xl border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] ${item.className}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                          <p className="mt-2 text-2xl font-extrabold">{item.value}</p>
                          <p className="mt-1 text-sm opacity-75">{item.note}</p>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              

              <div className="mt-6 space-y-4">
                {orders.map((order) => {
                  const StatusIcon = order.icon;

                  return (
                    <div
                      key={order.id}
                      className={`overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br ${order.accentClass} p-[1px]`}
                    >
                      <div className="rounded-[23px] bg-white p-4 md:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-inner">
                              <ShoppingBag size={28} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-bold text-[#0C2C55] md:text-lg">{order.productName}</p>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                  {order.id}
                                </span>
                              </div>

                              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3 sm:gap-6">
                                <p>
                                  <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Tanggal</span>
                                  <span className="mt-1 block font-medium text-slate-700">{order.date}</span>
                                </p>
                                <p>
                                  <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Quantity</span>
                                  <span className="mt-1 block font-medium text-slate-700">{order.quantity} item</span>
                                </p>
                                <p>
                                  <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">Total Bayar</span>
                                  <span className="mt-1 block font-semibold text-slate-900">{order.total}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-end">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${order.statusClass}`}
                            >
                              <StatusIcon size={14} />
                              {order.status}
                            </span>

                            <Link
                              href="/produk"
                              className="inline-flex items-center gap-2 rounded-full bg-[#0C2C55] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#123d73]"
                            >
                              Beli Lagi
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
