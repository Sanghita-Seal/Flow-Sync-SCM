import { TONE_STYLES } from "../../utils/constants";

export default function KPICard({ label, value, icon: IconComp, tone = "blue" }) {
  const t = TONE_STYLES[tone] || TONE_STYLES.blue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {IconComp && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.text}`}>
            <IconComp width={16} height={16} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
