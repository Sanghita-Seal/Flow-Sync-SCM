import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import ShipmentTable from "../../features/e2/shipments/components/ShipmentTable";
import { getShipments } from "../../features/e2/shipments/shipment.service";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getShipments().then(setShipments).finally(() => setLoading(false));
  }, []);

  const filtered = shipments.filter((s) => {
    const matchesSearch = !search || 
      s.reference?.toLowerCase().includes(search.toLowerCase()) ||
      s.origin?.toLowerCase().includes(search.toLowerCase()) ||
      s.destination?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper
      title="E2 — Shipments"
      description="Warehouse operations view of every shipment."
      actions={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="ARRIVED">Arrived</option>
          <option value="DELAYED">Delayed</option>
        </select>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <input
              type="text"
              placeholder="Search shipment / origin / destination"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </motion.div>
          <ShipmentTable shipments={filtered} />
        </>
      )}
    </PageWrapper>
  );
}
