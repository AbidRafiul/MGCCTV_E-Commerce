"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ProfileHero from "@/components/profile/ProfileHero";
import  Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Navbar />
      <ProfileHero />
      <Footer />
    </AuthGuard>
  );
}
