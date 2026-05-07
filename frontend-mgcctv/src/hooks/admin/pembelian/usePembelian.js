import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// --- FUNGSI FORMATTER UTILITAS ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const createEmptyForm = () => ({
  id_supplier: "",
  no_faktur: "",
  tanggal: new Date().toISOString().slice(0, 10),
  items: [{ id_produk: "", jumlah: "", harga_beli: "" }],
});

export const usePembelian = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(createEmptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState({ open: false, isLoading: false, data: null });
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, title: "", description: "", tone: "success" });

  const openFeedbackDialog = ({ title, description, tone }) => {
    setFeedbackDialog({ open: true, title, description, tone });
  };

  const fetchInventoryData = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const [optionsRes, purchasesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/pembelian/options`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/pembelian/transaksi`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const optionsPayload = await optionsRes.json().catch(() => ({}));
      const purchasesPayload = await purchasesRes.json().catch(() => ({}));

      if (!optionsRes.ok) throw new Error(optionsPayload.message || "Gagal mengambil pilihan pembelian");
      if (!purchasesRes.ok) throw new Error(purchasesPayload.message || "Gagal mengambil data pembelian");

      setProducts(Array.isArray(optionsPayload.products) ? optionsPayload.products : []);
      setSuppliers(Array.isArray(optionsPayload.suppliers) ? optionsPayload.suppliers : []);
      setPurchases(Array.isArray(purchasesPayload.data) ? purchasesPayload.data : []);
    } catch (fetchError) {
      setError(fetchError.message || "Gagal memuat data pembelian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchInventoryData();
  }, []);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setFormData(createEmptyForm());
    setIsFormOpen(true);
  };

  const closeCreateForm = () => {
    if (!isSubmitting) setIsFormOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id_produk: "", jumlah: "", harga_beli: "" }],
    }));
  };

  const removeItemRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.length === 1
        ? prev.items
        : prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const formTotal = useMemo(
    () => formData.items.reduce((total, item) => total + (Number(item.jumlah || 0) * Number(item.harga_beli || 0)), 0),
    [formData.items],
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/pembelian`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        openFeedbackDialog({
          title: "Pembelian Berhasil Disimpan",
          description: result?.data?.total_item
              ? `${result.data.total_item} item pembelian dengan total ${formatCurrency(result.data.total)} berhasil disimpan.`
              : result?.message || "Data pembelian berhasil disimpan.",
          tone: "success",
        });
        setFormData(createEmptyForm());
        setIsFormOpen(false);
        await fetchInventoryData();
      } else {
        openFeedbackDialog({
          title: "Gagal Menyimpan Pembelian",
          description: result?.message || result?.error || "Terjadi kesalahan saat menyimpan pembelian.",
          tone: "error",
        });
      }
    } catch (err) {
      openFeedbackDialog({ title: "Server Tidak Merespons", description: "Koneksi ke server gagal. Coba lagi beberapa saat lagi.", tone: "warning" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPurchaseDetail = async (purchase) => {
    const token = localStorage.getItem("token");
    setDetailDialog({ open: true, isLoading: true, data: { ...purchase, items: [] } });

    try {
      const response = await fetch(`${API_BASE_URL}/api/pembelian/${purchase.id_pembelian}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail pembelian");
      }

      setDetailDialog({ open: true, isLoading: false, data: result.data });
    } catch (detailError) {
      setDetailDialog((prev) => ({ ...prev, isLoading: false }));
      openFeedbackDialog({
        title: "Detail Gagal Dimuat",
        description: detailError.message || "Gagal mengambil detail pembelian.",
        tone: "error",
      });
    }
  };

  const closePurchaseDetail = () => setDetailDialog({ open: false, isLoading: false, data: null });

  const deletePurchase = async (purchase) => {
    const confirmed = window.confirm(`Hapus pembelian ${purchase.no_faktur || `#${purchase.id_pembelian}`}? Stok barang akan dikurangi sesuai trigger database.`);
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    setDeletingId(purchase.id_pembelian);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pembelian/${purchase.id_pembelian}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus pembelian");
      }

      openFeedbackDialog({
        title: "Pembelian Dihapus",
        description: result.message || "Data pembelian berhasil dihapus.",
        tone: "success",
      });
      await fetchInventoryData();
    } catch (deleteError) {
      openFeedbackDialog({
        title: "Gagal Menghapus",
        description: deleteError.message || "Pembelian gagal dihapus.",
        tone: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const inventoryStats = useMemo(() => {
    const totalTransaksi = purchases.length;
    const totalBarangMasuk = purchases.reduce((total, item) => total + Number(item.total_barang || 0), 0);
    const totalNilaiPembelian = purchases.reduce((total, item) => total + Number(item.total || 0), 0);
    const totalProdukDibeli = purchases.reduce((total, item) => total + Number(item.jumlah_item || 0), 0);
    return { totalTransaksi, totalBarangMasuk, totalNilaiPembelian, totalProdukDibeli };
  }, [purchases]);
  
  const latestPurchases = useMemo(() => purchases.slice(0, 5), [purchases]);

  const feedbackMeta = feedbackDialog.tone === "success"
      ? { icon: CheckCircle2, mediaClass: "bg-emerald-50 text-emerald-600", buttonClass: "bg-[#0C2C55] hover:bg-[#123d73]" }
      : feedbackDialog.tone === "warning"
        ? { icon: CircleAlert, mediaClass: "bg-amber-50 text-amber-600", buttonClass: "bg-amber-500 text-white hover:bg-amber-600" }
        : { icon: CircleAlert, mediaClass: "bg-red-50 text-red-600", buttonClass: "bg-red-600 text-white hover:bg-red-700" };

  return {
    products, suppliers, purchases, isLoading, error, formData, formTotal, isFormOpen, detailDialog,
    deletingId, isSubmitting, feedbackDialog, setFeedbackDialog, setDetailDialog, openCreateForm, closeCreateForm,
    handleFormChange, handleItemChange, addItemRow, removeItemRow, handleFormSubmit, openPurchaseDetail,
    closePurchaseDetail, deletePurchase, inventoryStats, latestPurchases, feedbackMeta,
    formatCurrency, formatNumber, formatDateTime
  };
};
