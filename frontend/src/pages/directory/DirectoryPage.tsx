import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ArrowRightLeft,
} from "lucide-react";

import {
  useGetHierarchyQuery,
  useGetDivisionsSummaryQuery,
  useSearchEmployeesQuery,
  type DirectoryEmployee,
} from "../../features/directory/directoryApi";
import {
  useGetDivisionsTreeQuery,
  type DivisionTree,
} from "../../features/divisions/divisionsApi";
import { useUpdateEmployeeMutation } from "../../features/employees/employeesApi";
import { selectAuthRole } from "../../features/auth/selectors";

const shell = "min-h-screen bg-[#f4f5fb]";
const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

const pill =
  "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700";

function initials(first?: string, last?: string) {
  const f = (first || "").trim().slice(0, 1).toUpperCase();
  const l = (last || "").trim().slice(0, 1).toUpperCase();
  return `${f}${l}` || "?";
}

function fullName(e?: Partial<DirectoryEmployee>) {
  return `${e?.firstName || ""} ${e?.lastName || ""}`.trim() || "—";
}

function isAdminRole(role?: string | null) {
  return String(role || "").toUpperCase() === "ADMIN";
}

function valueToId(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v._id) return String(v._id);
  return "";
}

function valueToName(v: any): string {
  if (!v) return "";
  if (typeof v === "object" && v.name) return String(v.name);
  return "";
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DirectoryPage() {
  const role = useSelector(selectAuthRole);
  const isAdmin = isAdminRole(role);

  const { data: divisionsTree = [], isLoading: divLoading } =
    useGetDivisionsTreeQuery();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  // Filters (live)
  const [filters, setFilters] = useState({
    q: "",
    jobTitle: "",
    location: "",
    divisionId: "",
    subDivisionId: "",
  });

  const dq = useDebouncedValue(filters.q, 300);
  const dJob = useDebouncedValue(filters.jobTitle, 250);
  const dLoc = useDebouncedValue(filters.location, 250);

  const queryArgs = useMemo(() => {
    const has =
      dq.trim() ||
      dJob.trim() ||
      dLoc.trim() ||
      filters.divisionId.trim() ||
      filters.subDivisionId.trim();

    if (!has) return undefined;
    return {
      q: dq.trim() || undefined,
      jobTitle: dJob.trim() || undefined,
      location: dLoc.trim() || undefined,
      divisionId: filters.divisionId || undefined,
      subDivisionId: filters.subDivisionId || undefined,
    };
  }, [dq, dJob, dLoc, filters.divisionId, filters.subDivisionId]);

  const { data: employees = [], isLoading: empLoading } =
    useSearchEmployeesQuery(queryArgs);

  const { data: divSummary = [], isLoading: summaryLoading } =
    useGetDivisionsSummaryQuery(
      dLoc.trim() || dJob.trim()
        ? { location: dLoc.trim() || undefined, jobTitle: dJob.trim() || undefined }
        : undefined
    );

  const summaryByDivision = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of divSummary) m.set(String(row.divisionId || ""), row.count);
    return m;
  }, [divSummary]);

  const activeEmployee = useMemo(
    () => employees.find((e) => e._id === activeEmployeeId),
    [employees, activeEmployeeId]
  );

  const { data: hierarchy, isLoading: hierLoading } = useGetHierarchyQuery(
    activeEmployeeId || "",
    { skip: !activeEmployeeId }
  );

  // Transfer (admin)
  const [updateEmployee, { isLoading: transferring }] =
    useUpdateEmployeeMutation();
  const [transfer, setTransfer] = useState({
    divisionId: "",
    subDivisionId: "",
  });

  useEffect(() => {
    // prefill transfer when opening drawer
    if (!activeEmployee) return;
    setTransfer({
      divisionId: valueToId(activeEmployee.division) || "",
      subDivisionId: valueToId(activeEmployee.subDivision) || "",
    });
  }, [activeEmployeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDivision = useMemo(() => {
    return divisionsTree.find((d) => String(d._id) === String(filters.divisionId));
  }, [divisionsTree, filters.divisionId]);

  const activeTitle = useMemo(() => {
    const dName = selectedDivision?.name || "All divisions";
    const sName =
      filters.subDivisionId && selectedDivision
        ? selectedDivision.subDivisions?.find(
            (s) => String(s._id) === String(filters.subDivisionId)
          )?.name
        : "";
    return sName ? `${dName} • ${sName}` : dName;
  }, [selectedDivision, filters.subDivisionId]);

  function resetAll() {
    setFilters({ q: "", jobTitle: "", location: "", divisionId: "", subDivisionId: "" });
    setActiveEmployeeId(null);
  }

  function pickDivision(divisionId: string) {
    setFilters((s) => ({ ...s, divisionId, subDivisionId: "" }));
    setExpanded((p) => ({ ...p, [divisionId]: true }));
  }

  function pickSubDivision(divisionId: string, subDivisionId: string) {
    setFilters((s) => ({ ...s, divisionId, subDivisionId }));
    setExpanded((p) => ({ ...p, [divisionId]: true }));
  }

  async function confirmTransfer() {
    if (!isAdmin) return;
    if (!activeEmployeeId) return;
    if (!transfer.divisionId) return;

    await updateEmployee({
      id: activeEmployeeId,
      data: {
        division: transfer.divisionId,
        subDivision: transfer.subDivisionId || null,
      } as any,
    }).unwrap();
  }

  return (
    <div className={shell}>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-slate-800">Directory</h1>
            <p className="text-[12px] text-slate-500">
              Browse employees by division, sub-division and quick filters.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
                placeholder="Search name, email, phone…"
                className="h-10 w-full sm:w-[340px] rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]"
              />
              {!!filters.q && (
                <button
                  type="button"
                  onClick={() => setFilters((s) => ({ ...s, q: "" }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
              title="Reset"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Body grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className={`lg:col-span-4 xl:col-span-3 ${card} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-600" />
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    Divisions
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Click to filter
                  </div>
                </div>
              </div>

              {(divLoading || summaryLoading) && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            <div className="max-h-[calc(100vh-210px)] overflow-auto p-2">
              <button
                type="button"
                onClick={() => setFilters((s) => ({ ...s, divisionId: "", subDivisionId: "" }))}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  !filters.divisionId ? "bg-[#fff4e8] border border-[#f8b46a]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-800">All employees</span>
                  </div>
                  <span className="text-xs text-slate-500">{employees.length}</span>
                </div>
              </button>

              <div className="mt-2 space-y-1">
                {divisionsTree.map((d) => (
                  <DivisionNode
                    key={d._id}
                    division={d}
                    expanded={!!expanded[d._id]}
                    onToggle={() =>
                      setExpanded((p) => ({ ...p, [d._id]: !p[d._id] }))
                    }
                    onPickDivision={() => pickDivision(String(d._id))}
                    onPickSubDivision={(sid) =>
                      pickSubDivision(String(d._id), String(sid))
                    }
                    selectedDivisionId={filters.divisionId}
                    selectedSubDivisionId={filters.subDivisionId}
                    count={summaryByDivision.get(String(d._id))}
                  />
                ))}

                {!divLoading && divisionsTree.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">No divisions found.</div>
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className={`lg:col-span-8 xl:col-span-9 ${card} overflow-hidden`}>
            <div className="border-b border-slate-100 px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    {activeTitle}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Showing {employees.length} employee{employees.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={filters.jobTitle}
                      onChange={(e) =>
                        setFilters((s) => ({ ...s, jobTitle: e.target.value }))
                      }
                      placeholder="Job title"
                      className="h-10 w-full sm:w-[170px] rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={filters.location}
                      onChange={(e) =>
                        setFilters((s) => ({ ...s, location: e.target.value }))
                      }
                      placeholder="Location"
                      className="h-10 w-full sm:w-[170px] rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]"
                    />
                  </div>
                </div>
              </div>

              {/* Active filter pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!!filters.divisionId && (
                  <span className={pill}>
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    {selectedDivision?.name || "Division"}
                    <button
                      type="button"
                      onClick={() => setFilters((s) => ({ ...s, divisionId: "", subDivisionId: "" }))}
                      className="ml-1 rounded-full p-0.5 text-slate-500 hover:bg-slate-100"
                      title="Clear division"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {!!filters.subDivisionId && (
                  <span className={pill}>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    {selectedDivision?.subDivisions?.find(
                      (s) => String(s._id) === String(filters.subDivisionId)
                    )?.name || "Sub-division"}
                    <button
                      type="button"
                      onClick={() => setFilters((s) => ({ ...s, subDivisionId: "" }))}
                      className="ml-1 rounded-full p-0.5 text-slate-500 hover:bg-slate-100"
                      title="Clear sub-division"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {!!filters.jobTitle.trim() && (
                  <span className={pill}>
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    {filters.jobTitle}
                    <button
                      type="button"
                      onClick={() => setFilters((s) => ({ ...s, jobTitle: "" }))}
                      className="ml-1 rounded-full p-0.5 text-slate-500 hover:bg-slate-100"
                      title="Clear job title"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {!!filters.location.trim() && (
                  <span className={pill}>
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {filters.location}
                    <button
                      type="button"
                      onClick={() => setFilters((s) => ({ ...s, location: "" }))}
                      className="ml-1 rounded-full p-0.5 text-slate-500 hover:bg-slate-100"
                      title="Clear location"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              {(empLoading || divLoading) && (
                <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white/80 px-6 py-3 text-xs text-slate-600 backdrop-blur">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              )}

              <div className="max-h-[calc(100vh-250px)] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-500">
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-3 py-3">Job</th>
                      <th className="px-3 py-3">Location</th>
                      <th className="px-3 py-3">Division</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr
                        key={e._id}
                        className="border-b border-slate-50 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#fff4e8] text-[#f7941d] flex items-center justify-center text-xs font-semibold">
                              {initials(e.firstName, e.lastName)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {fullName(e)}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                {e.email && (
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" /> {e.email}
                                  </span>
                                )}
                                {e.phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" /> {e.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {e.jobTitle || "—"}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-700">
                          {e.location || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-slate-700">
                              {valueToName(e.division) || "Unassigned"}
                            </span>
                            {valueToName(e.subDivision) ? (
                              <span className="text-[11px] text-slate-500">
                                {valueToName(e.subDivision)}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveEmployeeId(e._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            View
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!empLoading && employees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center">
                          <div className="mx-auto max-w-md">
                            <div className="text-sm font-semibold text-slate-800">
                              No employees found
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              Try clearing filters or searching with a different keyword.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {!!activeEmployeeId && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setActiveEmployeeId(null)}
            />

            <motion.div
              className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    Employee details
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Hierarchy + quick actions
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEmployeeId(null)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="h-[calc(100vh-70px)] overflow-auto px-6 py-5">
                {/* Profile */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#fff4e8] text-[#f7941d] flex items-center justify-center text-sm font-semibold">
                      {initials(activeEmployee?.firstName, activeEmployee?.lastName)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-slate-800">
                        {fullName(activeEmployee)}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-slate-600">
                        {activeEmployee?.jobTitle && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-4 w-4" /> {activeEmployee.jobTitle}
                          </span>
                        )}
                        {activeEmployee?.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {activeEmployee.location}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[12px] text-slate-600">
                        <span className="font-medium text-slate-700">Division:</span>{" "}
                        {valueToName(activeEmployee?.division) || "Unassigned"}
                        {valueToName(activeEmployee?.subDivision)
                          ? ` • ${valueToName(activeEmployee?.subDivision)}`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hierarchy */}
                <div className="mt-4">
                  <div className="text-[12px] font-semibold text-slate-800">
                    Reporting
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Supervisors
                      </div>
                      <div className="mt-2 space-y-2">
                        {hierLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                          </div>
                        ) : (hierarchy?.supervisors || []).length ? (
                          hierarchy!.supervisors.map((s) => (
                            <PersonRow
                              key={s._id}
                              name={fullName(s.supervisorId)}
                              subtitle={s.supervisorId.jobTitle || "—"}
                            />
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">—</div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Subordinates
                      </div>
                      <div className="mt-2 space-y-2">
                        {hierLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                          </div>
                        ) : (hierarchy?.subordinates || []).length ? (
                          hierarchy!.subordinates.map((s) => (
                            <PersonRow
                              key={s._id}
                              name={fullName(s.subordinateId)}
                              subtitle={s.subordinateId.jobTitle || "—"}
                            />
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">—</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin transfer */}
                {isAdmin && (
                  <div className="mt-4 rounded-2xl border border-[#f8b46a] bg-[#fffaf3] p-4">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-[#f7941d]" />
                      <div className="text-[12px] font-semibold text-slate-800">
                        Transfer employee
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Division
                        </label>
                        <select
                          value={transfer.divisionId}
                          onChange={(e) =>
                            setTransfer({ divisionId: e.target.value, subDivisionId: "" })
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a]"
                        >
                          <option value="">-- Select division --</option>
                          {divisionsTree.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Sub-division
                        </label>
                        <select
                          value={transfer.subDivisionId}
                          onChange={(e) =>
                            setTransfer((s) => ({ ...s, subDivisionId: e.target.value }))
                          }
                          disabled={!transfer.divisionId}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f7941d] focus:ring-2 focus:ring-[#f8b46a] disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="">-- (Optional) --</option>
                          {divisionsTree
                            .find((d) => String(d._id) === String(transfer.divisionId))
                            ?.subDivisions?.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={confirmTransfer}
                        disabled={!transfer.divisionId || transferring}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-4 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
                      >
                        {transferring ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save transfer"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PersonRow({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <div>
        <div className="text-sm font-medium text-slate-800">{name}</div>
        <div className="text-[11px] text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}

function DivisionNode(props: {
  division: DivisionTree;
  expanded: boolean;
  onToggle: () => void;
  onPickDivision: () => void;
  onPickSubDivision: (subDivisionId: string) => void;
  selectedDivisionId: string;
  selectedSubDivisionId: string;
  count?: number;
}) {
  const {
    division,
    expanded,
    onToggle,
    onPickDivision,
    onPickSubDivision,
    selectedDivisionId,
    selectedSubDivisionId,
    count,
  } = props;

  const isSelectedDivision = String(selectedDivisionId) === String(division._id);

  return (
    <div className="rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50">
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-1 text-slate-500 hover:bg-white"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onPickDivision}
          className={`flex-1 rounded-xl px-2 py-2 text-left text-sm ${
            isSelectedDivision && !selectedSubDivisionId
              ? "bg-[#fff4e8] border border-[#f8b46a]"
              : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-800">{division.name}</span>
            </div>
            <span className="text-xs text-slate-500">{count ?? "—"}</span>
          </div>
        </button>
      </div>

      {expanded && !!division.subDivisions?.length && (
        <div className="pb-2 pl-9 pr-2">
          <div className="space-y-1">
            {division.subDivisions.map((s) => {
              const isSelectedSub =
                isSelectedDivision &&
                String(selectedSubDivisionId) === String(s._id);
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => onPickSubDivision(String(s._id))}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-white ${
                    isSelectedSub ? "bg-[#fff4e8] border border-[#f8b46a]" : ""
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
