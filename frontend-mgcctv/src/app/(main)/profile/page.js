"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ProfileHero from "@/components/profile/profileHero";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileHero />
    </AuthGuard>
  );
}
