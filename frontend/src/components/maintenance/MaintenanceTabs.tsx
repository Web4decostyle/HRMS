import { NavLink } from "react-router-dom";

const pillBase =
  "inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold border transition";
const activePill =
  "bg-green-50 border-green-200 text-green-700";
const idlePill =
  "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";

export default function MaintenanceTabs() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <NavLink
          to="/maintenance/purge-records"
          className={({ isActive }) =>
            `${pillBase} ${isActive ? activePill : idlePill}`
          }
        >
          Purge Records
        </NavLink>
      </div>

      <div className="relative">
        <NavLink
          to="/maintenance/purge-candidate-records"
          className={({ isActive }) =>
            `${pillBase} ${isActive ? activePill : idlePill}`
          }
        >
          Purge Candidate Records
        </NavLink>
      </div>

      <NavLink
        to="/maintenance/access-records"
        className={({ isActive }) =>
          `${pillBase} ${isActive ? activePill : idlePill}`
        }
      >
        Access Records
      </NavLink>
    </div>
  );
}
