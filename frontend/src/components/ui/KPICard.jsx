const TONE_BG = { blue: "bg-blue-50", emerald: "bg-emerald-50", amber: "bg-amber-50", rose: "bg-rose-50" };
const TONE_TEXT = { blue: "text-blue-600", emerald: "text-emerald-600", amber: "text-amber-600", rose: "text-rose-600" };

export default function KPICard({ label, value, icon: IconComp, tone = "blue" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {IconComp && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE_BG[tone]} ${TONE_TEXT[tone]}`}>
            <IconComp width={16} height={16} />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
