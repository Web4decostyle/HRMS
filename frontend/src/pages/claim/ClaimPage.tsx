// frontend/src/pages/claim/ClaimPage.tsx
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import type { Role } from "../../features/auth/authSlice";

/* ----------------- CONFIG: events & expense types ----------------- */
import {
  ClaimEvent,
  ExpenseType,
  useGetClaimEventsQuery,
  useCreateClaimEventMutation,
  useUpdateClaimEventMutation,
  useDeleteClaimEventMutation,
  useGetExpenseTypesQuery,
  useCreateExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
} from "../../features/claim/claimConfigApi";

/* ---------------------- CLAIMS: requests etc ---------------------- */
import {
  Claim,
  EmployeeClaim,
  MyClaimsFilter,
  EmployeeClaimsFilter,
  useSubmitClaimMutation,
  useGetMyClaimsQuery,
  useGetEmployeeClaimsQuery,
  useAssignClaimMutation,
} from "../../features/claim/claimApi";

/* -------------------- Employees (for assign tab) ------------------ */
import {
  useGetEmployeesSimpleQuery,
  SimpleEmployee,
} from "../../features/employees/employeesApi"; // must return [{ _id, fullName }]

/* ========================= TYPES ========================= */
type Tab = "config" | "submit" | "myclaims" | "employee" | "assign";
type ConfigView = "events" | "expenses";

const CURRENCIES = ["INR", "USD", "EUR"];

/* ========================= AUTH ========================= */
function selectRole(state: any): Role {
  return (state?.auth?.user?.role as Role) ?? "ESS";
}

