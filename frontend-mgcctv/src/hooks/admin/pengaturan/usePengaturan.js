import { useState, useEffect, useCallback } from "react";
import { AUTH_API_URL } from "@/lib/api";

export const usePengaturan = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pakai useCallback biar fungsinya aman kalau dipanggil berulang (Best Practice React)
  const fetchProfile = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    isEditModalOpen,
    setIsEditModalOpen,
    fetchProfile,
  };
};