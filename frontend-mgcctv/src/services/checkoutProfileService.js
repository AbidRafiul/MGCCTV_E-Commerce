"use client";

import Swal from "sweetalert2";
import { AUTH_API_URL } from "@/lib/api";

const getPopupConfig = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return {
    isMobile,
    width: isMobile ? 248 : 520,
    padding: isMobile ? "0.7rem" : "1.1rem",
  };
};

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
      return {
        ok: false,
        message: data.message || "Gagal mengambil data profil.",
      };
    }

    return {
      ok: true,
      token,
      profile: normalizeProfile(data?.user ?? data?.data?.user ?? data?.data ?? null),
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Gagal mengambil data profil.",
    };
  }
};

const saveProfileCompletion = async ({ token, nama, no_hp, alamat }) => {
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

const openCheckoutProfilePopup = async ({ profile, token, popupConfig }) => {
  let savedProfile = null;

  const formResult = await Swal.fire({
    title: "Lengkapi Data",
    html: `
      <div style="display:flex;flex-direction:column;gap:${popupConfig.isMobile ? "6px" : "8px"};text-align:left;margin-top:${popupConfig.isMobile ? "4px" : "6px"};">
        <div style="display:grid;grid-template-columns:${popupConfig.isMobile ? "1fr" : "minmax(0,1.25fr) minmax(0,1fr)"};gap:8px;">
          <input id="checkout-nama" class="swal2-input" placeholder="Nama lengkap" value="${profile.nama || ""}" style="margin:0;width:100%;height:${popupConfig.isMobile ? "34px" : "38px"};font-size:${popupConfig.isMobile ? "11px" : "12px"};padding:${popupConfig.isMobile ? "6px 9px" : "8px 10px"};" />
          <input id="checkout-nohp" class="swal2-input" placeholder="No. handphone" value="${profile.no_hp || ""}" style="margin:0;width:100%;height:${popupConfig.isMobile ? "34px" : "38px"};font-size:${popupConfig.isMobile ? "11px" : "12px"};padding:${popupConfig.isMobile ? "6px 9px" : "8px 10px"};" />
        </div>
        <textarea id="checkout-alamat" class="swal2-textarea" placeholder="Alamat lengkap" style="margin:0;width:100%;min-height:${popupConfig.isMobile ? "62px" : "68px"};font-size:${popupConfig.isMobile ? "11px" : "12px"};padding:${popupConfig.isMobile ? "6px 9px" : "8px 10px"};">${profile.alamat || ""}</textarea>
      </div>
    `,
    icon: "info",
    width: popupConfig.width,
    padding: popupConfig.padding,
    showCancelButton: true,
    confirmButtonColor: "#0C2C55",
    cancelButtonColor: "#9d9d9d",
    confirmButtonText: "Simpan",
    cancelButtonText: "Batal",
    focusConfirm: false,
    customClass: {
      popup: popupConfig.isMobile ? "checkout-profile-popup-mobile" : "",
      title: popupConfig.isMobile ? "checkout-profile-title-mobile" : "",
      confirmButton: popupConfig.isMobile ? "checkout-profile-button-mobile" : "",
      cancelButton: popupConfig.isMobile ? "checkout-profile-button-mobile" : "",
    },
    preConfirm: async () => {
      const nama = document.getElementById("checkout-nama")?.value?.trim() || "";
      const noHp = document.getElementById("checkout-nohp")?.value?.trim() || "";
      const alamat = document.getElementById("checkout-alamat")?.value?.trim() || "";

      if (!nama || !noHp || !alamat) {
        Swal.showValidationMessage("Nama lengkap, no. handphone, dan alamat wajib diisi.");
        return false;
      }

      try {
        savedProfile = await saveProfileCompletion({
          token,
          nama,
          no_hp: noHp,
          alamat,
        });

        return true;
      } catch (error) {
        Swal.showValidationMessage(error.message || "Gagal menyimpan data profil.");
        return false;
      }
    },
  });

  if (!formResult.isConfirmed) {
    return null;
  }

  await Swal.fire({
    title: "Data Tersimpan",
    text: "Informasi pengiriman berhasil diperbarui.",
    icon: "success",
    width: popupConfig.width,
    padding: popupConfig.padding,
    timer: 1400,
    showConfirmButton: false,
  });

  return savedProfile;
};

export const openCheckoutProfileEditor = async () => {
  const popupConfig = getPopupConfig();
  const profileResult = await fetchCurrentProfile();

  if (!profileResult.ok) {
    await Swal.fire({
      title: "Profil Tidak Tersedia",
      text: profileResult.message,
      icon: "error",
      width: popupConfig.width,
      padding: popupConfig.padding,
      confirmButtonColor: "#0C2C55",
      confirmButtonText: "Oke",
    });
    return null;
  }

  return openCheckoutProfilePopup({
    profile: profileResult.profile,
    token: profileResult.token,
    popupConfig,
  });
};

export const ensureCheckoutProfileComplete = async () => {
  const popupConfig = getPopupConfig();
  const profileResult = await fetchCurrentProfile();

  if (!profileResult.ok) {
    await Swal.fire({
      title: "Profil Tidak Tersedia",
      text: profileResult.message,
      icon: "error",
      width: popupConfig.width,
      padding: popupConfig.padding,
      confirmButtonColor: "#0C2C55",
      confirmButtonText: "Oke",
    });
    return false;
  }

  const { profile, token } = profileResult;

  const needsGoogleCompletion =
    profile?.is_google_account &&
    (!profile.nama?.trim() || !profile.no_hp?.trim() || !profile.alamat?.trim());

  if (!needsGoogleCompletion) {
    return true;
  }

  const savedProfile = await openCheckoutProfilePopup({
    profile,
    token,
    popupConfig,
  });

  return Boolean(savedProfile);
};
