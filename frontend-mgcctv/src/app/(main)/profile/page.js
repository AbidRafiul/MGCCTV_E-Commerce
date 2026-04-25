"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import ProfileSection from "@/section/users/profile/ProfileSection";
import { useProfile } from "@/hooks/users/profile/useProfile";

export default function ProfilePage() {
  const profileState = useProfile();

  return (
    <AuthGuard>
      <Navbar />
      <ProfileSection {...profileState} />
      <Footer />
    </AuthGuard>
  );
}