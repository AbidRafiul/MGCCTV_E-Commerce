export const formatLastLogin = (dateString) => {
  if (!dateString) return "Belum tercatat";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
};

export const timeAgo = (dateString) => {
  if (!dateString) return "Belum pernah diupdate";
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((new Date() - date) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
  return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`;
};