"use client";

// 1. Import Sang Otak (Custom Hook)
import { usePengaturan } from "@/hooks/admin/pengaturan/usePengaturan";

// 2. Import Kepingan UI (Sudah kamu buat sebelumnya, mantap!)
import EditProfileModal from "@/section/users/profile/admin/EditAdmin";
import ProfileHeader from "@/section/users/profile/admin/ProfileHeader";
import DetailInformasi from "@/section/users/profile/admin/DetailInformasi";
import UbahPasswordForm from "@/section/users/profile/admin/UbahPasswordForm";
import AktivitasKeamanan from "@/section/users/profile/admin/AktivitasKeamanan";
import PreferensiNotif from "@/section/users/profile/admin/PreferensiNotif";

export default function PengaturanPage() {
  // 3. Ekstrak Senjata dari Hook
  const { 
    profile, 
    loading, 
    isEditModalOpen, 
    setIsEditModalOpen, 
    fetchProfile 
  } = usePengaturan();

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