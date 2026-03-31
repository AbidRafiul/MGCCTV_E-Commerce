"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import CartHero from "@/components/keranjang/CartHero";

export default function KeranjangPage() {
  return (
    <AuthGuard>
      <Navbar />
      <CartHero />
      <Footer />
    </AuthGuard>
  );
}