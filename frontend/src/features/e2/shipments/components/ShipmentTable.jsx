import StatusBadge from "../../../../components/ui/StatusBadge";

const COLUMNS = ["Reference", "Origin", "Destination", "Status"];

export default function ShipmentTable({ shipments }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-left">
            {COLUMNS.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900 font-medium">{s.reference}</td>
              <td className="px-4 py-3 text-slate-700">{s.origin}</td>
              <td className="px-4 py-3 text-slate-700">{s.destination}</td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
