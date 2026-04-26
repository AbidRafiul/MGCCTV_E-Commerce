"use client";

import Script from "next/script";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import CheckoutSection from "@/section/users/checkout/CheckoutSection";
import { useCheckout } from "@/hooks/users/checkout/useCheckout";

export default function CheckoutPage() {
  const checkoutState = useCheckout();

  return (
    <AuthGuard>
      {/* Script Midtrans Sandbox */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={checkoutState.midtransClientKey}
        strategy="lazyOnload"
      />

      <Navbar />
      <CheckoutSection {...checkoutState} />
      <Footer />
    </AuthGuard>
  );
}