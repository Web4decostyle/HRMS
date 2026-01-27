// frontend/src/pages/time/MyTimesheetsPage.tsx
import { FormEvent, useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import {
  useGetMyTimesheetsQuery,
  useCreateTimesheetMutation,
} from "../../features/time/timeApi";

/** -------- Time module top tabs (Timesheets / Attendance / Reports / Project Info) -------- */

type MenuKey = "timesheets" | "attendance" | "reports" | "projects";

const pillBase =
  "inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

const dropdownItemClasses =
  "block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-green-50";

const TimeTopTabs: React.FC = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
        { label: "Punch In/Out", to: "/time/attendance/punch-in" },
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

  // Close dropdowns when clicking outside the red bar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4" ref={wrapperRef}>
      <div className="inline-flex gap-2 bg-green-500/90 rounded-full px-2 py-1 shadow-sm">
        {menus.map((menu) => {
          const isGroupActive = menu.items.some((item) =>
            location.pathname.startsWith(item.to)
          );

          const pillClasses = isGroupActive
            ? `${pillBase} bg-white text-green-600 shadow-sm`
            : `${pillBase} text-white/90 hover:bg-white/60 hover:text-green-700`;

          const isOpen = openMenu === menu.key;

          return (
            <div key={menu.key} className="relative">
              <button
                type="button"
                className={pillClasses}
                onClick={() =>
                  setOpenMenu((prev) =>
                    prev === menu.key ? null : menu.key
                  )
                }
              >
                <span>{menu.label}</span>
                <FiChevronDown
                  className={`text-[10px] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1">
                  {menu.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenMenu(null)} // close on select
                      className={({ isActive }) =>
                        isActive
                          ? `${dropdownItemClasses} bg-green-50 font-semibold text-green-600`
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

/** ---------------------------- My Timesheets page content ---------------------------- */

export default function MyTimesheetsPage() {
  const { data: timesheets = [], isLoading } = useGetMyTimesheetsQuery();
  const [createTimesheet, { isLoading: creating }] =
    useCreateTimesheetMutation();

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;

    await createTimesheet({
      periodStart,
      periodEnd,
      entries: [],
    }).unwrap();

    setPeriodStart("");
    setPeriodEnd("");
  }

  return (
    <div className="space-y-6">
      <TimeTopTabs />

      {/* Page heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">My Timesheets</h2>
        <p className="text-sm text-slate-500">
          View and create timesheets for your work periods.
        </p>
      </div>

      {/* Card: create new timesheet / select period */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Select Timesheet Period
        </h3>

        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Period Start
            </label>
            <input
              type="date"
              className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Period End
            </label>
            <input
              type="date"
              className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          <button
            disabled={creating}
            className="px-4 py-2 rounded-full bg-lime-500 text-white text-xs font-semibold hover:bg-lime-600 disabled:opacity-50"
          >
            {creating ? "Creating..." : "View / Create Timesheet"}
          </button>
        </form>

        <p className="text-[11px] text-slate-400">* Required</p>
      </section>

      {/* Card: timesheets list */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            My Timesheets
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Timesheet Period</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Entries</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={3}>
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading && timesheets.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={3}>
                  No timesheets yet.
                </td>
              </tr>
            )}

            {timesheets.map((t: any) => (
              <tr key={t._id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  {t.periodStart?.slice(0, 10)} – {t.periodEnd?.slice(0, 10)}
                </td>
                <td className="px-4 py-2 text-xs uppercase text-slate-600">
                  {t.status}
                </td>
                <td className="px-4 py-2 text-xs">{t.entries?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
