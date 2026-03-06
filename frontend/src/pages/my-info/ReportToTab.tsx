import { useMemo } from "react";
import {
  useGetEmployeeByIdQuery,
  useGetEmployeesQuery,
} from "../../features/employees/employeesApi";
import {
  useGetDivisionsQuery,
  type Division,
} from "../../features/divisions/divisionsApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const boxCls =
  "w-full min-h-10 rounded border border-[#d5d7e5] bg-[#fbfcff] px-3 py-2 text-[12px] text-slate-700";
const softCard =
  "rounded-xl border border-[#e3e5f0] bg-white overflow-hidden";
const tableHead = "bg-[#f5f6fb] text-slate-500";
const thCls = "px-3 py-2 text-left font-semibold text-[11px]";
const tdCls =
  "px-3 py-2 text-[11px] text-slate-700 border-t border-[#f0f1f7]";
const muted = "text-slate-400";

function fullName(e?: any) {
  return `${e?.firstName || ""} ${e?.lastName || ""}`.trim() || "—";
}
function safe(v: any) {
  return v ? String(v) : "—";
}

type Level = "MANAGER" | "TL" | "GRADE1" | "GRADE2";

export default function ReportToTab({ employeeId }: { employeeId: string }) {
  const { data: employee, isLoading, isError } =
    useGetEmployeeByIdQuery(employeeId);

  const { data: divisions = [], isLoading: divLoading } =
    useGetDivisionsQuery();

  const { data: allEmployees = [], isLoading: empLoading } =
    useGetEmployeesQuery({ include: "all" } as any);

  const divisionId = useMemo(() => {
    const d = (employee as any)?.division;
    return d ? String(d) : "";
  }, [employee]);

  const division: Division | null = useMemo(() => {
    if (!divisionId) return null;
    return divisions.find((d) => String(d._id) === String(divisionId)) || null;
  }, [divisions, divisionId]);

  const divisionManagerId = useMemo(() => {
    const id = (division as any)?.managerEmployee;
    return id ? String(id) : "";
  }, [division]);

  const divisionManager = useMemo(() => {
    if (!divisionManagerId) return null;
    return (
      allEmployees.find((e) => String(e._id) === String(divisionManagerId)) ||
      null
    );
  }, [divisionManagerId, allEmployees]);

  const level = useMemo(() => {
    return (((employee as any)?.level as Level) || "GRADE1") as Level;
  }, [employee]);

  const reportsToId = useMemo(() => {
    const r = (employee as any)?.reportsTo;
    return r ? String(r) : "";
  }, [employee]);

  const reportsToEmployee = useMemo(() => {
    if (!reportsToId) return null;
    return (
      allEmployees.find((e) => String(e._id) === String(reportsToId)) || null
    );
  }, [reportsToId, allEmployees]);

  const isManagerOfThisDivision = useMemo(() => {
    if (!divisionManagerId || !(employee as any)?._id) return false;
    return String((employee as any)._id) === String(divisionManagerId);
  }, [divisionManagerId, employee]);

  const reportingTL = useMemo(() => {
    if (!divisionId) return null;
    if (isManagerOfThisDivision) return null;

    if (level === "GRADE1" || level === "GRADE2") {
      return reportsToEmployee;
    }
    return null;
  }, [divisionId, isManagerOfThisDivision, level, reportsToEmployee]);

  const reportingManager = useMemo(() => {
    if (!divisionId) return null;
    if (isManagerOfThisDivision) return null;

    if (level === "TL") {
      return divisionManager;
    }

    if (level === "GRADE1" || level === "GRADE2") {
      const tl = reportsToEmployee;
      const mgrId = tl ? String((tl as any).reportsTo || "") : "";
      const mgr = mgrId
        ? allEmployees.find((e) => String(e._id) === String(mgrId)) || null
        : null;
      return mgr || divisionManager || null;
    }

    return null;
  }, [
    divisionId,
    isManagerOfThisDivision,
    level,
    divisionManager,
    reportsToEmployee,
    allEmployees,
  ]);

  if (isLoading || divLoading || empLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-7 py-6 text-[12px] text-slate-500">
        Loading...
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="px-4 sm:px-6 lg:px-7 py-6 text-[12px] text-rose-600">
        Failed to load employee.
      </div>
    );
  }

  const notAllocated = !divisionId;

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-7 py-4 border-b border-[#edf0f7] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">
            Report To
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Auto-synced from division assignment & hierarchy (read-only).
          </p>
        </div>

        <span className="inline-flex w-fit text-[11px] px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
          Read only
        </span>
      </div>

      <div className="px-4 sm:px-6 lg:px-7 py-5 space-y-6 sm:space-y-8">
        {/* Allocation status */}
        <div className="rounded-xl border border-[#e3e5f0] bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Division</label>
              <div className={boxCls}>
                {notAllocated ? (
                  <span className="text-rose-600 font-semibold">
                    Not allocated to any division
                  </span>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {division?.name || "—"}
                  </span>
                )}
              </div>
              {!notAllocated && isManagerOfThisDivision && (
                <div className="text-[10px] text-emerald-700 mt-1">
                  ✅ This employee is the manager of this division.
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Level</label>
              <div className={boxCls}>
                <span className="font-semibold text-slate-800">
                  {safe(level)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Level is stored on employee (auto rules apply in backend).
              </div>
            </div>

            <div>
              <label className={labelCls}>Employee reportsTo (raw)</label>
              <div className={boxCls}>
                {reportsToEmployee ? (
                  <span className="text-slate-800 break-words">
                    {fullName(reportsToEmployee)}{" "}
                    <span className="text-slate-400">
                      ({(reportsToEmployee as any).employeeId || "—"})
                    </span>
                  </span>
                ) : (
                  <span className={muted}>—</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                (For Grade → TL, For TL → Manager)
              </div>
            </div>
          </div>
        </div>

        {/* Reporting badges */}
        <div className="rounded-xl border border-[#e3e5f0] bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-700 mb-3">
            Reporting (calculated)
          </div>

          {notAllocated ? (
            <div className="text-[12px] text-rose-600">
              Employee is not allocated to any division. Assign a division to
              enable reporting chain.
            </div>
          ) : isManagerOfThisDivision ? (
            <div className="text-[12px] text-emerald-700">
              This employee is the <b>Division Manager</b> for{" "}
              <b>{division?.name}</b>. No reporting manager is required.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500">
                  Reporting Manager
                </div>
                <div className="mt-1 text-[12px] font-semibold text-slate-800 break-words">
                  {reportingManager ? fullName(reportingManager) : "—"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 break-all">
                  {reportingManager
                    ? (reportingManager as any).email || "—"
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500">
                  Reporting TL
                </div>
                <div className="mt-1 text-[12px] font-semibold text-slate-800 break-words">
                  {reportingTL ? fullName(reportingTL) : "—"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 break-all">
                  {reportingTL ? (reportingTL as any).email || "—" : "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Division Manager */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            Division Manager (synced)
          </h3>

          {/* Mobile cards */}
          <div className="block lg:hidden">
            {notAllocated ? (
              <div className="rounded-xl border border-[#e3e5f0] bg-white px-4 py-6 text-center text-[11px] text-slate-400">
                No division selected (employee not allocated)
              </div>
            ) : !divisionManager ? (
              <div className="rounded-xl border border-[#e3e5f0] bg-white px-4 py-6 text-center text-[11px] text-rose-600">
                No manager set for this division (configure it in Divisions)
              </div>
            ) : (
              <div className="rounded-xl border border-[#e3e5f0] bg-white p-4 space-y-3">
                <div>
                  <div className="text-slate-500 text-[11px] font-medium">
                    Name
                  </div>
                  <div className="text-slate-800 text-[12px] mt-0.5">
                    {fullName(divisionManager)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] font-medium">
                    Employee Id
                  </div>
                  <div className="text-slate-800 text-[12px] mt-0.5">
                    {(divisionManager as any).employeeId || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] font-medium">
                    Email
                  </div>
                  <div className="text-slate-800 text-[12px] mt-0.5 break-all">
                    {(divisionManager as any).email || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className={`${softCard} hidden lg:block overflow-x-auto`}>
            <table className="w-full min-w-[700px]">
              <thead className={tableHead}>
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Employee Id</th>
                  <th className={thCls}>Email</th>
                </tr>
              </thead>
              <tbody>
                {notAllocated ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-[11px] text-slate-400"
                    >
                      No division selected (employee not allocated)
                    </td>
                  </tr>
                ) : !divisionManager ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-8 text-center text-[11px] text-rose-600"
                    >
                      No manager set for this division (configure it in
                      Divisions)
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className={tdCls}>{fullName(divisionManager)}</td>
                    <td className={tdCls}>
                      {(divisionManager as any).employeeId || "—"}
                    </td>
                    <td className={tdCls}>
                      {(divisionManager as any).email || "—"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!notAllocated && division && (
            <div className="text-[10px] text-slate-400 mt-2">
              Manager is pulled from Division settings and is not editable here.
            </div>
          )}
        </div>

        {/* Division details */}
        {!notAllocated && (
          <div className="rounded-xl border border-[#e3e5f0] bg-white p-4">
            <div className="text-[12px] font-semibold text-slate-700 mb-2">
              Division details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-500">Division:</span>{" "}
                <span className="font-semibold">{division?.name || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Manager EmployeeId:</span>{" "}
                <span className="font-semibold">{divisionManagerId || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Employee DivisionId:</span>{" "}
                <span className="font-semibold">{divisionId || "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}