export default function LaporanSummarySection({ currentCards, toneStyles }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {currentCards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{card.value}</h2>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${toneStyles[card.tone]}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{card.note}</p>
          </article>
        );
      })}
    </section>
  );
}