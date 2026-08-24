import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import ShipmentTable from "../../features/e2/shipments/components/ShipmentTable";
import { getShipments } from "../../features/e2/shipments/shipment.service";

// Renamed from "Deliveries" to match the backend's actual entity name.
export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipments().then(setShipments).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="E2 — Shipments" description="Warehouse operations view of every shipment.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading shipments...</div>
      ) : (
        <ShipmentTable shipments={shipments} />
      )}
    </PageWrapper>
  );
}
