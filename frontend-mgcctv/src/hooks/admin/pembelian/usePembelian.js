import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { API_BASE_URL, PUBLIC_API_URL } from "@/lib/api";

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

const statusTone = (stok) => {
  const numericStock = Number(stok || 0);
  if (numericStock <= 0) return { label: "Habis", className: "bg-rose-50 text-rose-700 ring-rose-100" };
  if (numericStock <= 5) return { label: "Stok Tipis", className: "bg-amber-50 text-amber-700 ring-amber-100" };
  return { label: "Aman", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
};

export const usePembelian = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ id_produk: "", qty_masuk: "", catatan: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, title: "", description: "", tone: "success" });

  const openFeedbackDialog = ({ title, description, tone }) => {
    setFeedbackDialog({ open: true, title, description, tone });
  };

  const fetchInventoryData = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${PUBLIC_API_URL}/produk`),
        fetch(`${API_BASE_URL}/api/admin/pesanan`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const productsPayload = await productsRes.json().catch(() => []);
      const ordersPayload = await ordersRes.json().catch(() => []);

      if (!productsRes.ok) throw new Error("Gagal mengambil data produk");

      setProducts(Array.isArray(productsPayload) ? productsPayload : []);
      setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/pembelian/tambah`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        openFeedbackDialog({
          title: "Stok Berhasil Ditambahkan",
          description: result?.data?.nama_produk && result?.data?.qty_masuk
              ? `${result.data.qty_masuk} unit ${result.data.nama_produk} sudah masuk ke inventori.`
              : result?.message || "Data stok masuk berhasil disimpan.",
          tone: "success",
        });
        setFormData({ id_produk: "", qty_masuk: "", catatan: "" });
        await fetchInventoryData();
      } else {
        openFeedbackDialog({
          title: "Gagal Menyimpan Stok",
          description: result?.error || result?.message || "Terjadi kesalahan saat menyimpan stok masuk.",
          tone: "error",
        });
      }
    } catch (err) {
      openFeedbackDialog({ title: "Server Tidak Merespons", description: "Koneksi ke server gagal. Coba lagi beberapa saat lagi.", tone: "warning" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- COMPuted STATS ---
  const inventoryStats = useMemo(() => {
    const totalProduk = products.length;
    const totalStok = products.reduce((total, product) => total + Number(product.stok || 0), 0);
    const stokTipis = products.filter((p) => Number(p.stok || 0) > 0 && Number(p.stok || 0) <= 5).length;
    const stokHabis = products.filter((p) => Number(p.stok || 0) <= 0).length;
    const totalTerjual = orders.filter((order) => order.status_order === "selesai").reduce((total, order) => total + Number(order.total_item || 0), 0);
    return { totalProduk, totalStok, stokTipis, stokHabis, totalTerjual };
  }, [orders, products]);

  const productsByStock = useMemo(() => [...products].sort((a, b) => Number(a.stok || 0) - Number(b.stok || 0)), [products]);
  
  const latestCompletedOrders = useMemo(() => orders.filter((order) => order.status_order === "selesai").slice(0, 5), [orders]);

  const feedbackMeta = feedbackDialog.tone === "success"
      ? { icon: CheckCircle2, mediaClass: "bg-emerald-50 text-emerald-600", buttonClass: "bg-[#0C2C55] hover:bg-[#123d73]" }
      : feedbackDialog.tone === "warning"
        ? { icon: CircleAlert, mediaClass: "bg-amber-50 text-amber-600", buttonClass: "bg-amber-500 text-white hover:bg-amber-600" }
        : { icon: CircleAlert, mediaClass: "bg-red-50 text-red-600", buttonClass: "bg-red-600 text-white hover:bg-red-700" };

  return {
    products, isLoading, error, formData, isSubmitting, feedbackDialog, setFeedbackDialog,
    handleFormChange, handleFormSubmit, inventoryStats, productsByStock, latestCompletedOrders, feedbackMeta,
    formatCurrency, formatNumber, formatDateTime, statusTone
  };
};