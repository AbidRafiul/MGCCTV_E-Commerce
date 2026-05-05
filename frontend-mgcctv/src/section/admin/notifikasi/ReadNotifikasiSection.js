const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function ReadNotifikasiSection({ readNotifs, getStyleByType, handleRead }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Sudah Dibaca
      </h2>
      <div className="space-y-2.5">
        {readNotifs.map((notif) => {
          const style = getStyleByType(notif.tipe || notif.type);
          return (
            <div 
              key={notif.id_notifikasi || notif.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${style.boxClass} opacity-75 hover:opacity-100 transition-opacity`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 pt-0.5">
                  {style.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[13px] font-semibold text-slate-700 mb-0.5 leading-tight">
                    {notif.judul || notif.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-1 leading-tight">
                    {notif.pesan || notif.description}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 leading-none">
                    {formatRelativeTime(notif.created_at || notif.time)}
                  </span>
                </div>
              </div>
              
              {/* Optional: link untuk membuka detail pesanan walau sudah dibaca */}
              {notif.link_tujuan && (
                 <div className="mt-3 sm:mt-0 sm:ml-4 shrink-0">
                  <button 
                    onClick={() => handleRead(notif.id_notifikasi || notif.id, notif.link_tujuan)}
                    className="px-3 py-1 text-[10px] font-semibold rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Lihat Detail
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {readNotifs.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2">Belum ada notifikasi yang dibaca.</p>
        )}
      </div>
    </div>
  );
}
