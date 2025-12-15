import BaseWidget from "./BaseWidget";
import { useGetTimeAtWorkQuery } from "../../../features/dashboard/dashboardApi";

export default function EmployeeAttendanceWidget() {
  const { data, isLoading } = useGetTimeAtWorkQuery();

  const statusText =
    data?.status === "PUNCHED_IN" ? "Punched In" : "Punched Out";

  const punchedTime = data?.punchedAt
    ? new Date(data.punchedAt).toLocaleString()
    : "";

  const todayLabel = data ? `${Math.floor(data.todaySeconds / 3600)}h ${Math.floor((data.todaySeconds % 3600) / 60)}m Today` : "0h 0m Today";

  const week = data?.week ?? [
    { label: "Mon", seconds: 0 },
    { label: "Tue", seconds: 0 },
    { label: "Wed", seconds: 0 },
    { label: "Thu", seconds: 0 },
    { label: "Fri", seconds: 0 },
    { label: "Sat", seconds: 0 },
    { label: "Sun", seconds: 0 },
  ];

  const max = Math.max(1, ...week.map((d) => d.seconds));

  return (
    <BaseWidget title="Time at Work" icon="🕒">
      {isLoading ? (
        <div className="text-xs text-slate-400">Loading…</div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-orange-600">
                {statusText}
              </div>
              <div className="text-[11px] text-slate-400">
                {punchedTime ? `Punched ${data?.status === "PUNCHED_IN" ? "In" : "Out"}: ${punchedTime}` : ""}
              </div>

              <div className="mt-3 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] text-slate-600">
                {todayLabel}
              </div>
            </div>

            <button
              type="button"
              className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center"
              title="Punch"
            >
              ⏱️
            </button>
          </div>

          <div className="mt-4 text-[11px] text-slate-500">
            <div className="mb-2 font-semibold text-slate-600">This Week</div>

            <div className="flex items-end gap-3 h-28">
              {week.map((d) => {
                const h = Math.max(8, Math.round((d.seconds / max) * 100));
                return (
                  <div key={d.label} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 rounded-2xl bg-slate-100"
                      style={{ height: `${h}%` }}
                    />
                    <div className="text-[10px] text-slate-400">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </BaseWidget>
  );
}
