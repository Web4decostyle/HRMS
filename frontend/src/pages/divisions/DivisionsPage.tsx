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

export default function DivisionsPage() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();
  const { data: employees } = useGetEmployeesQuery({ include: "all" });

  const [createDivision, { isLoading: isCreating }] =
    useCreateDivisionMutation();
  const [updateDivision] = useUpdateDivisionMutation();
  const [deleteDivision, { isLoading: isDeleting }] =
    useDeleteDivisionMutation();

  // Promote employee to TL
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
      .map((e: any) => ({
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
  const [tlEmployeeId, setTlEmployeeId] = useState<string>(""); // ✅ NEW: TL like manager

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editManagerId, setEditManagerId] = useState<string>("");
  const [editTlId, setEditTlId] = useState<string>(""); // ✅ NEW
  const [editIsActive, setEditIsActive] = useState(true);

  const getManagerLabel = (id?: string | null) => {
    if (!id) return "—";
    const found = employeeOptions.find((x) => x.id === id);
    return found?.label ?? id;
  };

  const getTLsForDivision = (divisionId: string) => {
    const list = (employees ?? []) as any[];
    return list
      .filter((e) => isSameId(e.division, divisionId) && e.level === "TL")
      .filter((e) => e.status !== "INACTIVE")
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  };

  // ✅ Promote selected employee to TL + assign division
  async function assignTL(divisionId: string, employeeId: string) {
    if (!divisionId || !employeeId) return;

    const emp = employeeOptions.find((x) => x.id === employeeId)?.raw as
      | (Employee & any)
      | undefined;
    if (!emp) return;

    // Optional safety: warn if moving division
    const currentDiv = (emp as any).division;
    if (currentDiv && String(currentDiv) !== String(divisionId)) {
      const ok = confirm(
        "This employee is already assigned to another division. Move them and set as TL?",
      );
      if (!ok) return;
    }

    await updateEmployee({
      id: employeeId,
      data: {
        division: divisionId,
        level: "TL",
        reportsTo: null,
      } as any,
    }).unwrap();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const created = await createDivision({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      managerEmployeeId: managerEmployeeId || null,
    }).unwrap();

    // ✅ If TL selected during create, assign it to the newly created division
    const newDivisionId = (created as any)?._id;
    if (newDivisionId && tlEmployeeId) {
      await assignTL(newDivisionId, tlEmployeeId);
    }

    setName("");
    setCode("");
    setDescription("");
    setManagerEmployeeId("");
    setTlEmployeeId("");
  }

  function startEdit(d: any) {
    setEditingId(d._id);
    setEditName(d.name ?? "");
    setEditCode(d.code ?? "");
    setEditDescription(d.description ?? "");
    setEditManagerId(d.managerEmployee ?? "");
    setEditIsActive(d.isActive !== false);

    // ✅ Preselect TL if exists
    const tls = getTLsForDivision(d._id);
    setEditTlId(tls[0]?._id ?? "");
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

    // ✅ Assign TL (if chosen)
    if (editTlId) {
      await assignTL(editingId, editTlId);
    }

    setEditingId(null);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this division?")) return;
    await deleteDivision(id).unwrap();
  }

  // ✅ TL options (same shape as manager, but we can keep everyone selectable)
  // If you want to hide TLs already in same division etc, we can filter further.
  const tlSelectOptions = useMemo(() => {
    const list = (employees ?? []) as any[];
    return list.slice().sort((a, b) => {
      const sa = a.status === "ACTIVE" ? 0 : 1;
      const sb = b.status === "ACTIVE" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      );
    });
  }, [employees]);

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
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-5 gap-4"
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

          {/* ✅ NEW: TL dropdown right after Manager */}
          <div>
            <label className={labelCls}>TL</label>
            <select
              className={inputCls}
              value={tlEmployeeId}
              onChange={(e) => setTlEmployeeId(e.target.value)}
            >
              <option value="">— None —</option>
              {tlSelectOptions.map((emp: any) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                  {emp.status !== "ACTIVE" ? " • INACTIVE" : ""}
                  {emp.level ? ` • ${emp.level}` : ""}
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

          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={isCreating || isPromoting}
              className="px-4 h-9 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            >
              {isCreating ? "Saving..." : "+ Add Division"}
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
                  <th className="text-left px-4 py-2 font-semibold">TL</th>
                  <th className="text-left px-4 py-2 font-semibold">Active</th>
                  <th className="text-right px-4 py-2 font-semibold w-[280px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : !divisions || divisions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  divisions.map((d) => {
                    const isEditing = editingId === d._id;
                    const tls = getTLsForDivision(d._id);

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
                            <span className="text-slate-600">
                              {getManagerLabel(d.managerEmployee)}
                            </span>
                          )}
                        </td>

                        {/* ✅ NEW: TL column (editable like manager) */}
                        <td className="px-4 py-2">
                          {isEditing ? (
                            <select
                              className={inputCls}
                              value={editTlId}
                              onChange={(e) => setEditTlId(e.target.value)}
                            >
                              <option value="">— None —</option>
                              {tlSelectOptions.map((emp: any) => (
                                <option key={emp._id} value={emp._id}>
                                  {emp.firstName} {emp.lastName} (
                                  {emp.employeeId})
                                  {emp.status !== "ACTIVE" ? " • INACTIVE" : ""}
                                  {emp.level ? ` • ${emp.level}` : ""}
                                </option>
                              ))}
                            </select>
                          ) : tls.length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <div className="space-y-1">
                              {tls.map((emp) => (
                                <div
                                  key={emp._id}
                                  className="text-slate-600 leading-tight"
                                >
                                  {formatEmpShort(emp)}
                                </div>
                              ))}
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
                                  disabled={isPromoting}
                                  className="px-3 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60"
                                >
                                  {isPromoting ? "Saving..." : "Save"}
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
    </div>
  );
}
