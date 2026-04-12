"use client";
import { useState, useEffect } from "react";
import { AUTH_API_URL } from "@/lib/api";

// Import Semua Komponen yang Sudah Dipisah
import EditProfileModal from "@/components/profile/admin/EditAdmin";
import ProfileHeader from "@/components/profile/admin/ProfileHeader";
import DetailInformasi from "@/components/profile/admin/DetailInformasi";
import UbahPasswordForm from "@/components/profile/admin/UbahPasswordForm";
import AktivitasKeamanan from "@/components/profile/admin/AktivitasKeamanan";
import PreferensiNotif from "@/components/profile/admin/PreferensiNotif";

function PengaturanPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- FETCH DATA MURNI ---
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${AUTH_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Gagal mengambil data profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1200px] mx-auto space-y-6">
      
      {/* HEADER PROFILE */}
      <ProfileHeader profile={profile} onEditClick={() => setIsEditModalOpen(true)} />

      {/* GRID 2 KOLOM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI */}
        <div className="space-y-6">
          <DetailInformasi profile={profile} />
          <UbahPasswordForm
            onSuccess={fetchProfile}
            isGoogleAccount={Boolean(profile?.is_google_account)}
          />
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          <AktivitasKeamanan profile={profile} />
          <PreferensiNotif />
        </div>

      </div>

      {/* MODAL EDIT PROFIL */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profile}
        onSuccess={fetchProfile}
      />
      
    </div>
  );
}

export default PengaturanPage
