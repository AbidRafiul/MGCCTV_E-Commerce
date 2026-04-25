"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import ChangePasswordSection from "@/section/users/ubahPass/ChangePasswordSection";
import { useChangePassword } from "@/hooks/users/ubahPass/useChangePassword";

export default function ChangePasswordPage() {
  const changePasswordState = useChangePassword();

  return (
    <AuthGuard>
      <Navbar />
      <ChangePasswordSection {...changePasswordState} />
      <Footer />
    </AuthGuard>
  );
}