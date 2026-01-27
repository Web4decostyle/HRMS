// frontend/src/pages/performance/ManageReviewsPage.tsx

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useGetReviewsQuery,
  useDeleteReviewMutation,
  Review,
} from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiSearch, FiTrash2, FiEye, FiEdit2 } from "react-icons/fi";

/* ============================
   PERFORMANCE TOP TABS
============================ */
const PerformanceTopTabs = () => {
  const base = "/performance";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border transition-colors";

  const active =
    "bg-white text-red-600 shadow-sm border-white hover:bg-red-50";
  const normal = "text-slate-700 bg-white hover:bg-red-50";

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

/* ============================
   SUBTABS: Manage / Review List
============================ */
const ManageReviewSubtabs = () => {
  const base = "/performance/manage";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border transition-colors";
  const active =
    "bg-red-500 text-white shadow-sm border-red-500 hover:bg-red-600";
  const normal = "text-slate-700 bg-white hover:bg-red-50";

  const getClass = ({ isActive }: { isActive: boolean }) =>
    `${pill} ${isActive ? active : normal}`;

  return (
    <div className="flex gap-2">
      <NavLink to={`${base}/reviews`} className={getClass} end>
        Review List
      </NavLink>
      <NavLink to={`${base}/add`} className={getClass}>
        Add Review
      </NavLink>
    </div>
  );
};

/* ============================
   REVIEW PAGE
============================ */

export default function ManageReviewsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    employeeId: "",
    jobTitle: "",
    subUnit: "",
    reviewerId: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const { data: reviews, isLoading } = useGetReviewsQuery(filters);
  const [deleteReview] = useDeleteReviewMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(id).unwrap();
    } catch (err) {
      console.error(err);
      alert("Error deleting review");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* HEADER + TOP TABS */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Performance · Manage Reviews
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Search and manage employee performance reviews
              </p>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* FILTER CARD */}
          <section className="bg-white rounded-xl border px-4 py-5 shadow-sm space-y-4">
            {/* SUBTABS */}
            <ManageReviewSubtabs />

            {/* FILTER FORM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">Employee ID</label>
                <input
                  value={filters.employeeId}
                  onChange={(e) =>
                    setFilters({ ...filters, employeeId: e.target.value })
                  }
                  className="border rounded-md px-2 py-1 text-xs"
                  placeholder="Enter employee _id"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">Reviewer ID</label>
                <input
                  value={filters.reviewerId}
                  onChange={(e) =>
                    setFilters({ ...filters, reviewerId: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                  placeholder="Enter reviewer _id"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">Job Title</label>
                <input
                  value={filters.jobTitle}
                  onChange={(e) =>
                    setFilters({ ...filters, jobTitle: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                  placeholder="Sales Executive"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">Sub Unit</label>
                <input
                  value={filters.subUnit}
                  onChange={(e) =>
                    setFilters({ ...filters, subUnit: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                  placeholder="Marketing"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                >
                  <option value="">-- All --</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ACTIVATED">Activated</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">From Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium">To Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value })
                  }
                  className="border rounded-md px-2 py-1"
                />
              </div>
            </div>
          </section>

          {/* REVIEWS TABLE */}
          <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b font-medium text-[13px] text-slate-700">
              Review List
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
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
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        Loading reviews...
                      </td>
                    </tr>
                  ) : !reviews || reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No reviews found
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r: Review) => (
                      <tr
                        key={r._id}
                        className="border-t hover:bg-slate-50/60 transition"
                      >
                        <td className="px-4 py-2">
                          {r.employee
                            ? `${r.employee.firstName} ${r.employee.lastName}`
                            : "-"}
                        </td>

                        <td className="px-4 py-2">
                          {r.reviewer
                            ? `${r.reviewer.firstName} ${r.reviewer.lastName}`
                            : "-"}
                        </td>

                        <td className="px-4 py-2">{r.jobTitle || "-"}</td>

                        <td className="px-4 py-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                            {r.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-4 py-2">
                          {new Date(r.dueDate).toLocaleDateString()}
                        </td>

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

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="p-1.5 rounded-md border text-rose-500 hover:bg-rose-50"
                              title="Delete"
                            >
                              <FiTrash2 className="text-xs" />
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
