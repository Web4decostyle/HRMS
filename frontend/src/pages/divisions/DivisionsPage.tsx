import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useCreateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDivisionsTreeQuery,
  useUpdateDivisionMutation,
  type DivisionTree,
} from "../../features/divisions/divisionsApi";
import {
  useCreateSubDivisionMutation,
  useDeleteSubDivisionMutation,
  useGetSubDivisionsQuery,
  useUpdateSubDivisionMutation,
} from "../../features/divisions/subDivisionsApi";
import {
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  type Employee,
} from "../../features/employees/employeesApi";

/* ---------------- styles ---------------- */
const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-10 rounded-lg border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-[#f59e0b]/15";
const btnPrimary =
  "h-10 px-4 rounded-lg bg-[#f59e0b] text-white text-[12px] font-semibold hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed";
const btnOutline =
  "h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed";
const btnDanger =
  "h-9 px-3 rounded-lg bg-rose-600 text-white text-[12px] font-semibold hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed";

function safeId(v: any) {
  return v ? String(v) : "";
}
function clsx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

/* ======================= Reusable dropdowns (searchable) ======================= */

type Opt = { id: string; label: string };

function useOnClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (e: any) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function SearchSelect({
  label,
  valueId,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
}: {
  label: string;
  valueId: string | null;
  onChange: (id: string | null) => void;
  options: Opt[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(wrapRef, () => setOpen(false));

  const selected = options.find((o) => o.id === safeId(valueId))?.label ?? "";

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [options, q]);

  return (
    <div ref={wrapRef} className="relative">
      <label className={labelCls}>{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={clsx(
          inputCls,
          "flex items-center justify-between gap-2 text-left",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className={clsx(!selected && "text-slate-400")}>
          {selected || placeholder}
        </span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[12px] outline-none focus:ring-4 focus:ring-[#f59e0b]/15 focus:border-[#f59e0b]"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
                setQ("");
              }}
              className="w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50"
            >
              — None —
            </button>

            {filtered.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                  setQ("");
                }}
                className={clsx(
                  "w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50",
                  o.id === safeId(valueId) && "bg-amber-50"
                )}
              >
                {o.label}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-slate-500">
                No matches.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSearchSelect({
  label,
  valueIds,
  onChange,
  options,
  placeholder = "Add TL…",
  disabled,
}: {
  label: string;
  valueIds: string[];
  onChange: (ids: string[]) => void;
  options: Opt[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(wrapRef, () => setOpen(false));

  const selected = useMemo(() => {
    const set = new Set(valueIds.map(safeId));
    return options.filter((o) => set.has(o.id));
  }, [options, valueIds]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const set = new Set(valueIds.map(safeId));
    const base = options.filter((o) => !set.has(o.id));
    if (!t) return base;
    return base.filter((o) => o.label.toLowerCase().includes(t));
  }, [options, q, valueIds]);

  return (
    <div ref={wrapRef} className="relative">
      <label className={labelCls}>{label}</label>

      <div
        className={clsx(
          "min-h-[40px] rounded-lg border border-[#d5d7e5] bg-white px-2 py-2 flex flex-wrap gap-2 items-center",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-[12px] text-slate-400 px-1">{placeholder}</span>
        ) : (
          selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-50 border border-amber-100 text-[11px] text-slate-800"
            >
              {o.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={() =>
                    onChange(valueIds.filter((x) => safeId(x) !== o.id))
                  }
                  className="text-slate-500 hover:text-slate-900"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </span>
          ))
        )}

        <button
          type="button"
          onClick={() => !disabled && setOpen((s) => !s)}
          className={clsx(
            "ml-auto text-[12px] font-semibold text-amber-700 hover:opacity-80 px-2",
            disabled && "cursor-not-allowed"
          )}
        >
          + Add
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[12px] outline-none focus:ring-4 focus:ring-[#f59e0b]/15 focus:border-[#f59e0b]"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-auto">
            {filtered.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => {
                  onChange([...valueIds, o.id]);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50"
              >
                {o.label}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-slate-500">
                No more options.
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              className={btnOutline}
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ Page ============================ */

export default function DivisionsPage() {
  const { data: divisionsTree = [], isLoading: divLoading } =
    useGetDivisionsTreeQuery();

  const [createDivision, { isLoading: creatingDivision }] =
    useCreateDivisionMutation();
  const [updateDivision, { isLoading: updatingDivision }] =
    useUpdateDivisionMutation();
  const [deleteDivision, { isLoading: deletingDivision }] =
    useDeleteDivisionMutation();

  const { data: employees = [] } = useGetEmployeesQuery({ include: "all" });
  const [updateEmployee, { isLoading: savingEmployee }] =
    useUpdateEmployeeMutation();

  const employeeOptions: Opt[] = useMemo(() => {
    return (employees as any[]).map((e) => ({
      id: safeId(e._id),
      label:
        `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() +
        (e.employeeId ? ` (${e.employeeId})` : ""),
    }));
  }, [employees]);

  // Accepts either id or populated object
  const normalizeEmpId = (v: any) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object" && v._id) return safeId(v._id);
    return safeId(v);
  };

  const empLabel = (idOrObj?: any) => {
    const id = normalizeEmpId(idOrObj);
    if (!id) return "—";
    return employeeOptions.find((x) => x.id === id)?.label ?? "—";
  };

  // selection
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedSubDivisionId, setSelectedSubDivisionId] =
    useState<string>("");

  // load subs for selected division
  const {
    data: subDivisions = [],
    isLoading: subLoading,
    refetch: refetchSubs,
  } = useGetSubDivisionsQuery(
    { divisionId: selectedDivisionId },
    { skip: !selectedDivisionId }
  );

  const [createSubDivision, { isLoading: creatingSub }] =
    useCreateSubDivisionMutation();
  const [updateSubDivision, { isLoading: updatingSub }] =
    useUpdateSubDivisionMutation();
  const [deleteSubDivision, { isLoading: deletingSub }] =
    useDeleteSubDivisionMutation();

  // employees grouping
  const employeesInDivision = useMemo(() => {
    if (!selectedDivisionId) return [];
    return (employees as any[]).filter(
      (e) => safeId(e.division) === safeId(selectedDivisionId)
    );
  }, [employees, selectedDivisionId]);

  const employeesInSelectedSubDivision = useMemo(() => {
    if (!selectedSubDivisionId) return [];
    return employeesInDivision.filter(
      (e) => safeId(e.subDivision) === safeId(selectedSubDivisionId)
    );
  }, [employeesInDivision, selectedSubDivisionId]);

  const employeesUnassignedInDivision = useMemo(() => {
    return employeesInDivision.filter((e) => !e.subDivision);
  }, [employeesInDivision]);

  /* ---------------- division form + edit state ---------------- */
  const [divName, setDivName] = useState("");
  const [divCode, setDivCode] = useState("");
  const [divDesc, setDivDesc] = useState("");
  const [divManager, setDivManager] = useState<string | null>(null);
  const [editingDivisionId, setEditingDivisionId] = useState<string | null>(
    null
  );

  function resetDivisionForm() {
    setDivName("");
    setDivCode("");
    setDivDesc("");
    setDivManager(null);
    setEditingDivisionId(null);
  }

  async function handleSubmitDivision(e: FormEvent) {
    e.preventDefault();

    const payload: any = {
      name: divName.trim(),
      code: divCode.trim() || undefined,
      description: divDesc.trim() || undefined,

      // ✅ FIX: backend expects managerEmployeeId
      managerEmployeeId: divManager || null,
    };

    if (!payload.name) return;

    if (editingDivisionId) {
      await updateDivision({
        id: editingDivisionId,
        body: payload,
      } as any).unwrap();
      resetDivisionForm();
      return;
    }

    const created = await createDivision(payload).unwrap();
    resetDivisionForm();

    setSelectedDivisionId(safeId((created as any)._id));
    setSelectedSubDivisionId("");
  }

  function handleEditDivision(d: any) {
    setEditingDivisionId(safeId(d._id));
    setDivName(d?.name ?? "");
    setDivCode(d?.code ?? "");
    setDivDesc(d?.description ?? "");

    // API might return managerEmployee as id or populated object
    const mId = normalizeEmpId(d?.managerEmployee);
    setDivManager(mId || null);

    setSelectedDivisionId(safeId(d._id));
    setSelectedSubDivisionId("");
  }

  async function handleDeleteDivision(id: string) {
    // if currently selected, clear UI selection
    if (safeId(selectedDivisionId) === safeId(id)) {
      setSelectedDivisionId("");
      setSelectedSubDivisionId("");
    }
    if (safeId(editingDivisionId) === safeId(id)) {
      resetDivisionForm();
    }
    await deleteDivision(id as any).unwrap();
  }

  /* ---------------- sub-division form ---------------- */
  const [subName, setSubName] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subTLs, setSubTLs] = useState<string[]>([]);

  async function handleCreateSubDivision(e: FormEvent) {
    e.preventDefault();
    if (!selectedDivisionId) return;

    const payload: any = {
      name: subName.trim(),
      code: subCode.trim() || undefined,
      description: subDesc.trim() || undefined,

      // ✅ Keep this — if backend supports it, it will persist
      tlEmployees: subTLs,
    };

    if (!payload.name) return;

    const created = await createSubDivision({
      divisionId: selectedDivisionId,
      body: payload,
    }).unwrap();

    setSubName("");
    setSubCode("");
    setSubDesc("");
    setSubTLs([]);

    setSelectedSubDivisionId(safeId((created as any)._id));

    // ✅ Make sure UI updates after create
    await refetchSubs();
  }

  /* ---------------- assign employee ---------------- */
  const [employeeToAssign, setEmployeeToAssign] = useState<string>("");

  async function handleAssignEmployee() {
    if (!employeeToAssign || !selectedSubDivisionId) return;

    await updateEmployee({
      id: employeeToAssign,
      data: { subDivision: selectedSubDivisionId } as any,
    }).unwrap();

    setEmployeeToAssign("");
  }

  async function handleRemoveFromSub(employeeId: string) {
    await updateEmployee({
      id: employeeId,
      data: { subDivision: null } as any,
    }).unwrap();
  }

  /* ---------------- helpers for list display ---------------- */
  function TLPreview({ ids }: { ids?: any[] }) {
    const arr = Array.isArray(ids) ? ids : [];
    if (arr.length === 0) return <span className="text-slate-400">—</span>;

    // Works with ids OR populated employee objects
    const norm = arr
      .map((x) => (typeof x === "string" ? x : normalizeEmpId(x)))
      .filter(Boolean);

    if (norm.length === 0) return <span className="text-slate-400">—</span>;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {norm.slice(0, 2).map((id) => (
          <span
            key={id}
            className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[11px] text-slate-700"
          >
            {empLabel(id)}
          </span>
        ))}
        {norm.length > 2 && (
          <span className="text-[11px] text-slate-500">
            +{norm.length - 2} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="mb-4">
        <div className="text-[18px] font-bold text-slate-900">Divisions</div>
        <div className="text-[12px] text-slate-500">
          Division → Sub-Division → Employees
        </div>
      </div>

      {/* 3 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900">
              {editingDivisionId ? "Edit Division" : "Create Division"}
            </div>

            {editingDivisionId && (
              <button
                type="button"
                className={btnOutline}
                onClick={resetDivisionForm}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="p-4 space-y-3">
            <form className="space-y-3" onSubmit={handleSubmitDivision}>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={inputCls}
                  value={divName}
                  onChange={(e) => setDivName(e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Code</label>
                <input
                  className={inputCls}
                  value={divCode}
                  onChange={(e) => setDivCode(e.target.value)}
                />
              </div>

              <SearchSelect
                label="Manager"
                valueId={divManager}
                onChange={setDivManager}
                options={employeeOptions}
                placeholder="— None —"
              />

              <div>
                <label className={labelCls}>Description</label>
                <input
                  className={inputCls}
                  value={divDesc}
                  onChange={(e) => setDivDesc(e.target.value)}
                />
              </div>

              <button
                className={btnPrimary}
                disabled={creatingDivision || updatingDivision}
              >
                {creatingDivision || updatingDivision
                  ? "Saving…"
                  : editingDivisionId
                  ? "Save Changes"
                  : "Create Division"}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-200 p-3 space-y-2">
            {divLoading ? (
              <div className="text-[12px] text-slate-500">Loading…</div>
            ) : divisionsTree.length === 0 ? (
              <div className="text-[12px] text-slate-500">No divisions.</div>
            ) : (
              divisionsTree.map((d: any) => {
                const active = safeId(d._id) === safeId(selectedDivisionId);
                return (
                  <button
                    key={d._id}
                    onClick={() => {
                      setSelectedDivisionId(safeId(d._id));
                      setSelectedSubDivisionId("");
                    }}
                    className={clsx(
                      "w-full text-left rounded-xl border px-3 py-3",
                      active
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Sub-divisions: {d.subDivisions?.length ?? 0}
                        </div>

                        <div className="mt-2 text-[11px] text-slate-600">
                          <span className="font-semibold">Manager:</span>{" "}
                          {empLabel(d.managerEmployee)}
                        </div>
                      </div>

                      {/* ✅ Division actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={btnOutline}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDivision(d);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={btnDanger}
                          disabled={deletingDivision}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDivision(safeId(d._id));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Sub-Divisions</div>
            <div className="text-[12px] text-slate-500 mt-0.5">
              {selectedDivisionId
                ? "Manage sub-divisions under selected division"
                : "Select a division to manage sub-divisions"}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <form className="space-y-3" onSubmit={handleCreateSubDivision}>
              <div>
                <label className={labelCls}>Sub-Division Name</label>
                <input
                  className={inputCls}
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  disabled={!selectedDivisionId}
                />
              </div>

              <div>
                <label className={labelCls}>Code</label>
                <input
                  className={inputCls}
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  disabled={!selectedDivisionId}
                />
              </div>

              <MultiSearchSelect
                label="TL"
                valueIds={subTLs}
                onChange={setSubTLs}
                options={employeeOptions}
                placeholder="Add TL…"
                disabled={!selectedDivisionId}
              />

              <div>
                <label className={labelCls}>Description</label>
                <input
                  className={inputCls}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  disabled={!selectedDivisionId}
                />
              </div>

              <button
                className={btnPrimary}
                disabled={!selectedDivisionId || creatingSub}
              >
                {creatingSub ? "Saving…" : "Create Sub-Division"}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-200 p-3 space-y-2">
            {!selectedDivisionId ? (
              <div className="text-[12px] text-slate-500">
                Pick a division first.
              </div>
            ) : subLoading ? (
              <div className="text-[12px] text-slate-500">Loading…</div>
            ) : subDivisions.length === 0 ? (
              <div className="text-[12px] text-slate-500">
                No sub-divisions yet.
              </div>
            ) : (
              (subDivisions as any[]).map((s) => {
                const active = safeId(s._id) === safeId(selectedSubDivisionId);
                return (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSubDivisionId(safeId(s._id))}
                    className={clsx(
                      "w-full text-left rounded-xl border px-3 py-3",
                      active
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="text-[13px] font-bold text-slate-900">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Code: {s.code || "—"}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-600">
                      <span className="font-semibold">TL:</span>
                      <TLPreview ids={s.tlEmployees} />
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className={btnOutline}
                        onClick={(e) => {
                          e.stopPropagation();
                          // prefill form
                          setSubName(s.name ?? "");
                          setSubCode(s.code ?? "");
                          setSubDesc(s.description ?? "");
                          setSubTLs(
                            Array.isArray(s.tlEmployees)
                              ? s.tlEmployees
                                  .map((x: any) =>
                                    typeof x === "string"
                                      ? x
                                      : normalizeEmpId(x)
                                  )
                                  .filter(Boolean)
                              : []
                          );
                        }}
                      >
                        Edit (prefill)
                      </button>

                      <button
                        type="button"
                        className={btnDanger}
                        disabled={deletingSub}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubDivision({
                            divisionId: selectedDivisionId,
                            id: safeId(s._id),
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Employees</div>
            <div className="text-[12px] text-slate-500 mt-0.5">
              Select a sub-division to assign employees
            </div>
          </div>

          <div className="p-4">
            <label className={labelCls}>Assign employee (unassigned)</label>
            <select
              className={inputCls}
              value={employeeToAssign}
              onChange={(e) => setEmployeeToAssign(e.target.value)}
              disabled={!selectedSubDivisionId}
            >
              <option value="">Select…</option>
              {employeesUnassignedInDivision.map((e: any) => (
                <option key={e._id} value={e._id}>
                  {e.firstName} {e.lastName} ({e.employeeId})
                </option>
              ))}
            </select>

            <button
              className={clsx(btnPrimary, "mt-3")}
              type="button"
              onClick={handleAssignEmployee}
              disabled={
                !selectedSubDivisionId || !employeeToAssign || savingEmployee
              }
            >
              {savingEmployee ? "Saving…" : "Assign to Sub-Division"}
            </button>
          </div>

          <div className="border-t border-slate-200 p-4">
            {!selectedSubDivisionId ? (
              <div className="text-[12px] text-slate-500">
                Select a sub-division to view assigned employees.
              </div>
            ) : employeesInSelectedSubDivision.length === 0 ? (
              <div className="text-[12px] text-slate-500">
                No employees assigned.
              </div>
            ) : (
              <div className="space-y-2">
                {employeesInSelectedSubDivision.map((e: Employee) => (
                  <div
                    key={e._id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900">
                        {(e as any).firstName} {(e as any).lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {(e as any).employeeId}
                      </div>
                    </div>

                    <button
                      className={btnOutline}
                      disabled={savingEmployee}
                      onClick={() => handleRemoveFromSub(e._id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
