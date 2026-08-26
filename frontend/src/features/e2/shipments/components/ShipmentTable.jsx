import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../../components/ui/StatusBadge";

export default function ShipmentTable({ shipments }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-left">
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Shipment</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Origin</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Destination</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Planned Qty</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Received</th>
            <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Procurement</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr
              key={s.id}
              className="border-t border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/e2/shipments/${s.reference}`)}
            >
              <td className="px-4 py-3 text-slate-900 font-medium">{s.reference}</td>
              <td className="px-4 py-3 text-slate-700">{s.origin}</td>
              <td className="px-4 py-3 text-slate-700">{s.destination}</td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-3 text-slate-700">{s.plannedQuantityM ? `${s.plannedQuantityM.toLocaleString()} m` : "—"}</td>
              <td className="px-4 py-3 text-slate-700">{s.receivedQuantityM ? `${s.receivedQuantityM.toLocaleString()} m` : "—"}</td>
              <td className="px-4 py-3">
                {s.procurementPlanId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/p2/procurement/${s.procurementPlanId}`);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    View Plan
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
