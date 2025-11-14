// frontend/src/pages/maintenance/SystemInfoPage.tsx
import { useGetSystemInfoQuery } from "../../features/maintenance/maintenanceApi";

export default function SystemInfoPage() {
  const { data } = useGetSystemInfoQuery();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Maintenance · System Info
      </h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs">
        {data ? (
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Node:</span> {data.nodeVersion}
            </div>
            <div>
              <span className="font-semibold">Platform:</span> {data.platform}
            </div>
            <div>
              <span className="font-semibold">Uptime:</span>{" "}
              {Math.round(data.uptimeSeconds / 60)} minutes
            </div>
          </div>
        ) : (
          <div className="text-slate-400">Loading system info...</div>
        )}
      </section>
    </div>
  );
}
