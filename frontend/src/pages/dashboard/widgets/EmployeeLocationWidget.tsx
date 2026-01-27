import BaseWidget from "./BaseWidget";
import { useGetLocationDistributionQuery } from "../../../features/dashboard/dashboardApi";

function Donut({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <svg width="220" height="220" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} strokeWidth="26" stroke="#eef2ff" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={r}
        strokeWidth="26"
        stroke="#ff4d4f"
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <circle cx="70" cy="70" r="8" fill="#fff" />
      <text x="70" y="78" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">
        {p.toFixed(1)}%
      </text>
    </svg>
  );
}

export default function EmployeeLocationWidget() {
  const { data = [], isLoading } = useGetLocationDistributionQuery();

  const total = data.reduce((a, b) => a + b.value, 0);
  const top = data[0];
  const pct = total ? (top.value / total) * 100 : 0;

  return (
    <BaseWidget title="Employee Distribution by Location" icon="📍">
      {isLoading ? (
        <div className="text-xs text-slate-400">Loading…</div>
      ) : (
        <div className="flex flex-col items-center">
          <Donut percent={total ? pct : 100} />
          <div className="text-[11px] text-slate-500 flex items-center gap-2 -mt-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>{top?.label || "Unassigned"}</span>
          </div>
        </div>
      )}
    </BaseWidget>
  );
}