/* ========================= TOPBAR ========================= */
function ClaimRequestsTopBar(props: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  canSeeAdminTabs: boolean;

  configView: ConfigView;
  setConfigView: (v: ConfigView) => void;

  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    activeTab,
    setActiveTab,
    canSeeAdminTabs,
    configView,
    setConfigView,
    open,
    setOpen,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const timeWrapperRef = React.useRef<HTMLDivElement | null>(null);

  const [timeOpen, setTimeOpen] = useState(false);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }

      if (timeWrapperRef.current && !timeWrapperRef.current.contains(target)) {
        setTimeOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [setOpen]);

  const menuItems: {
    key: Tab;
    label: string;
    adminOnly?: boolean;
    onClick?: () => void;
  }[] = [
    {
      key: "submit",
      label: "Submit Claim",
      onClick: () => setActiveTab("submit"),
    },
    {
      key: "myclaims",
      label: "My Claims",
      onClick: () => setActiveTab("myclaims"),
    },
    {
      key: "employee",
      label: "Employee Claims",
      adminOnly: true,
      onClick: () => setActiveTab("employee"),
    },
    {
      key: "assign",
      label: "Assign Claim",
      adminOnly: true,
      onClick: () => setActiveTab("assign"),
    },
    {
      key: "config",
      label: "Config: Events",
      adminOnly: true,
      onClick: () => {
        setActiveTab("config");
        setConfigView("events");
      },
    },
    {
      key: "config",
      label: "Config: Expense Types",
      adminOnly: true,
      onClick: () => {
        setActiveTab("config");
        setConfigView("expenses");
      },
    },
  ];

  const visibleItems = menuItems.filter((it) =>
    it.adminOnly ? canSeeAdminTabs : true
  );

  const activeLabel = (() => {
    if (activeTab === "config") {
      return configView === "events"
        ? "Config: Events"
        : "Config: Expense Types";
    }
    const found = visibleItems.find((x) => x.key === activeTab);
    return found?.label ?? "Submit Claim";
  })();

  const shortcutBtn =
    "px-5 py-2 rounded-full text-sm font-medium transition shadow-sm";
  const shortcutBtnActive =
    "bg-white text-green-700 border border-green-200";
  const shortcutBtnIdle =
    "bg-green-500 text-white hover:bg-green-600 border border-green-500";

  const timeItems = [
    {
      label: "Punch-In",
      onClick: () => {
        navigate("/time/attendance/punch-in");
        setTimeOpen(false);
      },
      active: location.pathname === "/time/attendance/punch-in",
      disabled: false,
    },
    {
      label: "Punch-Out",
      onClick: () => {
        navigate("/time/attendance/punch-in");
        setTimeOpen(false);
      },
      active: location.pathname === "/time/attendance/punch-in",
      disabled: false,
    },
    {
      label: "Redline",
      onClick: () => {},
      active: false,
      disabled: true,
    },
    {
      label: "LIH",
      onClick: () => {},
      active: false,
      disabled: true,
    },
    {
      label: "Early Leaving",
      onClick: () => {},
      active: false,
      disabled: true,
    },
    {
      label: "Out Duty",
      onClick: () => {},
      active: false,
      disabled: true,
    },
  ];

  const isMyInfoActive = location.pathname.startsWith("/my-info");
  const isLeaveActive = location.pathname.startsWith("/leave");
  const isTimeActive = location.pathname.startsWith("/time");

  return (
    <div className="bg-white px-8 py-3 shadow-sm flex flex-wrap items-center gap-4 relative">
      {/* My-Info */}
      <button
        type="button"
        onClick={() => navigate("/my-info")}
        className={`${shortcutBtn} ${
          isMyInfoActive ? shortcutBtnActive : shortcutBtnIdle
        }`}
      >
        My-Info
      </button>

      {/* Leave */}
      <button
        type="button"
        onClick={() => navigate("/leave")}
        className={`${shortcutBtn} ${
          isLeaveActive ? shortcutBtnActive : shortcutBtnIdle
        }`}
      >
        Leave
      </button>

      {/* Time dropdown */}
      <div ref={timeWrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setTimeOpen((v) => !v)}
          className={`${shortcutBtn} flex items-center gap-2 ${
            isTimeActive || timeOpen ? shortcutBtnActive : shortcutBtnIdle
          }`}
        >
          Time
          <span className="text-xs">{timeOpen ? "▴" : "▾"}</span>
        </button>

        {timeOpen && (
          <div className="absolute mt-2 min-w-[220px] rounded-2xl bg-white shadow-lg border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-3 text-[11px] text-slate-500 border-b bg-[#f8fafc]">
              Select Time Option
            </div>

            <div className="py-2">
              {timeItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    item.disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : item.active
                      ? "font-semibold text-slate-900 bg-slate-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  title={
                    item.disabled
                      ? "Route/page not added yet. UI item added only."
                      : item.label
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim Requests dropdown */}
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-green-500 text-white shadow"
        >
          Claim Requests
          <span className="text-xs">{open ? "▴" : "▾"}</span>
        </button>

        {open && (
          <div className="absolute mt-2 min-w-[260px] rounded-2xl bg-white shadow-lg border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-3 text-[11px] text-slate-500 border-b bg-[#f8fafc]">
              Select Option{" "}
              <span className="ml-2 text-slate-700 font-medium">
                ({activeLabel})
              </span>
            </div>

            <div className="py-2">
              {visibleItems.map((it, idx) => {
                const isConfigItem =
                  it.key === "config" &&
                  ((it.label.includes("Events") &&
                    configView === "events") ||
                    (it.label.includes("Expense") &&
                      configView === "expenses")) &&
                  activeTab === "config";

                const isActive = activeTab === it.key || isConfigItem;

                return (
                  <button
                    key={`${it.label}-${idx}`}
                    type="button"
                    onClick={() => {
                      it.onClick?.();
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                      isActive
                        ? "font-semibold text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================= PAGE ========================= */
export default function ClaimPage() {
  const role = useAppSelector((s) => selectRole(s));
  const canSeeAdminTabs =
    role === "ADMIN" || role === "HR" || role === "SUPERVISOR";

  const [activeTab, setActiveTab] = useState<Tab>(
    canSeeAdminTabs ? "config" : "submit"
  );
  const [configView, setConfigView] = useState<ConfigView>("events");
  const [requestsOpen, setRequestsOpen] = useState(false);

  // fix: useEffect instead of useMemo for side effects
  useEffect(() => {
    if (
      !canSeeAdminTabs &&
      (activeTab === "config" ||
        activeTab === "employee" ||
        activeTab === "assign")
    ) {
      setActiveTab("submit");
      setRequestsOpen(false);
    }
  }, [canSeeAdminTabs, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fb]">
      <ClaimRequestsTopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canSeeAdminTabs={canSeeAdminTabs}
        configView={configView}
        setConfigView={setConfigView}
        open={requestsOpen}
        setOpen={setRequestsOpen}
      />

      <div className="px-8 py-8 flex-1 space-y-8">
        {canSeeAdminTabs &&
          activeTab === "config" &&
          (configView === "events" ? (
            <ClaimEventsConfigSection />
          ) : (
            <ExpenseTypesConfigSection />
          ))}

        {activeTab === "submit" && <SubmitClaimSection />}
        {activeTab === "myclaims" && <MyClaimsSection />}

        {canSeeAdminTabs && activeTab === "employee" && (
          <EmployeeClaimsSection />
        )}
        {canSeeAdminTabs && activeTab === "assign" && <AssignClaimSection />}

        {!canSeeAdminTabs &&
          (activeTab === "config" ||
            activeTab === "employee" ||
            activeTab === "assign") && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-sm text-slate-600">
              You do not have access to this section.
            </div>
          )}
      </div>

      <div className="h-10 flex items-center justify-center text-[11px] text-slate-400">
        DecoStyle HRMS · {new Date().getFullYear()} · All Rights Reserved.
      </div>
    </div>
  );
}

/* ========================================================================== */
/* CONFIG: EVENTS                                                             */
/* ========================================================================== */

function ClaimEventsConfigSection() {
  const { data, isLoading, isError, refetch } = useGetClaimEventsQuery();
  const [createEvent, { isLoading: isCreating }] =
    useCreateClaimEventMutation();
  const [updateEvent, { isLoading: isUpdating }] =
    useUpdateClaimEventMutation();
  const [deleteEvent] = useDeleteClaimEventMutation();

  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">(
    ""
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClaimEvent | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const items = data?.items ?? [];

  const filtered = useMemo(
    () =>
      items.filter((ev) => {
        const matchName = ev.name
          .toLowerCase()
          .includes(searchName.toLowerCase());
        const matchStatus = statusFilter ? ev.status === statusFilter : true;
        return matchName && matchStatus;
      }),
    [items, searchName, statusFilter]
  );

  function openAdd() {
    setEditing(null);
    setName("");
    setStatus("ACTIVE");
    setErrorMsg(null);
    setModalOpen(true);
  }

  function openEdit(ev: ClaimEvent) {
    setEditing(ev);
    setName(ev.name);
    setStatus(ev.status);
    setErrorMsg(null);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Event name is required");
      return;
    }

    try {
      if (editing) {
        await updateEvent({ id: editing._id, name: trimmed, status }).unwrap();
      } else {
        await createEvent({ name: trimmed, status }).unwrap();
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message ||
          (editing ? "Failed to update event" : "Failed to create event")
      );
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id).unwrap();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  }

  function resetFilters() {
    setSearchName("");
    setStatusFilter("");
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <input
              placeholder="Type for hints..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | "ACTIVE" | "INACTIVE")
              }
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button
          type="button"
          onClick={openAdd}
          className="mb-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm hover:bg-green-700"
        >
          + Add
        </button>

        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-green-500 mb-3">
            Failed to load events.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-indigo-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f4f6fb] text-slate-500 border-b">
              <tr>
                <th className="py-2 px-4">
                  <input type="checkbox" />
                </th>
                <th className="py-2 px-4">Event Name ⬍</th>
                <th className="py-2 px-4">Status ⬍</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev._id} className="border-b last:border-0">
                  <td className="py-2 px-4">
                    <input type="checkbox" />
                  </td>
                  <td className="py-2 px-4">{ev.name}</td>
                  <td className="py-2 px-4">
                    {ev.status === "ACTIVE" ? "Active" : "Inactive"}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      type="button"
                      onClick={() => openEdit(ev)}
                      className="text-[11px] text-indigo-600 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev._id)}
                      className="text-[11px] text-green-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-3 px-4 text-center text-xs text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {editing ? "Edit Event" : "Add Event"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-600">
                  Event Name<span className="text-green-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-600">Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ACTIVE" | "INACTIVE")
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {errorMsg && (
                <p className="text-xs text-green-500 mt-1">{errorMsg}</p>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
                  disabled={isCreating || isUpdating}
                >
                  {editing
                    ? isUpdating
                      ? "Saving..."
                      : "Save"
                    : isCreating
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/* CONFIG: EXPENSE TYPES                                                      */
/* ========================================================================== */

function ExpenseTypesConfigSection() {
  const { data, isLoading, isError, refetch } = useGetExpenseTypesQuery();
  const [createType, { isLoading: isCreating }] =
    useCreateExpenseTypeMutation();
  const [updateType, { isLoading: isUpdating }] =
    useUpdateExpenseTypeMutation();
  const [deleteType] = useDeleteExpenseTypeMutation();

  const items = data?.items ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setName("");
    setErrorMsg(null);
    setModalOpen(true);
  }

  function openEdit(type: ExpenseType) {
    setEditing(type);
    setName(type.name);
    setErrorMsg(null);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Name is required");
      return;
    }

    try {
      if (editing) {
        await updateType({ id: editing._id, name: trimmed }).unwrap();
      } else {
        await createType({ name: trimmed }).unwrap();
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message ||
          (editing
            ? "Failed to update expense type"
            : "Failed to create expense type")
      );
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this expense type?")) return;
    try {
      await deleteType(id).unwrap();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense type");
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Expense Types
        </h2>

        <button
          type="button"
          onClick={openAdd}
          className="mb-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm hover:bg-green-700"
        >
          + Add
        </button>

        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-green-500 mb-3">
            Failed to load expense types.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-indigo-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f4f6fb] text-slate-500 border-b">
              <tr>
                <th className="py-2 px-4">
                  <input type="checkbox" />
                </th>
                <th className="py-2 px-4">Name ⬍</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-b last:border-0">
                  <td className="py-2 px-4">
                    <input type="checkbox" />
                  </td>
                  <td className="py-2 px-4">{it.name}</td>
                  <td className="py-2 px-4">
                    <button
                      type="button"
                      onClick={() => openEdit(it)}
                      className="text-[11px] text-indigo-600 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(it._id)}
                      className="text-[11px] text-green-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-3 px-4 text-center text-xs text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {editing ? "Edit Expense Type" : "Add Expense Type"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-600">
                  Name<span className="text-green-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-green-500 mt-1">{errorMsg}</p>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
                  disabled={isCreating || isUpdating}
                >
                  {editing
                    ? isUpdating
                      ? "Saving..."
                      : "Save"
                    : isCreating
                    ? "Adding..."
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/* SUBMIT CLAIM (self)                                                        */
/* ========================================================================== */

function SubmitClaimSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = (eventsData?.items ?? []).filter(
    (e) => e.status === "ACTIVE"
  );

  const [submitClaim, { isLoading }] = useSubmitClaimMutation();

  const [eventId, setEventId] = useState("");
  const [currency, setCurrency] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!eventId || !currency) {
      setErrorMsg("Event and currency are required.");
      return;
    }

    try {
      await submitClaim({ typeId: eventId, currency, remarks }).unwrap();
      setRemarks("");
      setEventId("");
      setCurrency("");
      setSuccessMsg("Claim created successfully.");
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to create claim.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        Create Claim Request
      </h2>

      <form onSubmit={handleCreate} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Event<span className="text-green-500">*</span>
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Currency<span className="text-green-500">*</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-600">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2">* Required</p>

        {errorMsg && <p className="text-xs text-green-500 mt-1">{errorMsg}</p>}
        {successMsg && (
          <p className="text-xs text-green-600 mt-1">{successMsg}</p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setEventId("");
              setCurrency("");
              setRemarks("");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================================== */
/* MY CLAIMS                                                                  */
/* ========================================================================== */

function MyClaimsSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = eventsData?.items ?? [];

  const [filters, setFilters] = useState<MyClaimsFilter>({
    referenceId: "",
    typeId: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const { data, isLoading, isError, refetch } = useGetMyClaimsQuery(filters);
  const items: Claim[] = data?.items ?? [];

  function handleChange<K extends keyof MyClaimsFilter>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      referenceId: "",
      typeId: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">My Claims</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Reference Id</label>
            <input
              placeholder="Type for hints..."
              value={filters.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <select
              value={filters.typeId}
              onChange={(e) => handleChange("typeId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div />
          <div />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-green-500 mb-3">
            Failed to load claims.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-indigo-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f4f6fb] text-slate-500 border-b">
              <tr>
                <th className="py-2 px-4">Reference Id ⬍</th>
                <th className="py-2 px-4">Event Name ⬍</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Currency</th>
                <th className="py-2 px-4">Submitted Date ⬍</th>
                <th className="py-2 px-4">Status ⬍</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="py-2 px-4">{c.referenceId}</td>
                  <td className="py-2 px-4">
                    {typeof c.type === "string"
                      ? c.type
                      : (c.type as any)?.name}
                  </td>
                  <td className="py-2 px-4">{c.description}</td>
                  <td className="py-2 px-4">{c.currency}</td>
                  <td className="py-2 px-4">{c.claimDate?.slice(0, 10) ?? ""}</td>
                  <td className="py-2 px-4">{c.status}</td>
                  <td className="py-2 px-4">
                    {typeof c.amount === "number" ? c.amount.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-4">—</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-3 px-4 text-center text-xs text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ========================================================================== */
/* EMPLOYEE CLAIMS (HR view)                                                  */
/* ========================================================================== */

function EmployeeClaimsSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = eventsData?.items ?? [];

  const [filters, setFilters] = useState<EmployeeClaimsFilter>({
    employeeName: "",
    referenceId: "",
    typeId: "",
    status: "",
    fromDate: "",
    toDate: "",
    include: "CURRENT",
  });

  const { data, isLoading, isError, refetch } =
    useGetEmployeeClaimsQuery(filters);
  const items: EmployeeClaim[] = data?.items ?? [];

  function handleChange<K extends keyof EmployeeClaimsFilter>(
    key: K,
    value: string
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      employeeName: "",
      referenceId: "",
      typeId: "",
      status: "",
      fromDate: "",
      toDate: "",
      include: "CURRENT",
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Employee Claims
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Employee Name</label>
            <input
              placeholder="Type for hints..."
              value={filters.employeeName}
              onChange={(e) => handleChange("employeeName", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Reference Id</label>
            <input
              placeholder="Type for hints..."
              value={filters.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <select
              value={filters.typeId}
              onChange={(e) => handleChange("typeId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Include</label>
            <select
              value={filters.include}
              onChange={(e) =>
                handleChange("include", e.target.value as "CURRENT" | "ALL")
              }
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="CURRENT">Current Employees Only</option>
              <option value="ALL">All Employees</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-300"
            />
          </div>
          <div />
          <div />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-green-500 mb-3">
            Failed to load employee claims.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-indigo-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f4f6fb] text-slate-500 border-b">
              <tr>
                <th className="py-2 px-4">Reference Id ⬍</th>
                <th className="py-2 px-4">Employee Name ⬍</th>
                <th className="py-2 px-4">Event Name ⬍</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Currency</th>
                <th className="py-2 px-4">Submitted Date ⬍</th>
                <th className="py-2 px-4">Status ⬍</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="py-2 px-4">{c.referenceId}</td>
                  <td className="py-2 px-4">
                    {typeof c.employee === "string"
                      ? c.employee
                      : (c.employee as any)?.fullName}
                  </td>
                  <td className="py-2 px-4">
                    {typeof c.type === "string"
                      ? c.type
                      : (c.type as any)?.name}
                  </td>
                  <td className="py-2 px-4">{c.description}</td>
                  <td className="py-2 px-4">{c.currency}</td>
                  <td className="py-2 px-4">{c.claimDate?.slice(0, 10) ?? ""}</td>
                  <td className="py-2 px-4">{c.status}</td>
                  <td className="py-2 px-4">
                    {typeof c.amount === "number" ? c.amount.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-4">—</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-3 px-4 text-center text-xs text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ========================================================================== */
/* ASSIGN CLAIM (HR creates claim for employee)                               */
/* ========================================================================== */

function AssignClaimSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = (eventsData?.items ?? []).filter(
    (e) => e.status === "ACTIVE"
  );

  const { data: employeesData } = useGetEmployeesSimpleQuery();
  const employees: SimpleEmployee[] = employeesData ?? [];

  const [assignClaim, { isLoading }] = useAssignClaimMutation();

  const [employeeId, setEmployeeId] = useState("");
  const [eventId, setEventId] = useState("");
  const [currency, setCurrency] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!employeeId || !eventId || !currency) {
      setErrorMsg("Employee, Event and Currency are required.");
      return;
    }

    try {
      await assignClaim({
        employeeId,
        typeId: eventId,
        currency,
        remarks,
      }).unwrap();
      setEmployeeId("");
      setEventId("");
      setCurrency("");
      setRemarks("");
      setSuccessMsg("Claim assigned successfully.");
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to assign claim.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        Create Claim Request
      </h2>

      <form onSubmit={handleCreate} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs text-slate-600">
              Employee Name<span className="text-green-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">Type for hints...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Event<span className="text-green-500">*</span>
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Currency<span className="text-green-500">*</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-600">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-green-400 focus:ring-1 focus:ring-green-300"
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2">* Required</p>

        {errorMsg && <p className="text-xs text-green-500 mt-1">{errorMsg}</p>}
        {successMsg && (
          <p className="text-xs text-green-600 mt-1">{successMsg}</p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setEmployeeId("");
              setEventId("");
              setCurrency("");
              setRemarks("");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}