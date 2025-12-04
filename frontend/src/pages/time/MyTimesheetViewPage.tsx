import { useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

/* ------------------------------------------------------------------
 * Time module top tabs (same look as other Time pages)
 * ------------------------------------------------------------------ */

type MenuKey = "timesheets" | "attendance" | "reports" | "projects";

const pillBase =
  "inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

const dropdownItemClasses =
  "block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50";

const TimeTopTabs: React.FC = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  const menus: {
    key: MenuKey;
    label: string;
    items: { label: string; to: string }[];
  }[] = [
    {
      key: "timesheets",
      label: "Timesheets",
      items: [
        { label: "My Timesheets", to: "/time/timesheets/my" },
        { label: "Employee Timesheets", to: "/time/timesheets/employee" },
      ],
    },
    {
      key: "attendance",
      label: "Attendance",
      items: [
        { label: "My Records", to: "/time/attendance/my-records" },
        { label: "Punch In/Out", to: "/time/attendance/punch" },
        { label: "Employee Records", to: "/time/attendance/employee-records" },
        { label: "Configuration", to: "/time/attendance/config" },
      ],
    },
    {
      key: "reports",
      label: "Reports",
      items: [
        { label: "Project Reports", to: "/time/reports/projects" },
        { label: "Employee Reports", to: "/time/reports/employees" },
        { label: "Attendance Summary", to: "/time/reports/attendance-summary" },
      ],
    },
    {
      key: "projects",
      label: "Project Info",
      items: [
        { label: "Customers", to: "/time/project-info/customers" },
        { label: "Projects", to: "/time/project-info/projects" },
      ],
    },
  ];

  return (
    <div className="mb-4">
      <div className="inline-flex gap-2 bg-orange-500/90 rounded-full px-2 py-1 shadow-sm">
        {menus.map((menu) => {
          const isGroupActive = menu.items.some((item) =>
            location.pathname.startsWith(item.to)
          );

          const pillClasses = isGroupActive
            ? `${pillBase} bg-white text-orange-600 shadow-sm`
            : `${pillBase} text-white/90 hover:bg-white/60 hover:text-orange-700`;

          return (
            <div
              key={menu.key}
              className="relative"
              onMouseEnter={() => setOpenMenu(menu.key)}
              onMouseLeave={() =>
                setOpenMenu((prev) => (prev === menu.key ? null : prev))
              }
            >
              <button type="button" className={pillClasses}>
                <span>{menu.label}</span>
                <FiChevronDown className="text-[10px]" />
              </button>

              {openMenu === menu.key && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1">
                  {menu.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        isActive
                          ? `${dropdownItemClasses} bg-orange-50 font-semibold text-orange-600`
                          : dropdownItemClasses
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
 * My Timesheet view (UI clone of the screenshot)
 * ------------------------------------------------------------------ */

const days = [
  { label: "1", day: "Mon" },
  { label: "2", day: "Tue" },
  { label: "3", day: "Wed" },
  { label: "4", day: "Thu" },
  { label: "5", day: "Fri" },
  { label: "6", day: "Sat" },
  { label: "7", day: "Sun" },
];

export default function MyTimesheetViewPage() {
  // hooks MUST be inside component
  const { id } = useParams<{ id: string }>(); // route: /time/timesheets/:id
  const navigate = useNavigate();

  // for now this is static; later you can update from API
  const [periodLabel] = useState("2025-12-01 to 2025-12-07");

  return (
    <div className="space-y-6">
      {/* OrangeHRM-style module top bar */}
      <TimeTopTabs />

      {/* Timesheet card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800">
              My Timesheet
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium">Timesheet Period</span>

            {/* Period selector pill */}
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-white">
              <FiCalendar className="text-slate-400" />
              <span>{periodLabel}</span>
            </button>

            {/* Left / right arrows */}
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronLeft className="text-slate-500" />
            </button>
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronRight className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-left font-medium">Project</th>
                <th className="px-3 py-3 text-left font-medium">Activity</th>
                {days.map((d) => (
                  <th
                    key={d.day}
                    className="px-3 py-3 text-center font-medium"
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] uppercase tracking-wide">
                      {d.day}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* No records row */}
              <tr>
                <td
                  className="px-6 py-6 text-xs text-slate-400 border-t border-slate-100"
                  colSpan={days.length + 3}
                >
                  No Records Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer: status + buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            <span className="font-semibold">Status:</span>{" "}
            <span>Not Submitted</span>
          </div>

          <div className="flex gap-3">
            <button
              className="px-6 py-1.5 rounded-full border border-lime-500 text-xs font-semibold text-lime-600 bg-white hover:bg-lime-50"
              onClick={() => id && navigate(`/time/timesheets/${id}/edit`)}
            >
              Edit
            </button>
            <button className="px-6 py-1.5 rounded-full bg-lime-500 text-xs font-semibold text-white hover:bg-lime-600">
              Submit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
