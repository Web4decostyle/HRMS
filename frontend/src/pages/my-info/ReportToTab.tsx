import { useState } from "react";
import {
  useGetSupervisorsQuery,
  useCreateSupervisorMutation,
  useDeleteSupervisorMutation,
  useGetSubordinatesQuery,
  useCreateSubordinateMutation,
  useDeleteSubordinateMutation,
} from "../../features/myInfo/myInfoApi";

import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-700 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function ReportToTab({ employeeId }: { employeeId: string }) {
  /* ------------------------------
        Fetch Data
  ------------------------------ */
  const { data: supervisors = [] } = useGetSupervisorsQuery(employeeId);
  const { data: subordinates = [] } = useGetSubordinatesQuery(employeeId);

  const { data: employees = [] } = useGetEmployeesQuery({}); // list employees for add modal

  const [addSupervisor] = useCreateSupervisorMutation();
  const [deleteSupervisor] = useDeleteSupervisorMutation();

  const [addSubordinate] = useCreateSubordinateMutation();
  const [deleteSubordinate] = useDeleteSubordinateMutation();

  /* ------------------------------
        Local Add Form State
  ------------------------------ */
  const [showSupAdd, setShowSupAdd] = useState(false);
  const [showSubAdd, setShowSubAdd] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reportingMethod, setReportingMethod] = useState("Direct");

  async function handleAddSupervisor() {
    if (!selectedEmployee) return alert("Select a supervisor");

    await addSupervisor({
      employeeId,
      data: {
        supervisorId: selectedEmployee,
        reportingMethod,
      },
    });

    setSelectedEmployee("");
    setShowSupAdd(false);
  }

  async function handleAddSubordinate() {
    if (!selectedEmployee) return alert("Select a subordinate");

    await addSubordinate({
      employeeId,
      data: {
        subordinateId: selectedEmployee,
        reportingMethod,
      },
    });

    setSelectedEmployee("");
    setShowSubAdd(false);
  }

  /* ------------------------------
        Render Section
  ------------------------------ */
  return (
    <>
      {/* Header */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Report To
        </h2>
      </div>

      <div className="px-7 py-5 space-y-8">
        {/* --------------------------
              SUPERVISORS
        --------------------------- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold text-slate-700">
              Assigned Supervisors
            </h3>

            <button
              type="button"
              onClick={() => {
                setSelectedEmployee("");
                setReportingMethod("Direct");
                setShowSupAdd(true);
              }}
              className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
            >
              + Add
            </button>
          </div>

          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Job Title</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Reporting Method
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {supervisors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  supervisors.map((s: any) => (
                    <tr key={s._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">
                        {s.supervisorId?.firstName} {s.supervisorId?.lastName}
                      </td>
                      <td className="px-3 py-2">{s.supervisorId?.jobTitle}</td>
                      <td className="px-3 py-2">{s.supervisorId?.email}</td>
                      <td className="px-3 py-2">{s.reportingMethod}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() =>
                            deleteSupervisor({ employeeId, id: s._id })
                          }
                          className="text-[11px] text-green-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --------------------------
              SUBORDINATES
        --------------------------- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold text-slate-700">
              Assigned Subordinates
            </h3>

            <button
              type="button"
              onClick={() => {
                setSelectedEmployee("");
                setReportingMethod("Direct");
                setShowSubAdd(true);
              }}
              className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
            >
              + Add
            </button>
          </div>

          <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-[#f5f6fb] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Job Title</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Reporting Method
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {subordinates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  subordinates.map((s: any) => (
                    <tr key={s._id} className="border-t border-[#f0f1f7]">
                      <td className="px-3 py-2">
                        {s.subordinateId?.firstName} {s.subordinateId?.lastName}
                      </td>
                      <td className="px-3 py-2">{s.subordinateId?.jobTitle}</td>
                      <td className="px-3 py-2">{s.subordinateId?.email}</td>
                      <td className="px-3 py-2">{s.reportingMethod}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() =>
                            deleteSubordinate({ employeeId, id: s._id })
                          }
                          className="text-[11px] text-green-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --------------------------
            ADD SUPERVISOR POPUP
      --------------------------- */}
      {showSupAdd && (
        <AddPopup
          title="Add Supervisor"
          employees={employees}
          selectedEmployee={selectedEmployee}
          reportingMethod={reportingMethod}
          onSelectEmployee={setSelectedEmployee}
          onSelectMethod={setReportingMethod}
          onCancel={() => setShowSupAdd(false)}
          onConfirm={handleAddSupervisor}
        />
      )}

      {/* --------------------------
            ADD SUBORDINATE POPUP
      --------------------------- */}
      {showSubAdd && (
        <AddPopup
          title="Add Subordinate"
          employees={employees}
          selectedEmployee={selectedEmployee}
          reportingMethod={reportingMethod}
          onSelectEmployee={setSelectedEmployee}
          onSelectMethod={setReportingMethod}
          onCancel={() => setShowSubAdd(false)}
          onConfirm={handleAddSubordinate}
        />
      )}
    </>
  );
}

/* -----------------------------------------------------
   POPUP COMPONENT (SUPERVISOR & SUBORDINATE)
----------------------------------------------------- */

function AddPopup({
  title,
  employees,
  selectedEmployee,
  reportingMethod,
  onSelectEmployee,
  onSelectMethod,
  onCancel,
  onConfirm,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-[420px] shadow-lg">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">
          {title}
        </h3>

        <div className="space-y-4">

          {/* Employee Select */}
          <div>
            <label className={labelCls}>Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => onSelectEmployee(e.target.value)}
              className={inputCls}
            >
              <option value="">-- Select Employee --</option>
              {employees?.map((emp: any) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.jobTitle || "N/A"})
                </option>
              ))}
            </select>
          </div>

          {/* Reporting Method */}
          <div>
            <label className={labelCls}>Reporting Method</label>
            <select
              value={reportingMethod}
              onChange={(e) => onSelectMethod(e.target.value)}
              className={inputCls}
            >
              <option value="Direct">Direct</option>
              <option value="Indirect">Indirect</option>
              <option value="Other">Other</option>
            </select>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-5 h-8 rounded-full bg-slate-200 text-[12px] text-slate-700 font-semibold hover:bg-slate-300"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}