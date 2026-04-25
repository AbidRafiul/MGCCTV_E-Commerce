import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

// --- FUNGSI HELPER CROP GAMBAR ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped_cms_image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
};

// --- CUSTOM HOOK UTAMA ---
export const useCMS = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [konten, setKonten] = useState({
    1: { section_name: "Tentang Utama", content_value: "", url_gambar: "", preview: null, file: null },
    2: { section_name: "Info Toko", content_value: "", url_gambar: "" },
    3: { section_name: "Lokasi Toko", content_value: "", url_gambar: "" },
    4: { section_name: "Admin 1", content_value: "", url_gambar: "" },
    5: { section_name: "Admin 2", content_value: "", url_gambar: "" } 
  });

  const [galeri, setGaleri] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // STATE CROPPER
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const resKonten = await fetch("http://localhost:3000/api/admin/cms/tentang", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resKonten.ok) {
        const dataKonten = await resKonten.json();
        const newKonten = { ...konten };
        dataKonten.forEach(item => {
          if (newKonten[item.id_cms_konten]) {
            newKonten[item.id_cms_konten].content_value = item.content_value || "";
            newKonten[item.id_cms_konten].url_gambar = item.url_gambar || "";
            newKonten[item.id_cms_konten].preview = item.url_gambar || null;
          }
        });
        setKonten(newKonten);
      }

      const resGaleri = await fetch("http://localhost:3000/api/admin/cms/galeri", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resGaleri.ok) {
        setGaleri(await resGaleri.json());
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS
  const handleKontenChange = (id, field, value) => {
    setKonten(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setCropTarget(target);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropModal(true);
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (cropTarget === 'banner') {
        setKonten(prev => ({
          ...prev,
          1: { ...prev[1], file: croppedFile, preview: URL.createObjectURL(croppedFile) }
        }));
      } else if (cropTarget === 'galeri') {
        setIsUploadingGallery(true);
        const formData = new FormData();
        formData.append("gambar", croppedFile);
        formData.append("section_name", "Galeri");

        const res = await fetch("http://localhost:3000/api/admin/cms/galeri", {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: formData
        });

        if (!res.ok) throw new Error("Gagal mengunggah foto galeri");
        Swal.fire({ title: "Berhasil!", text: "Foto ditambahkan ke galeri.", icon: "success", timer: 1500, showConfirmButton: false });
        fetchData(); 
      }
      
      setShowCropModal(false);
      setIsUploadingGallery(false);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Gagal memproses gambar", "error");
      setIsUploadingGallery(false);
    }
  };

  const saveKonten = async (id) => {
    setIsSaving(id);
    try {
      const formData = new FormData();
      formData.append("section_name", konten[id].section_name);
      formData.append("content_value", konten[id].content_value);
      
      if (konten[id].file) formData.append("gambar", konten[id].file);
      else if (id === 3) formData.append("url_gambar", konten[id].url_gambar);

      const res = await fetch(`http://localhost:3000/api/admin/cms/tentang/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      Swal.fire({ title: "Berhasil!", text: "Konten berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
      fetchData(); 
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGallery = async (id) => {
    Swal.fire({
      title: "Hapus Foto?", text: "Foto ini akan dihapus dari galeri secara permanen.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Ya, Hapus!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/admin/cms/galeri/${id}`, {
            method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          if (!res.ok) throw new Error("Gagal menghapus foto");
          Swal.fire({ title: "Terhapus!", text: "Foto galeri telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
          fetchData();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  // EXPORT SEMUA STATE & FUNGSI AGAR BISA DIPAKAI DI PAGE
  return {
    isLoading, isSaving, konten, galeri, isUploadingGallery,
    showCropModal, setShowCropModal, cropTarget, imageSrc,
    crop, setCrop, zoom, setZoom, onCropComplete,
    handleKontenChange, handleFileChange, handleCropImage, 
    saveKonten, deleteGallery
  };
};