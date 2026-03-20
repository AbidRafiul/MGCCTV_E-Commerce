import { ShieldCheck, Zap, Smartphone } from "lucide-react"; // Pastikan sudah install lucide-react

export default function WhyUs() {
  const features = [
    {
      title: "Kualitas Ultra HD",
      desc: "Nikmati kualitas visual tanpa kompromi dengan sensor mutakhir. Gambar tetap tajam dan jernih bahkan dalam kondisi minim cahaya berkat fitur Advanced Night Vision kami.",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      img: "https://images.unsplash.com/photo-1558002038-1055907df827",
      styles: ""
    },
    {
      title: "Instalasi Cepat",
      desc: "Waktu Anda berharga. Tim teknisi profesional kami menjamin pemasangan rapi, cepat, dan tanpa ribet, sehingga sistem keamanan Anda langsung siap digunakan.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
      styles: "md:-translate-y-8 shadow-2xl border-blue-100" // Efek melayang lebih kuat di tengah
    },
    {
      title: "Akses Dimana Saja",
      desc: "Pantau keamanan properti langsung dari genggaman. Aplikasi seluler kami yang responsif memungkinkan akses real-time kapan saja dan dari mana saja secara stabil.",
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      img: "https://plus.unsplash.com/premium_photo-1661326248003-094982639fb7",
      styles: ""
    }
  ];

  return (
    <section className="relative px-6 py-24 bg-slate-50 overflow-hidden">
      {/* Ornamen Latar Belakang agar tidak sepi */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl text-[#0C2C55] font-extrabold tracking-tight">
            Kenapa MG CCTV Jadi <span className="text-blue-600">Pilihan Utama?</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Kami memberikan lebih dari sekadar kamera pengawas, kami memberikan ketenangan pikiran untuk aset berharga Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 items-stretch">
          {features.map((item, index) => (
            <div 
              key={index}
              className={`group bg-white rounded-3xl p-3 shadow-xl border border-gray-100 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 ${item.styles}`}
            >
              <div className="relative overflow-hidden rounded-2xl h-48">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C55]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg">
                  {item.icon}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl text-[#0C2C55] font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}