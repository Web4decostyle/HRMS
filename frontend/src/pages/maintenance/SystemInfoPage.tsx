// frontend/src/pages/maintenance/SystemInfoPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetSystemInfoQuery } from "../../features/maintenance/maintenanceApi";

export default function SystemInfoPage() {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { maintenanceToken?: string } };
  const maintenanceToken = state?.maintenanceToken;

  const { data, error, isLoading } = useGetSystemInfoQuery(
    maintenanceToken ? { maintenanceToken } : skipToken
  );

  useEffect(() => {
    const status = (error as any)?.status;
    if (!maintenanceToken || status === 401 || status === 403) {
      nav("/maintenance/auth?scope=system-info&next=/maintenance/system-info", {
        replace: true,
      });
    }
  }, [maintenanceToken, error, nav]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Maintenance · System Info
      </h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs">
        {isLoading ? (
          <div className="text-slate-400">Loading system info...</div>
        ) : data ? (
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="text-slate-400">No data</div>
        )}
      </section>
    </div>
  );
}
