"use client";

// IMPORT NAVBAR DAN FOOTER-NYA DI SINI BRO! (Sesuaikan path-nya ya)
import Navbar from "@/components/layouts/Navbar"; 
import Footer from "@/components/layouts/Footer"; 

import { useCart } from "@/hooks/users/keranjang/useCart";
import CartHeroSection from "@/section/users/keranjang/CartHeroSection";
import CartListSection from "@/section/users/keranjang/CartListSection";

export default function KeranjangPage() {
  const cartState = useCart();

  return (
    <>
      {/* PASANG NAVBAR DI ATAS */}
      <Navbar /> 

      <section className="min-h-screen bg-slate-50 px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32 font-sans overflow-hidden">
        <div className="mx-auto max-w-5xl relative">
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <CartHeroSection />
          <CartListSection {...cartState} />
        </div>
      </section>

      {/* PASANG FOOTER DI BAWAH */}
      <Footer /> 
    </>
  );
}