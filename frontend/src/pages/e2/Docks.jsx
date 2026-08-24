import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import DockStatusBoard from "../../features/e2/docks/components/DockStatusBoard";
import { getDocks } from "../../features/e2/docks/dock.service";

export default function Docks() {
  const [docks, setDocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocks().then(setDocks).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="E2 — Docks" description="Dock availability across all yards.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading docks...</div>
      ) : (
        <DockStatusBoard docks={docks} />
      )}
    </PageWrapper>
  );
}
