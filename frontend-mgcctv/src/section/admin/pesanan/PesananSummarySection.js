export default function PesananSummarySection({ summaryCards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.wrapClass}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">{item.label}</p>
              <p className="text-xl font-bold text-[#0C2C55]">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}