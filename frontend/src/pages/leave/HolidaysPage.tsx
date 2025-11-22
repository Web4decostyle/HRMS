// frontend/src/pages/leave/HolidaysPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} from "../../features/leave/leaveApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const selectCls = inputCls;

type MenuKey = "entitlements" | "reports" | "configure" | null;

/* ---------- Typed tab definitions so TS knows who has `path` ---------- */

type BaseTab = {
  key: string;
  label: string;
};

type NavTab = BaseTab & {
  path: string;
};

type MenuTab = BaseTab & {
  key: Exclude<MenuKey, null>;
  isMenu: true;
  menu: { label: string; path: string }[];
};

const TABS: readonly (NavTab | MenuTab)[] = [
  { key: "apply", label: "Apply", path: "/leave/apply" },
  { key: "my-leave", label: "My Leave", path: "/leave/my-leave" },
  {
    key: "entitlements",
    label: "Entitlements",
    isMenu: true,
    menu: [
      { label: "Add Entitlements", path: "/leave/entitlements/add" },
      { label: "Employee Entitlements", path: "/leave/entitlements/employee" },
      { label: "My Entitlements", path: "/leave/entitlements/my" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    isMenu: true,
    menu: [
      {
        label: "Leave Entitlements and Usage Report",
        path: "/leave/reports/entitlements-usage",
      },
      {
        label: "My Leave Entitlements and Usage Report",
        path: "/leave/reports/my-entitlements-usage",
      },
    ],
  },
  {
    key: "configure",
    label: "Configure",
    isMenu: true,
    menu: [
      { label: "Leave Period", path: "/leave/config/period" },
      { label: "Leave Types", path: "/leave/config/types" },
      { label: "Work Week", path: "/leave/config/work-week" },
      { label: "Holidays", path: "/leave/config/holidays" },
    ],
  },
  { key: "leave-list", label: "Leave List", path: "/leave/list" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
] as const;

const activeTabKey = "configure";

export default function HolidaysPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const [fromDate, setFromDate] = useState(today.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(nextYear.toISOString().slice(0, 10));
  const [filters, setFilters] = useState<{ from?: string; to?: string }>({
    from: fromDate,
    to: toDate,
  });

  const { data: holidays = [], isLoading } = useGetHolidaysQuery(filters);
  const [createHoliday, { isLoading: isCreating }] =
    useCreateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [repeatsAnnually, setRepeatsAnnually] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleReset() {
    const from = today.toISOString().slice(0, 10);
    const to = nextYear.toISOString().slice(0, 10);
    setFromDate(from);
    setToDate(to);
    setFilters({ from, to });
  }

  function handleSearch() {
    setFilters({
      from: fromDate,
      to: toDate,
    });
  }

  async function handleAddHoliday() {
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }
    try {
      await createHoliday({
        name: name.trim(),
        date,
        isHalfDay,
        repeatsAnnually,
      }).unwrap();
      setName("");
      setDate(today.toISOString().slice(0, 10));
      setIsHalfDay(false);
      setRepeatsAnnually(false);
      setIsAdding(false);
    } catch (e: any) {
      setError(e?.data?.message || "Failed to create holiday.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await deleteHoliday({ id }).unwrap();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="h-full bg-[#f5f6fa] px-6 py-4 overflow-y-auto">
      {/* Top nav */}
      <div className="flex items-center gap-2 mb-4">
        {TABS.map((tab) => {
          const isMenuTab = "isMenu" in tab;
          const menuItems = isMenuTab ? tab.menu : undefined;
          const isActive =
            tab.key === activeTabKey && tab.label === "Configure";

          return (
            <div key={tab.key} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isMenuTab && menuItems) {
                    setOpenMenu((prev) =>
                      prev === tab.key ? null : (tab.key as MenuKey)
                    );
                  } else {
                    // here tab is NavTab, so path definitely exists
                    navigate((tab as NavTab).path);
                  }
                }}
                className={[
                  "px-5 h-9 rounded-full text-[12px] border transition flex items-center",
                  isActive
                    ? "bg-[#fef4ea] border-[#f7941d] text-[#f7941d] font-semibold"
                    : "bg-white border-[#e5e7f0] text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                {isMenuTab && (
                  <span className="ml-1 text-[10px] align-middle">▼</span>
                )}
              </button>

              {isMenuTab && openMenu === tab.key && menuItems && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#e5e7f0] shadow-lg z-20 text-[12px]">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#fef4ea] hover:text-[#f7941d]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-5">
        <div className="px-7 py-4 border-b border-[#edf0f7]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Holidays
          </h2>
        </div>

        <div className="px-7 pt-5 pb-4 text-[12px]">
          <div className="grid grid-cols-4 gap-6 items-end">
            <div>
              <label className={labelCls}>From</label>
              <input
                type="date"
                className={inputCls}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>To</label>
              <input
                type="date"
                className={inputCls}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 h-8 rounded-full border border-[#8bc34a] text-[12px] text-[#8bc34a] bg-white hover:bg-[#f4fbec]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7] flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-slate-800">
            Holidays
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsAdding((v) => !v);
              setError(null);
            }}
            className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>

        <div className="px-7 pt-3 pb-6 text-[12px]">
          {isAdding && (
            <div className="mb-4 border border-[#e3e5f0] rounded-lg px-4 py-3 bg-[#f9fafb]">
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <label className={labelCls}>Name*</label>
                  <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Date*</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Full Day / Half Day*</label>
                  <select
                    className={selectCls}
                    value={isHalfDay ? "HALF" : "FULL"}
                    onChange={(e) => setIsHalfDay(e.target.value === "HALF")}
                  >
                    <option value="FULL">Full Day</option>
                    <option value="HALF">Half Day</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input
                    type="checkbox"
                    id="repeats"
                    className="w-4 h-4"
                    checked={repeatsAnnually}
                    onChange={(e) => setRepeatsAnnually(e.target.checked)}
                  />
                  <label
                    htmlFor="repeats"
                    className="text-[11px] text-slate-600"
                  >
                    Repeats Annually
                  </label>
                </div>
              </div>
              {error && (
                <p className="text-[11px] text-rose-600 mb-2">{error}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setError(null);
                  }}
                  className="px-4 h-8 rounded-full border border-[#e5e7f0] text-[12px] text-slate-600 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  disabled={isCreating}
                  className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px] text-slate-700">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 w-10">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Full Day/ Half Day
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Repeats Annually
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : holidays.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  holidays.map((h) => (
                    <tr key={h._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">
                        <input type="checkbox" />
                      </td>
                      <td className="px-3 py-2">{h.name}</td>
                      <td className="px-3 py-2">{h.date.slice(0, 10)}</td>
                      <td className="px-3 py-2">
                        {h.isHalfDay ? "Half Day" : "Full Day"}
                      </td>
                      <td className="px-3 py-2">
                        {h.repeatsAnnually ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(h._id)}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
