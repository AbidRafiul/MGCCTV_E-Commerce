import { CheckCheck } from "lucide-react";

export default function UnreadNotifikasiSection({ unreadNotifs, markAllAsRead, getStyleByType }) {
  if (unreadNotifs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-semibold text-blue-600">
          {unreadNotifs.length} notifikasi belum dibaca
        </h2>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm w-fit"
        >
          <CheckCheck size={14} />
          Tandai Semua Dibaca
        </button>
      </div>

      <div className="space-y-2.5">
        {unreadNotifs.map((notif) => {
          const style = getStyleByType(notif.type);
          return (
            <div 
              key={notif.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${style.boxClass} transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center shadow-sm ${style.iconBg}`}>
                  {style.icon}
                </div>
                <div className="flex flex-col justify-center pt-0.5">
                  <h3 className="text-sm font-bold text-[#0C2C55] mb-0.5 leading-tight">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-1 leading-tight">
                    {notif.description}
                  </p>
                  <span className="text-[11px] font-semibold text-blue-500 leading-none">
                    {notif.time}
                  </span>
                </div>
              </div>

              {notif.actionLabel && (
                <div className="mt-3 sm:mt-0 sm:ml-4 shrink-0">
                  <button className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors shadow-sm ${style.btnClass}`}>
                    {notif.actionLabel}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}