import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import YardStatusBoard from "../../features/e2/yard/components/YardStatusBoard";
import { getYards } from "../../features/e2/yard/yard.service";

export default function Yard() {
  const [yards, setYards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getYards().then(setYards).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="E2 — Yard" description="Zone-level occupancy across the facility.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading yards...</div>
      ) : (
        <YardStatusBoard yards={yards} />
      )}
    </PageWrapper>
  );
}
