import StatusBadge from "../../../../components/ui/StatusBadge";

export default function YardStatusBoard({ yards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {yards.map((y) => (
        <div key={y.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">{y.name}</div>
          <div className="text-xs text-slate-600 mt-1">{y.trucksInYard} / {y.capacity} trucks</div>
          <div className="mt-2"><StatusBadge status={y.status} /></div>
        </div>
      ))}
    </div>
  );
}
