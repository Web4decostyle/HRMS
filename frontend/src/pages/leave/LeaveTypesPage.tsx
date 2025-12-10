import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} from "../../features/leave/leaveApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "h-8 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

type MenuKey = "entitlements" | "reports" | "configure" | null;

/* ------- Properly typed tabs so TS knows who has `path` ------- */
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
  { key: "leave-list", label: "Leave List", path: "/leave" },
  { key: "assign-leave", label: "Assign Leave", path: "/leave/assign" },
] as const;

const activeTabKey = "configure";

export default function LeaveTypesPage() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  const { data: leaveTypes = [], isLoading } = useGetLeaveTypesQuery();
  const [createLeaveType, { isLoading: isCreating }] =
    useCreateLeaveTypeMutation();
  const [deleteLeaveType] = useDeleteLeaveTypeMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    if (!newName.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      await createLeaveType({ name: newName.trim() }).unwrap();
      setNewName("");
      setIsAdding(false);
    } catch (e: any) {
      setError(e?.data?.message || "Failed to create leave type.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this leave type?")) return;
    try {
      await deleteLeaveType({ id }).unwrap();
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
                    // here tab is `NavTab`, so `path` definitely exists
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

      {/* Card */}
      <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm mb-8">
        <div className="px-7 py-4 border-b border-[#edf0f7] flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Leave Types
          </h2>
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
            <div className="mb-4">
              <label className={labelCls}>Name*</label>
              <div className="flex gap-3 items-center">
                <input
                  className={inputCls + " flex-1"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isCreating}
                  className="px-4 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setError(null);
                  }}
                  className="px-4 h-8 rounded-full border border-[#e5e7f0] text-[12px] text-slate-600 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              {error && (
                <p className="mt-1 text-[11px] text-rose-600">{error}</p>
              )}
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
                  <th className="px-3 py-2 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : leaveTypes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  leaveTypes.map((t) => (
                    <tr key={t._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">
                        <input type="checkbox" />
                      </td>
                      <td className="px-3 py-2">{t.name}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id)}
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
