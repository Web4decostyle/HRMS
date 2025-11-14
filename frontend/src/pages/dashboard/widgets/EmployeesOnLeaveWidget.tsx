// frontend/src/pages/dashboard/widgets/EmployeesOnLeaveWidget.tsx
import BaseWidget from "./BaseWidget";

const EMPLOYEES_ON_LEAVE = [
  { name: "John Smith", type: "Annual", period: "Today" },
  { name: "Jane Doe", type: "Sick", period: "Today" },
];

export default function EmployeesOnLeaveWidget() {
  const empty = EMPLOYEES_ON_LEAVE.length === 0;

  return (
    <BaseWidget
      title="Employees on Leave Today"
      icon="🌴"
      empty={empty}
      emptyText="No employees are on leave today."
    >
      <ul className="divide-y divide-slate-100">
        {EMPLOYEES_ON_LEAVE.map((emp) => (
          <li
            key={emp.name}
            className="flex items-center justify-between py-2 text-xs"
          >
            <div className="flex flex-col">
              <span className="font-medium text-slate-800">
                {emp.name}
              </span>
              <span className="text-slate-500">
                {emp.type} · {emp.period}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </BaseWidget>
  );
}
