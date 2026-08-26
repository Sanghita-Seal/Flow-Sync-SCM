import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import YardDockPanel from "../../features/e2/yard/components/YardDockPanel";
import { getYards } from "../../features/e2/yard/yard.service";
import { getDocks } from "../../features/e2/docks/dock.service";

// Combined Yard + Docks view — each yard is a big card, with its own
// docks shown as a small grid inside it, instead of two sparse pages
// (only 2 yards and 8 docks total, so separate pages looked empty).
export default function YardDocks() {
  const [yards, setYards] = useState([]);
  const [docks, setDocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getYards(), getDocks()])
      .then(([yardsData, docksData]) => {
        setYards(yardsData);
        setDocks(docksData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="E2 — Yard & Docks" description="Yard occupancy and dock-level status, grouped by facility.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading yard and dock data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {yards.map((yard) => (
            <YardDockPanel
              key={yard.id}
              yard={yard}
              docks={docks.filter((d) => d.yardName === yard.name)}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
