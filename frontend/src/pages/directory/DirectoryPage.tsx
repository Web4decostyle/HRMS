import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  useSearchEmployeesQuery,
  useGetHierarchyQuery,
  useGetDivisionsSummaryQuery,
} from "../../features/directory/directoryApi";

import { useGetDivisionsQuery } from "../../features/divisions/divisionsApi";
import { useGetSubDivisionsQuery } from "../../features/divisions/subDivisionsApi";
import { useUpdateEmployeeMutation } from "../../features/employees/employeesApi";
import { selectAuthRole } from "../../features/auth/selectors";

export default function DirectoryPage() {
  const role = useSelector(selectAuthRole);
  const isAdmin = String(role || "").toUpperCase() === "ADMIN";

  const [ui, setUi] = useState({
    name: "",
    jobTitle: "",
    location: "",
    divisionId: "",
    subDivisionId: "", // ✅ NEW
  });

  const [applied, setApplied] = useState({
    name: "",
    jobTitle: "",
    location: "",
    divisionId: "",
    subDivisionId: "", // ✅ NEW
  });

  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  const { data: divisions = [], isLoading: divLoading } = useGetDivisionsQuery();

  // ✅ Load sub-divisions for selected division (UI-only)
  const { data: subDivisions = [], isLoading: subLoading } =
    useGetSubDivisionsQuery(
      { divisionId: ui.divisionId },
      { skip: !ui.divisionId }
    );

  const queryArgs = useMemo(() => {
    const has =
      applied.name.trim() ||
      applied.jobTitle.trim() ||
      applied.location.trim() ||
      applied.divisionId.trim() ||
      applied.subDivisionId.trim();

    if (!has) return undefined;

    return {
      q: applied.name.trim() || undefined,
      jobTitle: applied.jobTitle || undefined,
      location: applied.location || undefined,
      divisionId: applied.divisionId || undefined,
      subDivisionId: applied.subDivisionId || undefined,
    };
  }, [applied]);

  const { data: employees = [], isLoading } = useSearchEmployeesQuery(queryArgs);

  const summaryArgs = useMemo(() => {
    const has = applied.location.trim() || applied.jobTitle.trim();
    return has
      ? {
          location: applied.location || undefined,
          jobTitle: applied.jobTitle || undefined,
        }
      : undefined;
  }, [applied.location, applied.jobTitle]);

  const { data: divSummary = [], isLoading: summaryLoading } =
    useGetDivisionsSummaryQuery(summaryArgs);

  const { data: hierarchy, isLoading: isHierarchyLoading } = useGetHierarchyQuery(
    activeEmployeeId || "",
    { skip: !activeEmployeeId }
  );

  const [updateEmployee, { isLoading: isTransferring }] =
    useUpdateEmployeeMutation();

  // ✅ Transfer state
  const [transferDivisionId, setTransferDivisionId] = useState<string>("");
  const [transferSubDivisionId, setTransferSubDivisionId] = useState<string>("");

  const { data: transferSubDivisions = [] } = useGetSubDivisionsQuery(
    { divisionId: transferDivisionId },
    { skip: !transferDivisionId }
  );

  function onReset() {
    setUi({ name: "", jobTitle: "", location: "", divisionId: "", subDivisionId: "" });
    setApplied({ name: "", jobTitle: "", location: "", divisionId: "", subDivisionId: "" });
    setActiveEmployeeId(null);
    setTransferDivisionId("");
    setTransferSubDivisionId("");
  }

  function onSearch() {
    setApplied({
      name: ui.name,
      jobTitle: ui.jobTitle,
      location: ui.location,
      divisionId: ui.divisionId,
      subDivisionId: ui.subDivisionId,
    });
  }

  const selectedDivisionName =
    ui.divisionId && divisions.find((d: any) => d._id === ui.divisionId)?.name;

  function getDivisionNameFromEmployee(emp: any) {
    if (!emp?.division) return "Unassigned";
    if (typeof emp.division === "object" && emp.division?.name) return emp.division.name;
    const found = divisions.find((d: any) => String(d._id) === String(emp.division));
    return found?.name || "Unassigned";
  }

  function getSubDivisionNameFromEmployee(emp: any) {
    if (!emp?.subDivision) return "—";
    if (typeof emp.subDivision === "object" && emp.subDivision?.name) return emp.subDivision.name;

    // try lookup in currently loaded subDivisions
    const found = subDivisions.find((s: any) => String(s._id) === String(emp.subDivision));
    return found?.name || "—";
  }

  async function confirmTransfer() {
    if (!isAdmin) return;
    if (!activeEmployeeId) return;
    if (!transferDivisionId) return;

    await updateEmployee({
      id: activeEmployeeId,
      data: {
        // ✅ Transfer
        division: transferDivisionId,

        // ✅ IMPORTANT: if you change division, clear old subDivision (prevents invalid links)
        subDivision: transferSubDivisionId || null,
      } as any,
    }).unwrap();

    setActiveEmployeeId(null);
    setTransferDivisionId("");
    setTransferSubDivisionId("");
  }

  return (
    <div className="min-h-screen bg-[#f4f5fb] px-8 py-6">
      {/* FILTER CARD */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 pt-6 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-700">Directory</h1>
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
            title="Collapse"
          >
            ▴
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Employee Name</label>
              <input
                value={ui.name}
                onChange={(e) => setUi((s) => ({ ...s, name: e.target.value }))}
                placeholder="Type for hints..."
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Job Title</label>
              <div className="relative">
                <select
                  value={ui.jobTitle}
                  onChange={(e) =>
                    setUi((s) => ({ ...s, jobTitle: e.target.value }))
                  }
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                >
                  <option value="">-- Select --</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Staff">Staff</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Location</label>
              <div className="relative">
                <select
                  value={ui.location}
                  onChange={(e) =>
                    setUi((s) => ({ ...s, location: e.target.value }))
                  }
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                >
                  <option value="">-- Select --</option>
                  <option value="Indore">Indore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>
            </div>

            {/* Division dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Division</label>
              <div className="relative">
                <select
                  value={ui.divisionId}
                  onChange={(e) => {
                    const divisionId = e.target.value;
                    // ✅ reset subDivision when division changes
                    setUi((s) => ({ ...s, divisionId, subDivisionId: "" }));
                  }}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                >
                  <option value="">
                    {divLoading ? "Loading..." : "-- Select Division --"}
                  </option>
                  {divisions
                    .filter((d: any) => d.isActive !== false)
                    .map((d: any) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>

              {selectedDivisionName ? (
                <div className="text-[10px] text-slate-400">
                  Selected: <span className="font-semibold">{selectedDivisionName}</span>
                </div>
              ) : null}
            </div>

            {/* ✅ NEW: Sub-Division dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Sub-Division</label>
              <div className="relative">
                <select
                  value={ui.subDivisionId}
                  onChange={(e) =>
                    setUi((s) => ({ ...s, subDivisionId: e.target.value }))
                  }
                  disabled={!ui.divisionId}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs appearance-none outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 disabled:opacity-60"
                >
                  <option value="">
                    {!ui.divisionId
                      ? "Select division first"
                      : subLoading
                      ? "Loading..."
                      : "-- Select Sub-Division --"}
                  </option>
                  {subDivisions
                    .filter((s: any) => s.isActive !== false)
                    .map((s: any) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  ▾
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100" />

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onReset}
              className="h-9 px-10 rounded-full border border-[#76c043] text-[#76c043] text-xs font-semibold bg-white hover:bg-[#f6fff0]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="h-9 px-10 rounded-full bg-[#76c043] text-white text-xs font-semibold hover:opacity-95"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Division summary */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">
            Division Summary
          </div>
          <div className="text-[11px] text-slate-400">
            {summaryLoading ? "Loading…" : `${divSummary.length} divisions`}
          </div>
        </div>

        <div className="px-6 pb-6">
          {summaryLoading ? (
            <div className="text-xs text-slate-500">Loading…</div>
          ) : divSummary.length === 0 ? (
            <div className="text-xs text-slate-500">No data</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {divSummary.slice(0, 10).map((d: any) => (
                <button
                  key={d.divisionId}
                  type="button"
                  onClick={() => {
                    setUi((s) => ({ ...s, divisionId: d.divisionId, subDivisionId: "" }));
                    setApplied((s) => ({ ...s, divisionId: d.divisionId, subDivisionId: "" }));
                  }}
                  className="rounded-xl border border-slate-100 bg-[#f7f9ff] p-3 text-left hover:ring-2 hover:ring-green-100"
                >
                  <div className="text-[11px] text-slate-500">Division</div>
                  <div className="text-xs font-semibold text-slate-800">
                    {d.divisionName}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Employees: <span className="font-semibold">{d.count}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 text-slate-600 text-sm">
          ({isLoading ? "…" : employees.length}) Records Found
        </div>

        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isLoading &&
              employees.map((emp: any) => (
                <button
                  type="button"
                  key={emp._id}
                  onClick={() => {
                    setActiveEmployeeId(emp._id);
                    setTransferDivisionId("");
                    setTransferSubDivisionId("");
                  }}
                  className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center hover:ring-2 hover:ring-green-100"
                >
                  <div className="text-sm font-semibold text-slate-700 capitalize mb-2">
                    {(emp.firstName || "") + " " + (emp.lastName || "")}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {emp.jobTitle || "—"}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500">
                    Division:{" "}
                    <span className="font-semibold text-slate-700">
                      {getDivisionNameFromEmployee(emp)}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500">
                    Sub-Division:{" "}
                    <span className="font-semibold text-slate-700">
                      {getSubDivisionNameFromEmployee(emp)}
                    </span>
                  </div>

                  <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center mt-4">
                    <div className="w-16 h-16 rounded-full bg-slate-300" />
                  </div>

                  <div className="mt-4 text-[11px] text-slate-400">
                    Click to view hierarchy
                  </div>
                </button>
              ))}

            {isLoading && (
              <div className="col-span-full text-xs text-slate-500">Loading…</div>
            )}

            {!isLoading && employees.length === 0 && (
              <div className="col-span-full text-center text-sm text-slate-500 py-10">
                No Records Found
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HIERARCHY MODAL */}
      {activeEmployeeId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[760px] max-w-[92vw] rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">
                Employee Hierarchy
              </div>
              <button
                onClick={() => setActiveEmployeeId(null)}
                className="text-xs px-4 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {isHierarchyLoading && (
                <div className="text-xs text-slate-500">Loading hierarchy…</div>
              )}

              {!isHierarchyLoading && hierarchy && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[12px] font-semibold text-slate-800">
                      {hierarchy.employee.firstName} {hierarchy.employee.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {hierarchy.employee.jobTitle || "—"}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                      Division:{" "}
                      <span className="font-semibold text-slate-700">
                        {getDivisionNameFromEmployee(hierarchy.employee)}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                      Sub-Division:{" "}
                      <span className="font-semibold text-slate-700">
                        {getSubDivisionNameFromEmployee(hierarchy.employee)}
                      </span>
                    </div>
                  </div>

                  {/* ADMIN ONLY: Transfer UI */}
                  {isAdmin && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="text-[12px] font-semibold text-slate-700">
                        Transfer (Admin only)
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500">
                            Division
                          </label>
                          <select
                            value={transferDivisionId}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTransferDivisionId(v);
                              setTransferSubDivisionId(""); // reset
                            }}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200"
                          >
                            <option value="">-- Select --</option>
                            {divisions
                              .filter((d: any) => d.isActive !== false)
                              .map((d: any) => (
                                <option key={d._id} value={d._id}>
                                  {d.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-500">
                            Sub-Division
                          </label>
                          <select
                            value={transferSubDivisionId}
                            onChange={(e) => setTransferSubDivisionId(e.target.value)}
                            disabled={!transferDivisionId}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:ring-2 focus:ring-green-100 focus:border-green-200 disabled:opacity-60"
                          >
                            <option value="">
                              {!transferDivisionId
                                ? "Select division first"
                                : "-- Optional --"}
                            </option>
                            {transferSubDivisions
                              .filter((s: any) => s.isActive !== false)
                              .map((s: any) => (
                                <option key={s._id} value={s._id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                          <div className="text-[10px] text-slate-400">
                            If not selected, sub-division will be cleared.
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!transferDivisionId || isTransferring}
                          onClick={confirmTransfer}
                          className="h-10 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60"
                        >
                          {isTransferring ? "Transferring..." : "Transfer"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-100 rounded-xl p-4">
                      <div className="text-[12px] font-semibold text-slate-700 mb-3">
                        Reports To
                      </div>
                      {hierarchy.supervisors.length === 0 ? (
                        <div className="text-[11px] text-slate-400">
                          No supervisor assigned
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hierarchy.supervisors.map((s: any) => (
                            <div key={s._id} className="text-[11px] text-slate-700">
                              <span className="font-semibold">
                                {s.supervisorId?.firstName} {s.supervisorId?.lastName}
                              </span>{" "}
                              <span className="text-slate-400">
                                ({s.reportingMethod || "Direct"})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-100 rounded-xl p-4">
                      <div className="text-[12px] font-semibold text-slate-700 mb-3">
                        Direct Reports
                      </div>
                      {hierarchy.subordinates.length === 0 ? (
                        <div className="text-[11px] text-slate-400">
                          No subordinates assigned
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hierarchy.subordinates.map((s: any) => (
                            <div key={s._id} className="text-[11px] text-slate-700">
                              <span className="font-semibold">
                                {s.subordinateId?.firstName} {s.subordinateId?.lastName}
                              </span>{" "}
                              <span className="text-slate-400">
                                ({s.reportingMethod || "Direct"})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Next step: we can make hierarchy fully division-driven (Manager → TL → Staff)
                    once backend returns division chain.
                  </div>
                </div>
              )}

              {!isHierarchyLoading && !hierarchy && (
                <div className="text-xs text-slate-500">No hierarchy data.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
