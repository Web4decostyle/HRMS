// frontend/src/pages/performance/MyReviewsPage.tsx

import { NavLink, useNavigate } from "react-router-dom";
import {
  useGetMyReviewsQuery,
  Review,
} from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiEye, FiEdit2 } from "react-icons/fi";

/* =======================================
   PERFORMANCE TOP TABS
======================================= */
const PerformanceTopTabs = () => {
  const base = "/performance";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border transition-colors";

  const active =
    "bg-white text-red-600 shadow-sm border-white hover:bg-red-50";
  const normal =
    "text-slate-700 bg-white hover:bg-red-50 border-white";

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
    </div>
  );
};

/* =======================================
   MY REVIEWS PAGE
======================================= */

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const { data: reviews, isLoading } = useGetMyReviewsQuery();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Performance · My Reviews
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Reviews assigned to you for self-assessment
              </p>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* TABLE */}
          <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b font-medium text-[13px] text-slate-700">
              My Reviews
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Reviewer</th>
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Due Date</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Loading reviews...
                      </td>
                    </tr>
                  ) : !reviews || reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No reviews assigned to you
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r: Review) => (
                      <tr
                        key={r._id}
                        className="border-t hover:bg-slate-50/60 transition"
                      >
                        {/* Reviewer */}
                        <td className="px-4 py-2">
                          {r.reviewer
                            ? `${r.reviewer.firstName} ${r.reviewer.lastName}`
                            : "-"}
                        </td>

                        {/* Job Title */}
                        <td className="px-4 py-2">{r.jobTitle || "-"}</td>

                        {/* Status */}
                        <td className="px-4 py-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                            {r.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-2">
                          {new Date(r.dueDate).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <button
                              onClick={() =>
                                navigate(`/performance/manage/reviews/${r._id}`)
                              }
                              className="p-1.5 rounded-md border text-slate-600 hover:bg-slate-50"
                              title="View"
                            >
                              <FiEye className="text-xs" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() =>
                                navigate(
                                  `/performance/manage/reviews/${r._id}/edit`
                                )
                              }
                              className="p-1.5 rounded-md border text-slate-600 hover:bg-slate-50"
                              title="Edit"
                            >
                              <FiEdit2 className="text-xs" />
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
