// frontend/src/pages/pim/EmployeeProfilePage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from "../../features/employees/employeesApi";
import { useGetDivisionsQuery } from "../../features/divisions/divisionsApi";
import TransferDivisionModal from "../../components/employees/TransferDivisionModal";

function isValidObjectId(id?: string) {
  return !!id && /^[a-f\d]{24}$/i.test(id);
}

function getDivisionIdFromEmployee(emp: any): string | null {
  if (!emp) return null;

  const div = emp.division;
  if (!div) return null;

  // If backend returns ObjectId string
  if (typeof div === "string") return div;

  // If backend returns populated object
  if (typeof div === "object" && div._id) return String(div._id);

  return null;
}

function getDivisionNameFromEmployee(emp: any): string | null {
  if (!emp) return null;

  const div = emp.division;
  if (!div) return null;

  // If populated object contains name
  if (typeof div === "object" && div.name) return String(div.name);

  return null;
}

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const validId = isValidObjectId(id);

  const {
    data: employee,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEmployeeByIdQuery(id as string, {
    skip: !validId,
  });

  const { data: divisions = [], isLoading: divLoading } = useGetDivisionsQuery();

  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const [openTransfer, setOpenTransfer] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const currentDivisionId = useMemo(
    () => getDivisionIdFromEmployee(employee as any),
    [employee]
  );

  const divisionName = useMemo(() => {
    // Prefer populated division name (fast path)
    const populatedName = getDivisionNameFromEmployee(employee as any);
    if (populatedName) return populatedName;

    // Else map by id using divisions list
    if (!employee) return "—";
    const divId = getDivisionIdFromEmployee(employee as any);
    if (!divId) return "—";
    const found = divisions.find((d) => String(d._id) === String(divId));
    return found?.name ?? "—";
  }, [employee, divisions]);

  async function doTransferDivision(nextDivisionId: string | null) {
    if (!validId || !id) return;

    setLocalError(null);
    try {
      await updateEmployee({
        id,
        data: { division: nextDivisionId },
      }).unwrap();

      await refetch();
    } catch (e: any) {
      setLocalError(
        e?.data?.message ||
          e?.message ||
          "Failed to transfer division. Please try again."
      );
      throw e;
    }
  }

  // 🔴 This is YOUR current issue: URL is literally /employees/:id
  if (!validId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-rose-700">
          Employee not found. (Invalid employee id in URL)
        </div>
        {/* <div className="mt-2 text-xs text-slate-500">
          Open an employee using a real id: <code>/employees/&lt;mongoId&gt;</code>
        </div> */}

        <button
          className="mt-4 px-4 h-9 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
          onClick={() => navigate("/employees")}
        >
          Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  if (isError || !employee) {
    const msg =
      (error as any)?.data?.message ||
      (error as any)?.error ||
      "Employee not found.";

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="text-sm text-rose-700">{msg}</div>
        <button
          className="mt-4 px-4 h-9 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
          onClick={() => navigate("/employees")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Employee ID: {employee.employeeId}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="px-4 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
        >
          Back
        </button>
      </div>

      {localError && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
          {localError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Organization Details
          </h2>

          <button
            type="button"
            onClick={() => setOpenTransfer(true)}
            className="px-4 h-9 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            disabled={isUpdating || divLoading}
          >
            Transfer Division
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              Division
            </div>
            <div className="mt-1 text-slate-800 font-medium">{divisionName}</div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              Status
            </div>
            <div className="mt-1 text-slate-800 font-medium">
              {employee.status}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
            <div className="text-[11px] font-semibold text-slate-500">Email</div>
            <div className="mt-1 text-slate-800 font-medium">
              {employee.email}
            </div>
          </div>
        </div>
      </div>

      <TransferDivisionModal
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        currentDivisionId={currentDivisionId}
        onConfirm={doTransferDivision}
      />
    </div>
  );
}
