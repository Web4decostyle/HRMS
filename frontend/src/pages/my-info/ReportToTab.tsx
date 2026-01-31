import { useEffect, useMemo, useState } from "react";
import {
  useGetEmployeeByIdQuery,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
  type Employee,
} from "../../features/employees/employeesApi";
import { useGetDivisionsQuery, type Division } from "../../features/divisions/divisionsApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-700 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

type Level = "MANAGER" | "TL" | "GRADE1" | "GRADE2";

export default function ReportToTab({ employeeId }: { employeeId: string }) {
  const { data: employee, isLoading, isError, refetch } =
    useGetEmployeeByIdQuery(employeeId);

  const { data: divisions = [], isLoading: divLoading } = useGetDivisionsQuery();

  // Pull all employees once; filter client-side
  const { data: allEmployees = [] } = useGetEmployeesQuery({ include: "all" } as any);

  const [updateEmployee, { isLoading: saving }] = useUpdateEmployeeMutation();

  const [divisionId, setDivisionId] = useState<string>("");
  const [level, setLevel] = useState<Level>("GRADE1");
  const [reportsTo, setReportsTo] = useState<string>("");

  // Initialize local state from employee
  useEffect(() => {
    if (!employee) return;
    setDivisionId(((employee as any).division as string) || "");
    setLevel((((employee as any).level as Level) || "GRADE1") as Level);
    setReportsTo((((employee as any).reportsTo as string) || "") as string);
  }, [employee]);

  const division: Division | null = useMemo(() => {
    if (!divisionId) return null;
    return divisions.find((d) => d._id === divisionId) || null;
  }, [divisionId, divisions]);

  const managerEmployeeId = (division as any)?.managerEmployee as string | null | undefined;

  const manager = useMemo(() => {
    if (!managerEmployeeId) return null;
    return allEmployees.find((e) => e._id === managerEmployeeId) || null;
  }, [managerEmployeeId, allEmployees]);

  const tlOptions = useMemo(() => {
    if (!divisionId) return [];
    return allEmployees
      .filter(
        (e: any) =>
          String(e.division || "") === String(divisionId) &&
          e.level === "TL" &&
          e.status !== "INACTIVE"
      )
      .sort((a, b) => (a.firstName || "").localeCompare(b.firstName || ""));
  }, [allEmployees, divisionId]);

  const currentTL = useMemo(() => {
    if (!reportsTo) return null;
    return allEmployees.find((e) => e._id === reportsTo) || null;
  }, [reportsTo, allEmployees]);

  const mySubordinates = useMemo(() => {
    if (!employee) return [];
    if ((employee as any).level !== "TL") return [];
    return allEmployees.filter(
      (e: any) =>
        String(e.division || "") === String(divisionId) &&
        String(e.reportsTo || "") === String(employee._id) &&
        (e.level === "GRADE1" || e.level === "GRADE2")
    );
  }, [allEmployees, employee, divisionId]);

  const myTLs = useMemo(() => {
    if (!employee) return [];
    if ((employee as any).level !== "MANAGER") return [];
    return allEmployees.filter(
      (e: any) => String(e.division || "") === String(divisionId) && e.level === "TL"
    );
  }, [allEmployees, employee, divisionId]);

  function onDivisionChange(next: string) {
    setDivisionId(next);

    // ✅ If division changes, reportsTo must be re-selected from that division
    setReportsTo("");
  }

  async function onSave() {
    if (!employee) return;

    // ✅ enforce rules
    let nextReportsTo: string | null = reportsTo || null;

    if (level === "MANAGER") nextReportsTo = null;
    if (level === "TL") nextReportsTo = null;

    if ((level === "GRADE1" || level === "GRADE2") && !divisionId) {
      alert("Select a Division first.");
      return;
    }
    if ((level === "GRADE1" || level === "GRADE2") && !nextReportsTo) {
      alert("Select a TL for Grade1/Grade2.");
      return;
    }

    await updateEmployee({
      id: employeeId,
      data: {
        division: divisionId || null,
        level,
        reportsTo: nextReportsTo,
      } as any,
    }).unwrap();

    await refetch();
  }

  if (isLoading) {
    return <div className="px-7 py-6 text-[12px] text-slate-500">Loading...</div>;
  }

  if (isError || !employee) {
    return (
      <div className="px-7 py-6 text-[12px] text-rose-600">
        Failed to load employee.
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="px-7 py-4 border-b border-[#edf0f7] flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">Report To</h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Division-based hierarchy (Manager → TL → Grade1/Grade2)
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="px-7 py-5 space-y-8">
        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ✅ NEW: Division dropdown */}
          <div>
            <label className={labelCls}>Division</label>
            <select
              value={divisionId}
              onChange={(e) => onDivisionChange(e.target.value)}
              className={inputCls}
            >
              <option value="">
                {divLoading ? "Loading..." : "-- Select Division --"}
              </option>
              {divisions
                .filter((d) => d.isActive !== false)
                .map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
            </select>
            <div className="text-[10px] text-slate-400 mt-1">
              Changing division will clear Team Lead selection.
            </div>
          </div>

          <div>
            <label className={labelCls}>Level</label>
            <select
              value={level}
              onChange={(e) => {
                const v = e.target.value as Level;
                setLevel(v);
                if (v === "MANAGER" || v === "TL") setReportsTo("");
              }}
              className={inputCls}
            >
              <option value="MANAGER">MANAGER</option>
              <option value="TL">TL</option>
              <option value="GRADE1">GRADE1</option>
              <option value="GRADE2">GRADE2</option>
            </select>
          </div>

          {(level === "GRADE1" || level === "GRADE2") && (
            <div className="md:col-span-2">
              <label className={labelCls}>Team Lead (reportsTo)</label>
              <select
                value={reportsTo}
                onChange={(e) => setReportsTo(e.target.value)}
                className={inputCls}
                disabled={!divisionId}
              >
                <option value="">
                  {!divisionId ? "Select Division first" : "-- Select TL --"}
                </option>
                {tlOptions.map((tl: Employee) => (
                  <option key={tl._id} value={tl._id}>
                    {tl.firstName} {tl.lastName} ({tl.employeeId})
                  </option>
                ))}
              </select>

              {currentTL && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Selected TL:{" "}
                  <b>
                    {currentTL.firstName} {currentTL.lastName}
                  </b>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Division manager */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            Division Manager
          </h3>

          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Employee Id</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {!divisionId ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                      No division selected
                    </td>
                  </tr>
                ) : !manager ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                      No manager set for this division
                    </td>
                  </tr>
                ) : (
                  <tr className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      {manager.firstName} {manager.lastName}
                    </td>
                    <td className="px-3 py-2">{manager.employeeId}</td>
                    <td className="px-3 py-2">{manager.email}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TL team */}
        {(employee as any).level === "TL" && (
          <div>
            <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
              My Team (Grade1/Grade2)
            </h3>

            <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="bg-[#f5f6fb] text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Level</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubordinates.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                        No direct reports
                      </td>
                    </tr>
                  ) : (
                    mySubordinates.map((s: any) => (
                      <tr key={s._id} className="border-t border-[#f0f1f7]">
                        <td className="px-3 py-2">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-3 py-2">{s.level}</td>
                        <td className="px-3 py-2">{s.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manager TL list */}
        {(employee as any).level === "MANAGER" && (
          <div>
            <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
              TLs in My Division
            </h3>

            <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="bg-[#f5f6fb] text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Employee Id</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {myTLs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                        No TLs found in this division
                      </td>
                    </tr>
                  ) : (
                    myTLs.map((s: any) => (
                      <tr key={s._id} className="border-t border-[#f0f1f7]">
                        <td className="px-3 py-2">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-3 py-2">{s.employeeId}</td>
                        <td className="px-3 py-2">{s.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
