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
// import DependentsTab from "./DependentsTab"; // ✅ commented
// import ImmigrationTab from "./ImmigrationTab"; // ✅ commented
import JobTab from "./JobTab";
import SalaryTab from "./SalaryTab";
// import TaxExemptionsTab from "./TaxExemptionsTab"; // ✅ commented
import ReportToTab from "./ReportToTab";
import LeaveTab from "../leave/LeaveTab";

type TabKey =
  | "personal"
  | "contact"
  | "emergency"
  | "job"
  | "salary"
  | "report"
  | "leave";

const tabs: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal Details" },
  { key: "contact", label: "Contact Details" },
  { key: "emergency", label: "Emergency Contacts" },
  { key: "job", label: "Job" },
  { key: "salary", label: "Salary" },
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4 text-center text-sm text-slate-500">
        Loading My Info...
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4 text-center text-sm text-green-500">
        Failed to load employee.
      </div>
    );
  }

  const fullName = `${employee.firstName ?? ""}${
    employee.lastName ? " " + employee.lastName : ""
  }`;

  const save = async (data: any) => {
    const res = await updateEmployee({ id: employee._id, data }).unwrap();

    if (isApprovalSubmittedResponse(res)) {
      setFlashMsg(res.message || "Request has been sent to Admin for approval.");
      mineQ.refetch?.();
      return res;
    }

    setFlashMsg("Employee updated successfully.");
    return res;
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <div className="flex flex-col lg:flex-row">
        {/* LEFT / TOP SECTION */}
        <div className="w-full lg:w-72 lg:min-h-screen bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
          {/* Profile Card */}
          <div className="flex flex-col items-center px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-200 mb-3 shrink-0" />
            <p className="text-[14px] sm:text-[15px] font-semibold text-slate-800 text-center break-words">
              {fullName || "Employee"}
            </p>

            {employee.employeeId ? (
              <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1 text-center break-all">
                {employee.employeeId}
              </p>
            ) : null}

            {isPimMode ? (
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 text-center">
                PIM · Employee Profile
              </p>
            ) : null}
          </div>

          {/* Mobile Tabs - horizontal scroll */}
          <div className="lg:hidden border-b border-slate-100">
            <div className="px-3 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-medium transition ${
                      active === t.key
                        ? "bg-[#fef4ea] text-[#f6901e] border border-[#f7c58b]"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden lg:block flex-1 py-3 text-[12px]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`w-full text-left px-6 py-3 transition ${
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
        <div className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-5">
          <div className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#e5e7f0] shadow-sm min-h-[calc(100vh-2rem)] lg:min-h-[76vh] flex flex-col overflow-hidden">
            {/* TOP STATUS BANNERS */}
            {(flashMsg || pendingForThisEmployee) && (
              <div className="px-4 sm:px-6 pt-4 sm:pt-5">
                {flashMsg && (
                  <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="text-sm text-green-800">{flashMsg}</div>
                    <button
                      className="text-xs text-green-700 underline text-left sm:text-right"
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
                    <div className="text-xs sm:text-sm text-amber-800 mt-1">
                      Your changes are waiting for Admin approval.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT */}
            <div className="flex-1 min-w-0 overflow-x-hidden">
              {active === "personal" && (
                <PersonalDetailsTab
                  employee={employee}
                  onSave={save}
                  isSaving={isSavingEmployee}
                />
              )}

              {active === "contact" && (
                <ContactDetailsTab
                  employee={employee}
                  onSave={save}
                  isSaving={isSavingEmployee}
                />
              )}

              {active === "emergency" && (
                <EmergencyContactsTab employeeId={employee._id} />
              )}

              {active === "job" && <JobTab employeeId={employee._id} />}
              {active === "salary" && <SalaryTab employeeId={employee._id} />}
              {active === "report" && <ReportToTab employeeId={employee._id} />}
              {active === "leave" && (
                <LeaveTab employeeId={isPimMode ? employee._id : undefined} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;