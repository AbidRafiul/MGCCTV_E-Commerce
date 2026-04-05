"use client";

import { AUTH_API_URL } from "@/lib/api";

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;

  return {
    ...user,
    nama: user.nama || "",
    no_hp: user.no_hp || "",
    alamat: user.alamat || "",
    is_google_account: Boolean(user.is_google_account),
  };
};

const fetchCurrentProfile = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return { ok: false, message: "Sesi login tidak ditemukan." };
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || "Gagal mengambil data profil." };
    }

    return {
      ok: true,
      token,
      profile: normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null),
    };
  } catch (error) {
    return { ok: false, message: error.message || "Gagal mengambil data profil." };
  }
};

// ====================================================================
// 1. DITAMBAHKAN EXPORT DI SINI
// ====================================================================
export const saveProfileCompletion = async ({ token, nama, no_hp, alamat }) => {
  const response = await fetch(`${AUTH_API_URL}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nama, no_hp, alamat }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal menyimpan data profil.");
  }

  return normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null);
};

// ====================================================================
// 2. DIUBAH AGAR MENGEMBALIKAN OBJEK (UNTUK SHADCN), BUKAN MEMANGGIL SWAL
// ====================================================================
export const ensureCheckoutProfileComplete = async () => {
  const profileResult = await fetchCurrentProfile();

  if (!profileResult.ok) {
    return { isComplete: false, profile: null };
  }

  const { profile } = profileResult;

  const isInvalid = (text) => {
    const val = text?.trim();
    return !val || val === "-" || val === "null"; // Anggap "-" atau teks "null" sebagai kosong
  };

const needsCompletion = 
    isInvalid(profile.nama) || isInvalid(profile.no_hp) || isInvalid(profile.alamat);

  if (!needsCompletion) {
    return { isComplete: true, profile: null };
  }
  // Gagal, kirimkan profil ke DetailContent.js agar Modal Shadcn terbuka
  return { isComplete: false, profile };
};