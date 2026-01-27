// frontend/src/pages/my-info/MyInfoPage.tsx
import { useMemo, useState } from "react";
import {
  useGetMyEmployeeQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  isApprovalSubmittedResponse,
} from "../../features/employees/employeesApi";

import { useGetMineQuery } from "../../features/changeRequests/changeRequestsApi";

// TAB COMPONENTS
import PersonalDetailsTab from "./PersonalDetailsTab";
import ContactDetailsTab from "./ContactDetailsTab";
import EmergencyContactsTab from "./EmergencyContactsTab";
import DependentsTab from "./DependentsTab";
import ImmigrationTab from "./ImmigrationTab";
import JobTab from "./JobTab";
import SalaryTab from "./SalaryTab";
import TaxExemptionsTab from "./TaxExemptionsTab";
import ReportToTab from "./ReportToTab";
import LeaveTab from "../leave/LeaveTab";

type TabKey =
  | "personal"
  | "contact"
  | "emergency"
  | "dependents"
  | "immigration"
  | "job"
  | "salary"
  | "tax"
  | "report"
  | "leave";

const tabs: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal Details" },
  { key: "contact", label: "Contact Details" },
  { key: "emergency", label: "Emergency Contacts" },
  { key: "dependents", label: "Dependents" },
  { key: "immigration", label: "Immigration" },
  { key: "job", label: "Job" },
  { key: "salary", label: "Salary" },
  { key: "tax", label: "Tax Exemptions" },
  { key: "report", label: "Report-to" },
  { key: "leave", label: "Leave" },
];

type MyInfoPageProps = {
  employeeId?: string; // PIM mode
};

const MyInfoPage = ({ employeeId }: MyInfoPageProps) => {
  const [active, setActive] = useState<TabKey>("personal");
  const [flashMsg, setFlashMsg] = useState<string>("");

  const isPimMode = !!employeeId;

  const myQ = useGetMyEmployeeQuery(undefined, { skip: isPimMode });
  const byIdQ = useGetEmployeeByIdQuery(employeeId!, { skip: !isPimMode });

  const employee = (isPimMode ? byIdQ.data : myQ.data) as any;
  const isLoading = isPimMode ? byIdQ.isLoading : myQ.isLoading;
  const isError = isPimMode ? byIdQ.isError : false;

  const [updateEmployee, { isLoading: isSavingEmployee }] =
    useUpdateEmployeeMutation();

  // ✅ Track own change requests so we can show "Request pending"
  const mineQ = useGetMineQuery(undefined, {
    skip: !employee?._id,
    pollingInterval: 4000,
  });

  const pendingForThisEmployee = useMemo(() => {
    const items = (mineQ.data as any[]) || [];
    if (!employee?._id) return null;

    return (
      items.find(
        (r) =>
          r.status === "PENDING" &&
          r.modelName === "Employee" &&
          String(r.targetId) === String(employee._id)
      ) || null
    );
  }, [mineQ.data, employee?._id]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f5f6fa] text-sm text-slate-500">
        Loading My Info...
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f5f6fa] text-sm text-green-500">
        Failed to load employee.
      </div>
    );
  }

  const fullName = `${employee.firstName ?? ""}${
    employee.lastName ? " " + employee.lastName : ""
  }`;

  const save = async (data: any) => {
    const res = await updateEmployee({ id: employee._id, data }).unwrap();

    // ✅ HR flow: request created
    if (isApprovalSubmittedResponse(res)) {
      setFlashMsg(res.message || "Request has been sent to Admin for approval.");
      mineQ.refetch?.();
      return res;
    }

    // ✅ Admin flow: updated directly
    setFlashMsg("Employee updated successfully.");
    return res;
  };

  return (
    <div className="flex h-full bg-[#f5f6fa]">
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-slate-100">
          <div className="h-24 w-24 rounded-full bg-slate-200 mb-3" />
          <p className="text-[13px] font-semibold text-slate-800 text-center">
            {fullName || "Employee"}
          </p>
          {employee.employeeId ? (
            <p className="text-[11px] text-slate-500 mt-1">
              {employee.employeeId}
            </p>
          ) : null}
          {isPimMode ? (
            <p className="text-[10px] text-slate-400 mt-1">
              PIM · Employee Profile
            </p>
          ) : null}
        </div>

        <nav className="flex-1 py-3 text-[12px]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`w-full text-left px-6 py-2.5 ${
                active === t.key
                  ? "bg-[#fef4ea] text-[#f6901e] font-semibold border-l-2 border-[#f7941d]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm min-h-[76vh] flex flex-col overflow-hidden">
          {/* ✅ TOP STATUS BANNERS */}
          {(flashMsg || pendingForThisEmployee) && (
            <div className="px-6 pt-5">
              {flashMsg && (
                <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start justify-between gap-3">
                  <div className="text-sm text-green-800">{flashMsg}</div>
                  <button
                    className="text-xs text-green-700 underline"
                    onClick={() => setFlashMsg("")}
                  >
                    dismiss
                  </button>
                </div>
              )}

              {pendingForThisEmployee && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="text-sm font-semibold text-amber-900">
                    Request pending
                  </div>
                  <div className="text-xs text-amber-800 mt-1">
                    Your changes are waiting for Admin approval.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PERSONAL DETAILS */}
          {active === "personal" && (
            <PersonalDetailsTab
              employee={employee}
              onSave={save}
              isSaving={isSavingEmployee}
            />
          )}

          {/* CONTACT DETAILS */}
          {active === "contact" && (
            <ContactDetailsTab
              employee={employee}
              onSave={save}
              isSaving={isSavingEmployee}
            />
          )}

          {/* EMERGENCY CONTACTS */}
          {active === "emergency" && (
            <EmergencyContactsTab employeeId={employee._id} />
          )}

          {/* DEPENDENTS */}
          {active === "dependents" && <DependentsTab employeeId={employee._id} />}

          {/* IMMIGRATION */}
          {active === "immigration" && (
            <ImmigrationTab employeeId={employee._id} />
          )}

          {/* JOB / SALARY / TAX / REPORT-TO */}
          {active === "job" && <JobTab employeeId={employee._id} />}
          {active === "salary" && <SalaryTab employeeId={employee._id} />}
          {active === "tax" && <TaxExemptionsTab employeeId={employee._id} />}
          {active === "report" && <ReportToTab employeeId={employee._id} />}
          {active === "leave" && (
            <LeaveTab employeeId={isPimMode ? employee._id : undefined} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
