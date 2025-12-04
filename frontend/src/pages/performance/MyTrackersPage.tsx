// frontend/src/pages/performance/MyTrackersPage.tsx

import { NavLink, useNavigate } from "react-router-dom";
import { useGetMyTrackersQuery } from "../../features/performance/performanceApi";

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
    "bg-white text-green-600 shadow-sm border-white hover:bg-green-50";
  const normal = "text-slate-700 bg-white hover:bg-green-50 border-white";

  const getClass = ({ isActive }: { isActive: boolean }) =>
    `${pill} ${isActive ? active : normal}`;

  return (
    <div className="flex gap-2">
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
   My Trackers Page
============================ */

export default function MyTrackersPage() {
  const navigate = useNavigate();
  const { data: trackers, isLoading } = useGetMyTrackersQuery();

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
                Performance · My Trackers
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Trackers assigned to you by reviewers
              </p>
            </div>

            <PerformanceTopTabs />
          </div>

          {/* Table */}
          <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b text-[13px] font-medium text-slate-700">
              My Trackers
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Tracker Name</th>
                    <th className="px-4 py-2 text-left">Reviewers</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Last Updated</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Loading trackers...
                      </td>
                    </tr>
                  ) : !trackers || trackers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No trackers assigned to you
                      </td>
                    </tr>
                  ) : (
                    trackers.map((t: any) => (
                      <tr
                        key={t._id}
                        className="border-t hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-2">{t.name}</td>

                        {/* Reviewers */}
                        <td className="px-4 py-2">
                          {(t.reviewers || [])
                            .map(
                              (r: any) =>
                                `${r.firstName} ${r.lastName} (${r.employeeId})`
                            )
                            .join(", ")}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                            {t.status || "ACTIVE"}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="px-4 py-2">
                          {t.updatedAt
                            ? new Date(t.updatedAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2">
                          <div className="flex justify-end">
                            <button
                              onClick={() =>
                                navigate(
                                  `/performance/trackers/${t._id}/view`
                                )
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
