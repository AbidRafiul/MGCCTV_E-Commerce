const DashboardModel = require("../../models/DashboardModel");

const getDashboardStats = async (req, res) => {
  try {
    // Jalankan semua query ke database secara bersamaan (paralel)
    const [
      totalPendapatan,
      totalPesanan,
      produkAktif,
      stokHabis,
      pelanggan,
      pendapatanHarian,
      kategoriTerlaris,
      pesananTerbaru,
      aktivitasTerkini
    ] = await Promise.all([
      DashboardModel.getTotalPendapatan(),
      DashboardModel.getTotalPesanan(),
      DashboardModel.getProdukAktif(),
      DashboardModel.getStokHampirHabis(),
      DashboardModel.getTotalPelanggan(),
      DashboardModel.getPendapatanHarian(),
      DashboardModel.getKategoriTerlaris(),
      DashboardModel.getPesananTerbaru(),
      DashboardModel.getAktivitasTerkini(),
    ]);

    // Format data kategori terlaris (Mengatasi error Typo sebelumnya)
    const totalTerjual = kategoriTerlaris.reduce((acc, k) => acc + Number(k.total_terjual), 0) || 1;
    const kategoriWithPercent = kategoriTerlaris.map((k) => ({
      nama: k.nama_kategori,
      total: Number(k.total_terjual),
      persen: Math.round((Number(k.total_terjual) / totalTerjual) * 100),
    }));

    // Format data grafik pendapatan harian
    const maxHarian = Math.max(...pendapatanHarian.map((d) => Number(d.total)), 1);
    const harianWithRatio = pendapatanHarian.map((d) => ({
      tanggal: d.tanggal,
      total: Number(d.total),
      rasio: Math.round((Number(d.total) / maxHarian) * 100),
    }));

    return res.status(200).json({
      stats: {
        totalPendapatan: Number(totalPendapatan[0]?.total ?? 0),
        totalPesanan: Number(totalPesanan[0]?.total ?? 0),
        pesananMenunggu: Number(totalPesanan[0]?.menunggu ?? 0),
        produkAktif: Number(produkAktif[0]?.total ?? 0),
        produkHampirHabis: Number(stokHabis[0]?.hampir_habis ?? 0),
        totalPelanggan: Number(pelanggan[0]?.total ?? 0),
      },
      pendapatanHarian: harianWithRatio,
      kategoriTerlaris: kategoriWithPercent,
      pesananTerbaru: pesananTerbaru,
      aktivitasTerkini: aktivitasTerkini,
    });

  } catch (error) {
    return handleDashboardError(res, error, "Gagal mengambil data dashboard");
  }
};

module.exports = { getDashboardStats };
