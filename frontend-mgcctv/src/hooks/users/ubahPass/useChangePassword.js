"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AUTH_API_URL } from "@/lib/api";

const initialForm = {
  passwordLama: "",
  passwordBaru: "",
  konfirmasiPassword: "",
};

export const useChangePassword = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const checkPasswordAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        const res = await fetch(`${AUTH_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data profile");
        }

        const user = data?.user ?? null;
        const isGoogleUser = Boolean(user?.is_google_account);

        setIsGoogleAccount(isGoogleUser);

        if (isGoogleUser) {
          router.replace("/profile");
          return;
        }
      } catch {
        handleLogout();
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkPasswordAccess();
  }, [handleLogout]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setSuccess("");

      if (!form.passwordLama || !form.passwordBaru || !form.konfirmasiPassword) {
        setError("Semua field wajib diisi");
        return;
      }

      if (form.passwordBaru !== form.konfirmasiPassword) {
        setError("Password baru dan konfirmasi password tidak cocok");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        setIsSaving(true);

        const res = await fetch(`${AUTH_API_URL}/ubah-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengubah password");
        }

        setSuccess(data.message || "Password berhasil diubah");
        setForm(initialForm);
      } catch (submitError) {
        setError(submitError.message || "Gagal mengubah password");
      } finally {
        setIsSaving(false);
      }
    },
    [form, handleLogout],
  );

  const handleNavigate = useCallback(
    (key) => {
      if (key === "profile") {
        router.push("/profile");
        return;
      }

      if (key === "orders") {
        router.push("/riwayat");
        return;
      }

      if (key === "password") {
        router.push("/ubah-password");
        return;
      }

      if (key === "logout") {
        handleLogout();
      }
    },
    [handleLogout, router],
  );

  return {
    form,
    setForm,
    initialForm,
    isLoading,
    isSaving,
    error,
    setError,
    success,
    setSuccess,
    isGoogleAccount,
    handleChange,
    handleSubmit,
    handleNavigate,
  };
};