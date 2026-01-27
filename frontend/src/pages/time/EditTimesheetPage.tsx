import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiChevronDown,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlusCircle,
} from "react-icons/fi";
import {
  useGetTimesheetQuery,
  useUpdateTimesheetEntriesMutation,
  TimesheetEntry,
  Timesheet,
} from "../../features/time/timeApi";

/* ---------- Top tabs (same as other Time pages) ---------- */

type MenuKey = "timesheets" | "attendance" | "reports" | "projects";

const pillBase =
  "inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

const dropdownItemClasses =
  "block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-green-50";

const TimeTopTabs: React.FC = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  const menus: {
    key: MenuKey;
    label: string;
    items: { label: string; to: string }[];
  }[] = useMemo(
    () => [
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
          {
            label: "Employee Records",
            to: "/time/attendance/employee-records",
          },
          { label: "Configuration", to: "/time/attendance/config" },
        ],
      },
      {
        key: "reports",
        label: "Reports",
        items: [
          { label: "Project Reports", to: "/time/reports/projects" },
          { label: "Employee Reports", to: "/time/reports/employees" },
          {
            label: "Attendance Summary",
            to: "/time/reports/attendance-summary",
          },
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
    ],
    []
  );

  return (
    <div className="mb-4">
      <div className="inline-flex gap-2 bg-green-500/90 rounded-full px-2 py-1 shadow-sm">
        {menus.map((menu) => {
          const isGroupActive = menu.items.some((item) =>
            location.pathname.startsWith(item.to)
          );

          const pillClasses = isGroupActive
            ? `${pillBase} bg-white text-green-600 shadow-sm`
            : `${pillBase} text-white/90 hover:bg-white/60 hover:text-green-700`;

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

/* ---------- Edit page ---------- */

const days = [
  { label: "1", day: "Mon" },
  { label: "2", day: "Tue" },
  { label: "3", day: "Wed" },
  { label: "4", day: "Thu" },
  { label: "5", day: "Fri" },
  { label: "6", day: "Sat" },
  { label: "7", day: "Sun" },
];

interface EditableRow {
  clientId: string; // local id for React key
  project: string;
  task: string;
  hours: string[]; // length 7, string for inputs
}

/** helper: build rows from API timesheet */
function buildRowsFromTimesheet(ts: Timesheet): EditableRow[] {
  const start = new Date(ts.periodStart);
  const rowsMap: Record<string, EditableRow> = {};

  ts.entries.forEach((entry) => {
    const key = `${entry.project || ""}__${entry.task || ""}`;

    if (!rowsMap[key]) {
      rowsMap[key] = {
        clientId: key || `row-${Object.keys(rowsMap).length}`,
        project: entry.project || "",
        task: entry.task || "",
        hours: Array(7).fill(""),
      };
    }

    const row = rowsMap[key];

    const entryDate = new Date(entry.date);
    const diffMs = entryDate.getTime() - start.getTime();
    const dayIndex = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (dayIndex < 0 || dayIndex > 6) return;

    const existing = row.hours[dayIndex];
    const sum = (Number(existing || 0) + (entry.hours || 0)).toString();
    row.hours[dayIndex] = sum;
  });

  const result = Object.values(rowsMap);
  if (result.length === 0) {
    result.push({
      clientId: "row-0",
      project: "",
      task: "",
      hours: Array(7).fill(""),
    });
  }
  return result;
}

export default function EditTimesheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: timesheet, isLoading } = useGetTimesheetQuery(id!, {
    skip: !id,
  });

  const [updateEntries, { isLoading: saving }] =
    useUpdateTimesheetEntriesMutation();

  const [rows, setRows] = useState<EditableRow[]>([]);

  // initial load from API
  useEffect(() => {
    if (!timesheet) return;
    setRows(buildRowsFromTimesheet(timesheet));
  }, [timesheet]);

  const periodLabel =
    timesheet &&
    `${timesheet.periodStart.slice(0, 10)} - ${timesheet.periodEnd.slice(
      0,
      10
    )}`;

  function handleChangeRow(
    clientId: string,
    field: "project" | "task",
    value: string
  ) {
    setRows((prev) =>
      prev.map((r) => (r.clientId === clientId ? { ...r, [field]: value } : r))
    );
  }

  function handleChangeHour(clientId: string, dayIndex: number, value: string) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      // only allow numbers and dot
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.clientId === clientId
          ? {
              ...r,
              hours: r.hours.map((h, i) => (i === dayIndex ? value : h)),
            }
          : r
      )
    );
  }

  function handleAddRow() {
    setRows((prev) => [
      ...prev,
      {
        clientId: `row-${Date.now()}`,
        project: "",
        task: "",
        hours: Array(7).fill(""),
      },
    ]);
  }

  function handleDeleteRow(clientId: string) {
    setRows((prev) => prev.filter((r) => r.clientId !== clientId));
  }

  function handleReset() {
    if (!timesheet) return;
    setRows(buildRowsFromTimesheet(timesheet));
  }

  async function handleSave() {
    if (!id || !timesheet) return;

    const start = new Date(timesheet.periodStart);
    const payloadEntries: TimesheetEntry[] = [];

    rows
      // drop fully empty rows
      .filter(
        (r) =>
          r.project.trim() ||
          r.task.trim() ||
          r.hours.some((h) => h && h.trim() !== "")
      )
      .forEach((row) => {
        days.forEach((_, dayIndex) => {
          const raw = row.hours[dayIndex];
          if (!raw || !raw.trim()) return;

          const hours = Number(raw);
          if (!hours || hours <= 0) return;

          const date = new Date(start);
          date.setDate(start.getDate() + dayIndex);

          payloadEntries.push({
            date: date.toISOString(), // backend just expects string
            project: row.project.trim() || undefined,
            task: row.task.trim() || undefined,
            hours,
          });
        });
      });

    await updateEntries({ id, entries: payloadEntries }).unwrap();
    navigate(-1); // back to view page
  }

  return (
    <div className="space-y-6">
      <TimeTopTabs />

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800">
              Edit Timesheet
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium">Timesheet Period</span>
            <span className="text-slate-700">{periodLabel}</span>

            {/* Arrows (UI only here) */}
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronLeft className="text-slate-500" />
            </button>
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronRight className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table-like rows */}
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-3 py-3 text-left font-medium">Project</th>
                  <th className="px-3 py-3 text-left font-medium">Activity</th>
                  {days.map((d) => (
                    <th
                      key={d.day}
                      className="px-2 py-3 text-center font-medium"
                    >
                      <div>{d.label}</div>
                      <div className="text-[10px] uppercase tracking-wide">
                        {d.day}
                      </div>
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={days.length + 3}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  rows.map((row) => (
                    <tr
                      key={row.clientId}
                      className="border-t border-slate-100"
                    >
                      {/* Project input */}
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          placeholder="Type for hints..."
                          value={row.project}
                          onChange={(e) =>
                            handleChangeRow(
                              row.clientId,
                              "project",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>

                      {/* Activity (task) select */}
                      <td className="px-3 py-3">
                        <select
                          value={row.task}
                          onChange={(e) =>
                            handleChangeRow(
                              row.clientId,
                              "task",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="">-- Select --</option>
                          <option value="Development">Development</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Support">Support</option>
                        </select>
                      </td>

                      {/* Hours inputs */}
                      {days.map((_, dayIndex) => (
                        <td key={dayIndex} className="px-2 py-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.hours[dayIndex] || ""}
                            onChange={(e) =>
                              handleChangeHour(
                                row.clientId,
                                dayIndex,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                      ))}

                      {/* Trash */}
                      <td className="px-2 py-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.clientId)}
                          className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-green-600"
          >
            <FiPlusCircle className="text-slate-400" />
            <span>Add Row</span>
          </button>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-1.5 rounded-full border border-lime-400 text-xs font-semibold text-lime-500 bg-white hover:bg-lime-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-1.5 rounded-full border border-lime-400 text-xs font-semibold text-lime-500 bg-white hover:bg-lime-50"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-1.5 rounded-full bg-lime-500 text-xs font-semibold text-white hover:bg-lime-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>
    </div>
  );
}
