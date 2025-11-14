// frontend/src/pages/dashboard/widgets/MyActionSummaryWidget.tsx
import BaseWidget from "./BaseWidget";

export default function MyActionSummaryWidget() {
  const items = [
    { label: "Pending Leave Requests", value: 4 },
    { label: "Candidate to Interview", value: 2 },
    { label: "Timesheets to Approve", value: 3 },
  ];

  return (
    <BaseWidget title="My Actions" icon="📌" empty={items.length === 0}>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between py-2"
          >
            <span className="text-xs text-slate-600">
              {item.label}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-800">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </BaseWidget>
  );
}
