// frontend/src/pages/dashboard/widgets/EmployeeSubunitWidget.tsx
import BaseWidget from "./BaseWidget";

const SUBUNITS = [
  { name: "HR", count: 5 },
  { name: "Sales", count: 12 },
  { name: "Engineering", count: 22 },
];

export default function EmployeeSubunitWidget() {
  const total = SUBUNITS.reduce((sum, s) => sum + s.count, 0);

  return (
    <BaseWidget title="Employee Distribution by Subunit" icon="🏢">
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <span>Total Employees</span>
          <span className="font-semibold text-slate-800">
            {total}
          </span>
        </div>
        <ul className="space-y-2">
          {SUBUNITS.map((subunit) => {
            const pct = total ? Math.round((subunit.count / total) * 100) : 0;
            return (
              <li key={subunit.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-700">{subunit.name}</span>
                  <span className="text-slate-500">
                    {subunit.count} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </BaseWidget>
  );
}
