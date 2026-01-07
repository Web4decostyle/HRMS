import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Candidates", to: "/recruitment/candidates" },
  { label: "Vacancies", to: "/recruitment/vacancies" },
  { label: "Interviews", to: "/recruitment/interviews" },
];

export default function RecruitmentTopTabs() {
  return (
    <div className="flex gap-2 border-b border-slate-200 mb-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `px-4 py-2 text-sm rounded-t-md transition ${
              isActive
                ? "bg-white border border-b-0 border-slate-200 font-semibold"
                : "text-slate-500 hover:text-slate-700"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
