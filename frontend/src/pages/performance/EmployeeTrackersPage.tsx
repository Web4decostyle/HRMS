// frontend/src/pages/performance/EmployeeTrackersPage.tsx

import { NavLink, useNavigate } from "react-router-dom";
import { useGetEmployeeTrackersQuery } from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiEye } from "react-icons/fi";

/* ============================
   PERFORMANCE TOP TABS
============================ */
const PerformanceTopTabs = () => {
  const base = "/performance";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border transition-colors";

  const active =
    "bg-white text-red-600 shadow-sm border-white hover:bg-red-50";
  const normal = "text-slate-700 bg-white hover:bg-red-50 border-white";

  const getClass = ({ isActive }: { isActive: boolean }) =>
    `${pill} ${isActive ? active : normal}`;

  return (
    <div className="flex flex-wrap gap-2">
      <NavLink to={`${base}/configure/kpis`} className={getClass}>
        Configure
      </NavLink>
      <NavLink to={`${base}/manage/reviews`} className={getClass}>
        Manage Reviews
      </NavLink>
      <NavLink to={`${base}/my-reviews`} className={getClass}>
        My Reviews
      </NavLink>
      <NavLink to={`${base}/employee-reviews`} className={getClass}>
        Employee Reviews
      </NavLink>
      <NavLink to={`${base}/my-trackers`} className={getClass}>
        My Trackers
      </NavLink>
      <NavLink to={`${base}/employee-trackers`} className={getClass}>
        Employee Trackers
      </NavLink>
    </div>
  );
};

/* ============================
   EMPLOYEE TRACKERS PAGE
============================ */

export default function EmployeeTrackersPage() {
  const navigate = useNavigate();
  const { data: trackers, isLoading } = useGetEmployeeTrackersQuery();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Performance · Employee Trackers
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Trackers where you are the employee being tracked
              </p>
            </div>

            <PerformanceTopTabs />
          </div>

          {/* Table */}
          <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b text-[13px] font-medium text-slate-700">
              Employee Trackers
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Tracker Name</th>
                    <th className="px-4 py-2 text-left">Reviewers</th>
                    <th className="px-4 py-2 text-left">Created On</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        Loading trackers...
                      </td>
                    </tr>
                  ) : !trackers || trackers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No trackers found for you as employee
                      </td>
                    </tr>
                  ) : (
                    trackers.map((t: any) => (
                      <tr
                        key={t._id}
                        className="border-t hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-2">{t.name}</td>

                        <td className="px-4 py-2">
                          {(t.reviewers || [])
                            .map(
                              (r: any) =>
                                `${r.firstName} ${r.lastName} (${r.employeeId})`
                            )
                            .join(", ")}
                        </td>

                        <td className="px-4 py-2">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex justify-end">
                            <button
                              onClick={() =>
                                navigate(`/performance/trackers/${t._id}/view`)
                              }
                              className="p-1.5 rounded-md border text-slate-600 hover:bg-slate-50"
                              title="View Tracker"
                            >
                              <FiEye className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
