export default function FeaturedProducts() {
  // Data ini nantinya akan diambil dari database/API yang dikelola Admin/Super Admin
  const products = [
    {
      id: 1,
      name: "Camera Dome 2MP Ultra Night",
      price: "Rp 450.000",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620",
      tag: "Best Seller"
    },
    {
      id: 2,
      name: "IP Camera Outdoor 4MP",
      price: "Rp 850.000",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9",
      tag: "Promo"
    },
    {
      id: 3,
      name: "NVR Kit 8 Channel",
      price: "Rp 2.450.000",
      rating: "5.0",
      image: "https://images.unsplash.com/photo-1596434407421-508006830767",
      tag: "Premium"
    }
  ];

  return (
    <section className="px-6 py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADING SECTION - CENTERED */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-[#0C2C55] font-extrabold tracking-tight">
            Produk <span className="text-blue-600">Unggulan</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Koleksi perangkat keamanan terbaik pilihan Toko MG CCTV untuk perlindungan maksimal properti Anda.
          </p>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <div 
              key={product.id}
              className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 relative flex flex-col"
            >
              {/* BADGE (CMS Ready) */}
              {product.tag && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#0C2C55] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    {product.tag}
                  </span>
                </div>
              )}

              {/* IMAGE CONTAINER - CLEAN WITHOUT OVERLAY */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-4"
                />
              </div>

              {/* CONTENT */}
              <div className="mt-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[#0C2C55] leading-snug group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shrink-0"/>
                </div>
                
                <p className="text-blue-600 font-extrabold text-xl mb-4">
                  {product.price}
                </p>
              </div>

              {/* ACTION BUTTON */}
              <button className="w-full py-3.5 bg-gray-50 text-[#0C2C55] font-bold rounded-xl border border-gray-100 group-hover:bg-[#0C2C55] group-hover:text-white group-hover:border-[#0C2C55] transition-all duration-300">
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}