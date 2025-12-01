// frontend/src/pages/claim/ClaimPage.tsx
import { FormEvent, useMemo, useState } from "react";
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
} from "../../features/claim/claimApi";

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

import {
  useGetEmployeesSimpleQuery,
  SimpleEmployee,
} from "../../features/employees/employeesApi"; // small helper hook that returns {_id, fullName}

// -----------------------------------------------------------------------------
// Tabs and layout
// -----------------------------------------------------------------------------

type Tab = "config" | "submit" | "myclaims" | "employee" | "assign";
type ConfigView = "events" | "expenses";

const topTabs: { key: Tab; label: string }[] = [
  { key: "config", label: "Configuration" },
  { key: "submit", label: "Submit Claim" },
  { key: "myclaims", label: "My Claims" },
  { key: "employee", label: "Employee Claims" },
  { key: "assign", label: "Assign Claim" },
];

const CURRENCIES = ["INR", "USD", "EUR"];

export default function ClaimPage() {
  const [activeTab, setActiveTab] = useState<Tab>("config");
  const [configView, setConfigView] = useState<ConfigView>("events");
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fb]">
      {/* Top orange gradient bar */}
      <div className="h-16 bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 flex items-center justify-between px-8 shadow-sm">
        <h1 className="text-white font-semibold text-lg">
          {activeTab === "config" ? "Claim / Configuration" : "Claim"}
        </h1>

        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/40 shadow-sm hover:bg-white/25">
            ⬆ Upgrade
          </button>

          <div className="flex items-center gap-2 bg-white/10 rounded-full px-2.5 py-1 border border-white/40">
            <div className="w-8 h-8 rounded-full bg-white/80" />
            <span className="text-xs font-medium text-white">
              Utkarsh Sharma
            </span>
          </div>
        </div>
      </div>

      {/* Tabs bar with Configuration dropdown */}
      <div className="bg-white px-8 py-3 shadow-sm flex items-center gap-4 relative">
        {topTabs.map((t) => {
          const isActive = activeTab === t.key;

          if (t.key === "config") {
            return (
              <div key={t.key} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen((o) => !o);
                    setActiveTab("config");
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    isActive
                      ? "bg-orange-500 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Configuration
                  <span className="text-xs">{configOpen ? "▴" : "▾"}</span>
                </button>

                {configOpen && (
                  <div className="absolute mt-1 w-40 rounded-lg bg-white shadow-lg border border-slate-100 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setConfigView("events");
                        setConfigOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 ${
                        configView === "events"
                          ? "font-semibold text-slate-800"
                          : ""
                      }`}
                    >
                      Events
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigView("expenses");
                        setConfigOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 ${
                        configView === "expenses"
                          ? "font-semibold text-slate-800"
                          : ""
                      }`}
                    >
                      Expense Types
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key);
                setConfigOpen(false);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                isActive
                  ? "bg-orange-500 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Page content per tab */}
      <div className="px-8 py-8 flex-1 space-y-8">
        {activeTab === "config" && (
          <>
            {configView === "events" ? (
              <ClaimEventsConfigSection />
            ) : (
              <ExpenseTypesConfigSection />
            )}
          </>
        )}

        {activeTab === "submit" && <SubmitClaimSection />}

        {activeTab === "myclaims" && <MyClaimsSection />}

        {activeTab === "employee" && <EmployeeClaimsSection />}

        {activeTab === "assign" && <AssignClaimSection />}
      </div>

      {/* Footer */}
      <div className="h-10 flex items-center justify-center text-[11px] text-slate-400">
        DecoStyle HRMS · {new Date().getFullYear()} · All Rights Reserved.
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CONFIG: EVENTS
// -----------------------------------------------------------------------------

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
      {/* Filter box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <input
              placeholder="Type for hints..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | "ACTIVE" | "INACTIVE")
              }
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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

      {/* Add + table */}
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
          <div className="text-xs text-red-500 mb-3">
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
                      className="text-[11px] text-red-500"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {editing ? "Edit Event" : "Add Event"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-600">
                  Event Name<span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-600">Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ACTIVE" | "INACTIVE")
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
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
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
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

// -----------------------------------------------------------------------------
// CONFIG: EXPENSE TYPES
// -----------------------------------------------------------------------------

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
          (editing ? "Failed to update expense type" : "Failed to create expense type")
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
          <div className="text-xs text-red-500 mb-3">
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
                      className="text-[11px] text-red-500"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {editing ? "Edit Expense Type" : "Add Expense Type"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-600">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
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
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
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

// -----------------------------------------------------------------------------
// SUBMIT CLAIM (self)
// -----------------------------------------------------------------------------

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
      await submitClaim({
        eventId,
        currency,
        remarks,
      }).unwrap();
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
          {/* Event */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Event<span className="text-red-500">*</span>
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Currency<span className="text-red-500">*</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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

        {/* Remarks */}
        <div className="space-y-1">
          <label className="text-xs text-slate-600">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2">* Required</p>

        {errorMsg && (
          <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
        )}
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

// -----------------------------------------------------------------------------
// MY CLAIMS
// -----------------------------------------------------------------------------

function MyClaimsSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = eventsData?.items ?? [];

  const [filters, setFilters] = useState<MyClaimsFilter>({
    referenceId: "",
    eventId: "",
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
      eventId: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
  }

  return (
    <>
      {/* Filter box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          My Claims
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Reference Id</label>
            <input
              placeholder="Type for hints..."
              value={filters.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <select
              value={filters.eventId}
              onChange={(e) => handleChange("eventId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button className="mb-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm hover:bg-green-700">
          + Submit Claim
        </button>

        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-red-500 mb-3">
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
        {!isLoading && !items.length && !isError && (
          <div className="text-xs text-slate-500 mb-3">No Records Found</div>
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
                    {typeof c.event === "string"
                      ? c.event
                      : (c.event as any)?.name}
                  </td>
                  <td className="py-2 px-4">{c.description}</td>
                  <td className="py-2 px-4">{c.currency}</td>
                  <td className="py-2 px-4">
                    {c.submittedDate?.slice(0, 10) ?? ""}
                  </td>
                  <td className="py-2 px-4">{c.status}</td>
                  <td className="py-2 px-4">{c.amount?.toFixed(2) ?? "-"}</td>
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

// -----------------------------------------------------------------------------
// EMPLOYEE CLAIMS (HR view)
// -----------------------------------------------------------------------------

function EmployeeClaimsSection() {
  const { data: eventsData } = useGetClaimEventsQuery();
  const events = eventsData?.items ?? [];

  const [filters, setFilters] = useState<EmployeeClaimsFilter>({
    employeeName: "",
    referenceId: "",
    eventId: "",
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
      eventId: "",
      status: "",
      fromDate: "",
      toDate: "",
      include: "CURRENT",
    });
  }

  return (
    <>
      {/* Filter box */}
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Reference Id</label>
            <input
              placeholder="Type for hints..."
              value={filters.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Event Name</label>
            <select
              value={filters.eventId}
              onChange={(e) => handleChange("eventId", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              className="w-full bg-white rounded-md border border-slate-300 text-xs px-3 py-2 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button className="mb-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm hover:bg-green-700">
          + Assign Claim
        </button>

        {isLoading && (
          <div className="text-xs text-slate-500 mb-3">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-red-500 mb-3">
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
                    {typeof c.event === "string"
                      ? c.event
                      : (c.event as any)?.name}
                  </td>
                  <td className="py-2 px-4">{c.description}</td>
                  <td className="py-2 px-4">{c.currency}</td>
                  <td className="py-2 px-4">
                    {c.submittedDate?.slice(0, 10) ?? ""}
                  </td>
                  <td className="py-2 px-4">{c.status}</td>
                  <td className="py-2 px-4">{c.amount?.toFixed(2) ?? "-"}</td>
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

// -----------------------------------------------------------------------------
// ASSIGN CLAIM (HR creates claim for employee)
// -----------------------------------------------------------------------------

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
        eventId,
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
          {/* Employee */}
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs text-slate-600">
              Employee Name<span className="text-red-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            >
              <option value="">Type for hints...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Event<span className="text-red-500">*</span>
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            >
              <option value="">-- Select --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600">
              Currency<span className="text-red-500">*</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
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

        {/* Remarks */}
        <div className="space-y-1">
          <label className="text-xs text-slate-600">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none text-xs focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2">* Required</p>

        {errorMsg && (
          <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
        )}
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
