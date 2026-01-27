import { useMemo, useState } from "react";
import MaintenanceTabs from "../../components/maintenance/MaintenanceTabs";
import Typeahead from "../../components/maintenance/Typeahead";
import { useMaintenancePage } from "../../components/maintenance/useMaintenancePage";
import { useVacancyHintsQuery } from "../../features/maintenance/maintenanceApi";

export default function PurgeCandidateRecordsPage() {
  const { maintenanceToken } = useMaintenancePage(
    "purge-candidate",
    "/maintenance/purge-candidate-records"
  );

  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<{ id: string; label: string } | null>(
    null
  );

  const shouldSearch = useMemo(
    () => Boolean(maintenanceToken) && q.trim().length >= 1,
    [maintenanceToken, q]
  );

  const { data: hints = [], isFetching } = useVacancyHintsQuery(
    shouldSearch ? { q, maintenanceToken: maintenanceToken! } : (undefined as any),
    { skip: !shouldSearch }
  );

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        Maintenance / <span className="text-slate-700">Purge Records</span>
      </div>

      <MaintenanceTabs />

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Purge Candidate Records
        </h2>

        <div className="mt-5 max-w-md">
          <Typeahead
            label="Vacancy"
            required
            value={q}
            onChange={(v) => {
              setQ(v);
              setPicked(null);
            }}
            hints={hints}
            isLoading={isFetching}
            onPick={(it) => {
              setPicked(it);
              setQ(it.label);
            }}
          />
          <div className="text-xs text-slate-500 mt-2">* Required</div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="h-10 px-8 rounded-full bg-red-600 text-white font-semibold disabled:opacity-60"
            disabled={!picked}
            onClick={() => {
              // PART 2 backend: call purge candidate endpoint here
              alert(`Will purge candidates for vacancy: ${picked?.label}`);
            }}
          >
            Search
          </button>
        </div>
      </section>

      <section className="bg-slate-200/60 rounded-2xl p-5 text-sm text-slate-600">
        <div className="font-semibold mb-2">Note</div>
        <div className="leading-relaxed">
          Users who seek access to their data, or who seek to correct, amend, or
          delete the given information should direct their requests to your data
          team.
        </div>
      </section>
    </div>
  );
}
