import { FormEvent, useMemo, useState } from "react";
import {
  useCreateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDivisionsQuery,
  useUpdateDivisionMutation,
} from "../../features/divisions/divisionsApi";
import {
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  type Employee,
} from "../../features/employees/employeesApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function DivisionsPage() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();
  const { data: employees } = useGetEmployeesQuery({ include: "all" });

  const [createDivision, { isLoading: isCreating }] =
    useCreateDivisionMutation();
  const [updateDivision] = useUpdateDivisionMutation();
  const [deleteDivision, { isLoading: isDeleting }] =
    useDeleteDivisionMutation();

  // ✅ NEW: promote employee to TL
  const [updateEmployee, { isLoading: isPromoting }] =
    useUpdateEmployeeMutation();

  const employeeOptions = useMemo(() => {
    const list = employees ?? [];
    return list
      .slice()
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      )
      .map((e) => ({
        id: e._id,
        label: `${e.firstName} ${e.lastName} (${e.employeeId})`,
        raw: e,
      }));
  }, [employees]);

  // Create form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [managerEmployeeId, setManagerEmployeeId] = useState<string>("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editManagerId, setEditManagerId] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState(true);

  // ✅ NEW: TL modal state
  const [tlOpen, setTlOpen] = useState(false);
  const [tlDivisionId, setTlDivisionId] = useState<string>("");
  const [tlDivisionName, setTlDivisionName] = useState<string>("");
  const [tlEmployeeId, setTlEmployeeId] = useState<string>("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createDivision({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      managerEmployeeId: managerEmployeeId || null,
    }).unwrap();

    setName("");
    setCode("");
    setDescription("");
    setManagerEmployeeId("");
  }

  function startEdit(d: any) {
    setEditingId(d._id);
    setEditName(d.name ?? "");
    setEditCode(d.code ?? "");
    setEditDescription(d.description ?? "");
    setEditManagerId(d.managerEmployee ?? "");
    setEditIsActive(d.isActive !== false);
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!editName.trim()) return;

    await updateDivision({
      id: editingId,
      body: {
        name: editName.trim(),
        code: editCode.trim() || undefined,
        description: editDescription.trim() || undefined,
        managerEmployeeId: editManagerId || null,
        isActive: editIsActive,
      },
    }).unwrap();

    setEditingId(null);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this division?")) return;
    await deleteDivision(id).unwrap();
  }

  const getManagerLabel = (id?: string | null) => {
    if (!id) return "—";
    const found = employeeOptions.find((x) => x.id === id);
    return found?.label ?? id;
  };

  // ✅ NEW: open TL modal for a division
  function openTLModal(divId: string, divName: string) {
    setTlDivisionId(divId);
    setTlDivisionName(divName);
    setTlEmployeeId("");
    setTlOpen(true);
  }

  function isSameId(a: any, b: any) {
    if (!a || !b) return false;
    return String(a) === String(b);
  }

  function formatEmpShort(e: any) {
    return (
      `${e.firstName || ""} ${e.lastName || ""}`.trim() +
      ` (${e.employeeId || ""})`
    );
  }

  const getTLsForDivision = (divisionId: string) => {
    const list = (employees ?? []) as any[];
    return list
      .filter((e) => isSameId(e.division, divisionId) && e.level === "TL")
      .filter((e) => e.status !== "INACTIVE") // optional: only active TLs
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  };

  // ✅ NEW: promote selected employee to TL + assign division
  async function confirmCreateTL() {
    if (!tlDivisionId || !tlEmployeeId) return;

    const emp = employeeOptions.find((x) => x.id === tlEmployeeId)?.raw as
      | (Employee & any)
      | undefined;

    if (!emp) return;

    // Optional safety: warn if moving division
    const currentDiv = (emp as any).division;
    if (currentDiv && String(currentDiv) !== String(tlDivisionId)) {
      const ok = confirm(
        "This employee is already assigned to another division. Move them and set as TL?",
      );
      if (!ok) return;
    }

    await updateEmployee({
      id: tlEmployeeId,
      data: {
        division: tlDivisionId,
        level: "TL",
        reportsTo: null,
      } as any,
    }).unwrap();

    setTlOpen(false);
  }

  // ✅ Filter list inside modal: show ACTIVE employees first, and hide those already TL in same division
  const tlCandidateOptions = useMemo(() => {
    const list = (employees ?? []) as any[];
    return list
      .slice()
      .sort((a, b) => {
        // ACTIVE first
        const sa = a.status === "ACTIVE" ? 0 : 1;
        const sb = b.status === "ACTIVE" ? 0 : 1;
        if (sa !== sb) return sa - sb;
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      })
      .filter((e) => {
        // If already TL in same division, skip
        const sameDiv = String(e.division || "") === String(tlDivisionId || "");
        if (sameDiv && e.level === "TL") return false;
        return true;
      });
  }, [employees, tlDivisionId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Organization</h1>
        <p className="text-xs text-slate-500 mt-1">Divisions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Divisions</h2>
        </div>

        {/* Create */}
        <form
          onSubmit={onCreate}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className={labelCls}>Division Name *</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales"
            />
          </div>

          <div>
            <label className={labelCls}>Code</label>
            <input
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SALES"
            />
          </div>

          <div>
            <label className={labelCls}>Manager</label>
            <select
              className={inputCls}
              value={managerEmployeeId}
              onChange={(e) => setManagerEmployeeId(e.target.value)}
            >
              <option value="">— None —</option>
              {employeeOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <input
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 h-9 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            >
              + Add Division
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="mt-2 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Name</th>
                  <th className="text-left px-4 py-2 font-semibold">Code</th>
                  <th className="text-left px-4 py-2 font-semibold">Manager</th>
                  <th className="text-left px-4 py-2 font-semibold">Active</th>
                  <th className="text-right px-4 py-2 font-semibold w-[320px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : !divisions || divisions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  divisions.map((d) => {
                    const isEditing = editingId === d._id;
                    return (
                      <tr
                        key={d._id}
                        className="odd:bg-white even:bg-slate-50/50"
                      >
                        <td className="px-4 py-2">
                          {isEditing ? (
                            <input
                              className={inputCls}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">
                              {d.name}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          {isEditing ? (
                            <input
                              className={inputCls}
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                            />
                          ) : (
                            <span className="text-slate-600">
                              {d.code || "—"}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          {isEditing ? (
                            <select
                              className={inputCls}
                              value={editManagerId}
                              onChange={(e) => setEditManagerId(e.target.value)}
                            >
                              <option value="">— None —</option>
                              {employeeOptions.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-slate-600">
                              <div>{getManagerLabel(d.managerEmployee)}</div>

                              {/* ✅ NEW: show assigned TLs */}
                              <div className="mt-1 text-[11px] text-slate-500">
                                {(() => {
                                  const tls = getTLsForDivision(d._id);
                                  if (tls.length === 0)
                                    return <span>TL: —</span>;
                                  return (
                                    <span>
                                      TL:{" "}
                                      <span className="text-slate-700">
                                        {tls.map(formatEmpShort).join(", ")}
                                      </span>
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          {isEditing ? (
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editIsActive}
                                onChange={(e) =>
                                  setEditIsActive(e.target.checked)
                                }
                                className="accent-green-500"
                              />
                              <span className="text-slate-600">Active</span>
                            </label>
                          ) : (
                            <span
                              className={
                                d.isActive === false
                                  ? "text-rose-600"
                                  : "text-emerald-700"
                              }
                            >
                              {d.isActive === false ? "No" : "Yes"}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="px-3 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="px-3 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {/* ✅ NEW: Add TL */}
                                <button
                                  type="button"
                                  onClick={() => openTLModal(d._id, d.name)}
                                  className="px-3 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                                >
                                  + Add TL
                                </button>

                                <button
                                  type="button"
                                  onClick={() => startEdit(d)}
                                  className="px-3 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => onDelete(d._id)}
                                  className="px-3 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            Note: You can’t delete a division if employees are assigned to it.
          </div>
        </div>
      </div>

      {/* ✅ NEW: Create TL Modal */}
      {tlOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] max-w-[92vw] rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Create TL
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Promote an employee to <b>TL</b> inside division{" "}
                  <b>{tlDivisionName}</b>.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTlOpen(false)}
                className="text-xs px-4 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Select Employee</label>
                <select
                  className={inputCls}
                  value={tlEmployeeId}
                  onChange={(e) => setTlEmployeeId(e.target.value)}
                >
                  <option value="">-- Select Employee --</option>
                  {tlCandidateOptions.map((emp: any) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId}){" "}
                      {emp.status !== "ACTIVE" ? " • INACTIVE" : ""}
                      {emp.level ? ` • ${emp.level}` : ""}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400 mt-1">
                  This will set: <code>level = "TL"</code>,{" "}
                  <code>division = "{tlDivisionName}"</code>,{" "}
                  <code>reportsTo = null</code>.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTlOpen(false)}
                  className="px-5 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!tlEmployeeId || isPromoting}
                  onClick={confirmCreateTL}
                  className="px-6 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {isPromoting ? "Saving..." : "Create TL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
