import { CheckCheck } from "lucide-react";

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
  
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function UnreadNotifikasiSection({ unreadNotifs, handleMarkAllRead, getStyleByType, handleRead }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-semibold text-blue-600">
          {unreadNotifs.length} notifikasi belum dibaca
        </h2>
        {unreadNotifs.length > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm w-fit"
          >
            <CheckCheck size={14} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {unreadNotifs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">Belum ada notifikasi yang belum dibaca.</p>
        ) : (
          unreadNotifs.map((notif) => {
            const style = getStyleByType(notif.tipe || notif.type);
            return (
              <div 
                key={notif.id_notifikasi || notif.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${style.boxClass} transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center shadow-sm ${style.iconBg}`}>
                    {style.icon}
                  </div>
                  <div className="flex flex-col justify-center pt-0.5">
                    <h3 className="text-sm font-bold text-[#0C2C55] mb-0.5 leading-tight">
                      {notif.judul || notif.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-1 leading-tight">
                      {notif.pesan || notif.description}
                    </p>
                    <span className="text-[11px] font-semibold text-blue-500 leading-none">
                      {formatRelativeTime(notif.created_at || notif.time)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-3 sm:mt-0 sm:ml-4 shrink-0 flex gap-2">
                  <button 
                    onClick={() => handleRead(notif.id_notifikasi || notif.id, notif.link_tujuan)}
                    className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors shadow-sm ${style.btnClass || 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {notif.actionLabel || "Tandai Dibaca"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
