import Hero from "@/components/home/Hero";

export default function HomeSection() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <Hero />

      {/* Section Mengapa Memilih Kami */}
      <section className="px-10 py-10">
        <h2 className="text-xl font-bold text-center mb-8">
          Mengapa Memilih Kami
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-4 rounded shadow">
              <img
                src="https://images.unsplash.com/photo-1581093588401-12cde2c7f5b1"
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold mt-3">Kualitas Ultra HD</h3>
              <p className="text-sm text-gray-500">
                Gambar tajam dan jernih dalam segala kondisi.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Produk */}
      <section className="px-10 pb-10">
        <h2 className="text-xl font-bold text-center mb-8">
          Produk Unggulan
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white p-4 rounded shadow text-center"
            >
              <img
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620"
                className="w-full h-40 object-contain"
              />
              <h3 className="font-semibold mt-3">Camera Dome 2MP</h3>
              <p className="text-blue-600 font-bold">Rp 450.000</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}