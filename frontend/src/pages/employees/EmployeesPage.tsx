import { useEffect, useState } from "react";
import axios from "axios";

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function EmployeesPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await axios.get<Employee[]>(
          "http://localhost:4000/api/employees"
        );
        setEmployees(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Employees</h1>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <table className="min-w-full text-sm bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Emp ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="px-4 py-2">{e.employeeId}</td>
                <td className="px-4 py-2">
                  {e.firstName} {e.lastName}
                </td>
                <td className="px-4 py-2">{e.email}</td>
                <td className="px-4 py-2">{e.department ?? "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-slate-500 text-sm"
                >
                  No employees yet. Create them through the API for now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
