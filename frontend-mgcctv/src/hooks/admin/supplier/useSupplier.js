"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SUPPLIER_API = `${API_URL}/api/admin/supplier`;

const initialFormData = {
  nama_supplier: "",
  no_hp: "",
  alamat: "",
};

export const useSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSupplierId, setActionSupplierId] = useState(null);
  const [error, setError] = useState("");

  // getAuthHeaders: menyiapkan header token untuk semua request supplier.
  const getAuthHeaders = useCallback((withJson = false) => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    if (withJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }, []);

  // fetchSuppliers: mengambil data supplier dari API dan menyimpannya ke state.
  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(SUPPLIER_API, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mengambil data supplier");

      setSuppliers(Array.isArray(data.data) ? data.data : []);
    } catch (fetchError) {
      setError(fetchError.message || "Gagal mengambil data supplier");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // filteredSuppliers: memfilter data supplier berdasarkan nama, no hp, alamat, atau nama admin pembuat.
  const filteredSuppliers = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return suppliers;

    return suppliers.filter((supplier) => {
      const searchableText = [
        supplier.nama_supplier,
        supplier.no_hp,
        supplier.alamat,
        supplier.created_by_nama,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [searchTerm, suppliers]);

  // handleFormChange: mengubah isi form sesuai input yang sedang diketik admin.
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // openAddModal: membuka popup form dalam mode tambah supplier.
  const openAddModal = () => {
    setSelectedSupplier(null);
    setFormData(initialFormData);
    setError("");
    setIsModalOpen(true);
  };

  // openEditModal: membuka popup form dalam mode edit dan mengisi data supplier terpilih.
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      nama_supplier: supplier.nama_supplier || "",
      no_hp: supplier.no_hp || "",
      alamat: supplier.alamat || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  // closeModal: menutup popup dan membersihkan data form.
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setFormData(initialFormData);
    setError("");
  };

  // handleSubmit: mengirim data tambah atau edit supplier ke API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const isEditing = Boolean(selectedSupplier);
      const url = isEditing
        ? `${SUPPLIER_API}/${selectedSupplier.id_supplier}`
        : SUPPLIER_API;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menyimpan supplier");

      await fetchSuppliers();
      closeModal();

      Swal.fire({
        title: "Berhasil",
        text: data.message || "Data supplier berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#0C2C55",
      });
    } catch (submitError) {
      setError(submitError.message || "Gagal menyimpan supplier");
    } finally {
      setIsSaving(false);
    }
  };

  // handleDelete: menampilkan konfirmasi lalu menghapus supplier dari API.
  const handleDelete = async (supplier) => {
    const result = await Swal.fire({
      title: "Hapus supplier?",
      text: `Data "${supplier.nama_supplier}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0C2C55",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setActionSupplierId(supplier.id_supplier);
      setError("");

      const res = await fetch(`${SUPPLIER_API}/${supplier.id_supplier}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menghapus supplier");

      setSuppliers((prev) =>
        prev.filter((item) => item.id_supplier !== supplier.id_supplier)
      );

      Swal.fire({
        title: "Terhapus",
        text: data.message || "Supplier berhasil dihapus.",
        icon: "success",
        confirmButtonColor: "#0C2C55",
      });
    } catch (deleteError) {
      Swal.fire("Error", deleteError.message || "Gagal menghapus supplier", "error");
    } finally {
      setActionSupplierId(null);
    }
  };

  return {
    suppliers,
    filteredSuppliers,
    searchTerm,
    setSearchTerm,
    formData,
    selectedSupplier,
    isModalOpen,
    isLoading,
    isSaving,
    actionSupplierId,
    error,
    fetchSuppliers,
    handleFormChange,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
};
