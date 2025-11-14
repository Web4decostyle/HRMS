// frontend/src/pages/dashboard/widgets/EmployeeLocationWidget.tsx
import BaseWidget from "./BaseWidget";

const LOCATIONS = [
  { name: "Head Office", count: 20 },
  { name: "Branch A", count: 8 },
  { name: "Branch B", count: 11 },
];

export default function EmployeeLocationWidget() {
  const total = LOCATIONS.reduce((sum, l) => sum + l.count, 0);

  return (
    <BaseWidget title="Employee Distribution by Location" icon="📍">
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <span>Total Employees</span>
          <span className="font-semibold text-slate-800">
            {total}
          </span>
        </div>
        <ul className="space-y-1.5">
          {LOCATIONS.map((loc) => (
            <li
              key={loc.name}
              className="flex items-center justify-between"
            >
              <span className="text-slate-700">{loc.name}</span>
              <span className="text-slate-500">{loc.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </BaseWidget>
  );
}
