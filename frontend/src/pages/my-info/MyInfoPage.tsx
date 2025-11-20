// frontend/src/pages/my-info/MyInfoPage.tsx
import { useState } from "react";
import {
  useGetMyEmployeeQuery,
  useUpdateEmployeeMutation,
} from "../../features/employees/employeesApi";

// TAB COMPONENTS (all live in this same folder)
import PersonalDetailsTab from "./PersonalDetailsTab";
import ContactDetailsTab from "./ContactDetailsTab";
import EmergencyContactsTab from "./EmergencyContactsTab";
import DependentsTab from "./DependentsTab";
import ImmigrationTab from "./ImmigrationTab";
import JobTab from "./JobTab";
import SalaryTab from "./SalaryTab";
import TaxExemptionsTab from "./TaxExemptionsTab";
import ReportToTab from "./ReportToTab";

type TabKey =
  | "personal"
  | "contact"
  | "emergency"
  | "dependents"
  | "immigration"
  | "job"
  | "salary"
  | "tax"
  | "report";

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
];

const MyInfoPage = () => {
  const [active, setActive] = useState<TabKey>("personal");

  const { data: employee, isLoading } = useGetMyEmployeeQuery();
  const [updateEmployee, { isLoading: isSavingEmployee }] =
    useUpdateEmployeeMutation();

  if (isLoading || !employee) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f5f6fa] text-sm text-slate-500">
        Loading My Info...
      </div>
    );
  }

  const fullName = `${employee.firstName ?? ""}${
    employee.lastName ? " " + employee.lastName : ""
  }`;

  return (
    <div className="flex h-full bg-[#f5f6fa]">
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-slate-100">
          <div className="h-24 w-24 rounded-full bg-slate-200 mb-3" />
          <p className="text-[13px] font-semibold text-slate-800 text-center">
            {fullName || "Employee"}
          </p>
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
        <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm min-h-[76vh] flex flex-col">
          {/* PERSONAL DETAILS */}
          {active === "personal" && (
            <PersonalDetailsTab
              employee={employee}
              onSave={(data) =>
                updateEmployee({ id: employee._id, data }).unwrap()
              }
              isSaving={isSavingEmployee}
            />
          )}

          {/* CONTACT DETAILS */}
          {active === "contact" && (
            <ContactDetailsTab
              employee={employee}
              onSave={(data) =>
                updateEmployee({ id: employee._id, data }).unwrap()
              }
              isSaving={isSavingEmployee}
            />
          )}

          {/* EMERGENCY CONTACTS */}
          {active === "emergency" && (
            <EmergencyContactsTab employeeId={employee._id} />
          )}

          {/* DEPENDENTS */}
          {active === "dependents" && (
            <DependentsTab employeeId={employee._id} />
          )}

          {/* IMMIGRATION */}
          {active === "immigration" && (
            <ImmigrationTab employeeId={employee._id} />
          )}

          {/* JOB / SALARY / TAX / REPORT-TO */}
          {active === "job" && <JobTab employeeId={employee._id} />}
          {active === "salary" && <SalaryTab employeeId={employee._id} />}
          {active === "tax" && (
            <TaxExemptionsTab employeeId={employee._id} />
          )}
          {active === "report" && <ReportToTab employeeId={employee._id} />}
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
