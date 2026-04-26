export default function ReadNotifikasiSection({ readNotifs, getStyleByType }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Sudah Dibaca
      </h2>
      <div className="space-y-2.5">
        {readNotifs.map((notif) => {
          const style = getStyleByType(notif.type);
          return (
            <div 
              key={notif.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${style.boxClass} opacity-75 hover:opacity-100 transition-opacity`}
            >
              <div className="shrink-0 pt-0.5">
                {style.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="text-[13px] font-semibold text-slate-700 mb-0.5 leading-tight">
                  {notif.title}
                </h3>
                <p className="text-[11px] text-slate-500 mb-1 leading-tight">
                  {notif.description}
                </p>
                <span className="text-[10px] font-medium text-slate-400 leading-none">
                  {notif.time}
                </span>
              </div>
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