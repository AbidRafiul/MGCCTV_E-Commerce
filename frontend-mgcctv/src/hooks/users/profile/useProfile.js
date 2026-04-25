"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";

const initialForm = {
  nama: "",
  username: "",
  email: "",
  no_hp: "",
  alamat: "",
};

const parseProfileDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "string") {
    const cleaned = value.trim();
    const normalized = cleaned.includes(" ") ? cleaned.replace(" ", "T") : cleaned;
    const isoParsed = new Date(normalized);
    if (!Number.isNaN(isoParsed.getTime())) return isoParsed;

    const dmyMatch = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (dmyMatch) {
      const [, day, month, year, hour = "00", minute = "00", second = "00"] = dmyMatch;
      const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (ymdMatch) {
      const [, year, month, day, hour = "00", minute = "00", second = "00"] = ymdMatch;
      const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  const fallbackDate = new Date(value);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

const normalizeProfile = (user) => {
  if (!user || typeof user !== "object") return null;
  return {
    ...user,
    created_at:
      user.created_at ?? user.createdAt ?? user.tanggal_daftar ?? user.tanggalDaftar ??
      user.registered_at ?? user.registeredAt ?? user.join_date ?? user.joinDate ??
      user.tgl_daftar ?? null,
  };
};

export const useProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isGoogleAccount = Boolean(profile?.is_google_account);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        return;
      }
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengambil data profile");

        const rawUser = data?.user ?? data?.data?.user ?? data?.data ?? null;
        const normalizedUser = normalizeProfile(rawUser);

        setProfile(normalizedUser);
        setForm({
          nama: normalizedUser?.nama || "",
          username: normalizedUser?.username || "",
          email: normalizedUser?.email || "",
          no_hp: normalizedUser?.no_hp || "",
          alamat: normalizedUser?.alamat || "",
        });
      } catch (fetchError) {
        if (
          fetchError.message?.toLowerCase().includes("jwt") ||
          fetchError.message?.toLowerCase().includes("token") ||
          fetchError.message?.toLowerCase().includes("unauthorized")
        ) {
          handleLogout();
          return;
        }
        setError(fetchError.message || "Gagal memuat profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [handleLogout]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const payload = isGoogleAccount
        ? { nama: form.nama, no_hp: form.no_hp, alamat: form.alamat }
        : form;

      const res = await fetch(`${AUTH_API_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profile");

      const rawUser = data?.user ?? data?.data?.user ?? data?.data ?? null;
      const normalizedUser = normalizeProfile(rawUser);

      setProfile((prev) => normalizeProfile({ ...prev, ...normalizedUser }));
      setForm({
        nama: normalizedUser?.nama || "",
        username: normalizedUser?.username || "",
        email: normalizedUser?.email || "",
        no_hp: normalizedUser?.no_hp || "",
        alamat: normalizedUser?.alamat || "",
      });

      setIsEditing(false);
      setSuccess(data.message || "Profile berhasil diperbarui");
    } catch (submitError) {
      setError(submitError.message || "Gagal memperbarui profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryAction = () => {
    setSuccess("");
    if (isEditing) {
      handleSubmit();
      return;
    }
    setIsEditing(true);
  };

  const handleSecondaryAction = () => {
    if (isEditing) {
      setForm({
        nama: profile?.nama || "",
        username: profile?.username || "",
        email: profile?.email || "",
        no_hp: profile?.no_hp || "",
        alamat: profile?.alamat || "",
      });
      setError("");
      setSuccess("");
      setIsEditing(false);
      return;
    }
    if (!isGoogleAccount) router.push("/ubah-password");
  };

  const handleNavigate = (key) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    if (key === "password") {
      if (isGoogleAccount) return;
      router.push("/ubah-password");
      return;
    }
    if (key === "orders") router.push("/riwayat");
  };

  const formatJoinDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = parseProfileDate(dateValue);
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    }).format(date);
  };

  const fields = [
    { name: "nama", label: "Nama Lengkap", type: "text" },
    { name: "username", label: "Username", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "no_hp", label: "No. Handphone", type: "text" },
    { name: "alamat", label: "Alamat", type: "textarea" },
  ];

  const isFieldEditable = (fieldName) => {
    if (!isEditing) return false;
    if (!isGoogleAccount) return true;
    return fieldName === "nama" || fieldName === "no_hp" || fieldName === "alamat";
  };

  return {
    profile, form, isEditing, isLoading, isSaving, error, success,
    isGoogleAccount, handleChange, handlePrimaryAction, handleSecondaryAction,
    handleNavigate, formatJoinDate, fields, isFieldEditable
  };
};