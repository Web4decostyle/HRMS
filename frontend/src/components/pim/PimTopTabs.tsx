import { NavLink } from "react-router-dom";

const pillBase =
  "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

const getClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? `${pillBase} bg-white text-green-600 shadow-sm`
    : `${pillBase} text-slate-600 hover:bg-white/60`;

export default function PimTopTabs() {
  const base = "/pim";

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-red-500 rounded-full px-2 py-1 shadow-md">
      <NavLink to={`${base}/config`} className={getClass}>
        Configuration
      </NavLink>
      <NavLink to={`${base}/employees`} className={getClass}>
        Employee List
      </NavLink>
      <NavLink to={`${base}/employees/add`} className={getClass}>
        Add Employee
      </NavLink>
      <NavLink to={`${base}/reports`} className={getClass}>
        Reports
      </NavLink>
    </div>
  );
}
