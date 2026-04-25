import { Search, Calendar, Download } from "lucide-react";

export default function PesananFilterSection({ tabs, activeTab, setActiveTab, search, setSearch }) {
  return (
    <>
      <div className="flex items-center overflow-x-auto border-b border-slate-200 hide-scrollbar bg-slate-50/50">
        {tabs.map((tab) => {
          const tabLabel = tab.split(" ")[0];
          const isActive = activeTab === tabLabel;
          return (
            <button
              key={tab} onClick={() => setActiveTab(tabLabel)}
              className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ID pesanan / pelanggan..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-32">
              <input type="text" value="Terhubung" readOnly className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50" />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative flex-1 sm:w-32">
              <input type="text" value="Realtime" readOnly className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50" />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 w-full lg:w-auto shadow-sm">
          <Download size={14} /> Export Excel
        </button>
      </div>
    </>
  );
}