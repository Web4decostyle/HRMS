// frontend/src/pages/employees/EmployeesPage.tsx
import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

export default function EmployeesPage() {
  const { data: employees, isLoading, isError } = useGetEmployeesQuery();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Employees</h1>

      {isLoading && (
        <p className="text-sm text-slate-500">Loading employees…</p>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          Failed to load employees. Please try again.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Emp ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Job Title</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 font-mono text-xs">
                    {emp.employeeId}
                  </td>
                  <td className="px-4 py-2">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2">{emp.jobTitle || "—"}</td>
                  <td className="px-4 py-2">{emp.department || "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px]",
                        emp.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}

              {!employees?.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-slate-400 text-xs"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
