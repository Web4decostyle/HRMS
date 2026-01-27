// frontend/src/pages/performance/ViewReviewPage.tsx

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useGetReviewByIdQuery } from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiArrowLeft } from "react-icons/fi";

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
   MANAGE REVIEWS SUBTABS
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
      <NavLink to={`${base}/reviews`} className={getClass}>
        Review List
      </NavLink>
      <NavLink to={`${base}/add`} className={getClass}>
        Add Review
      </NavLink>
    </div>
  );
};

/* ============================
   VIEW REVIEW PAGE
============================ */

export default function ViewReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: review, isLoading } = useGetReviewByIdQuery(id || "");

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const employeeName = review?.employee
    ? `${review.employee.firstName} ${review.employee.lastName}`
    : "-";

  const reviewerName = review?.reviewer
    ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
    : "-";

  const additionalReviewers =
    review?.additionalReviewers && review.additionalReviewers.length > 0
      ? review.additionalReviewers
          .map((r: any) => `${r.firstName} ${r.lastName}`)
          .join(", ")
      : "-";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                <FiArrowLeft className="text-xs" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                  Performance · View Review
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Read-only details of the performance review
                </p>
              </div>
            </div>

            <PerformanceTopTabs />
          </div>

          {/* SUBTABS */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <ManageReviewSubtabs />
          </section>

          {/* CONTENT */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            {isLoading || !review ? (
              <div className="text-center py-10 text-xs text-slate-500">
                {isLoading ? "Loading review..." : "Review not found"}
              </div>
            ) : (
              <>
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2">
                    <h2 className="text-[13px] font-semibold text-slate-800 mb-1">
                      Employee & Reviewer
                    </h2>

                    <InfoRow label="Employee" value={employeeName} />
                    <InfoRow
                      label="Employee ID"
                      value={review.employee?.employeeId || "-"}
                    />
                    <InfoRow label="Job Title" value={review.jobTitle || "-"} />
                    <InfoRow
                      label="Sub Unit"
                      value={review.subUnit || review.employee?.department || "-"}
                    />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[13px] font-semibold text-slate-800 mb-1">
                      Review Assignment
                    </h2>

                    <InfoRow label="Main Reviewer" value={reviewerName} />
                    <InfoRow
                      label="Additional Reviewers"
                      value={additionalReviewers}
                    />
                    <InfoRow
                      label="Status"
                      value={
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                          {review.status.replace("_", " ")}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Overall Rating"
                      value={
                        review.overallRating != null
                          ? review.overallRating.toString()
                          : "-"
                      }
                    />
                  </div>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-slate-100 pt-4">
                  <div>
                    <InfoRow
                      label="Period From"
                      value={formatDate(review.periodFrom)}
                    />
                  </div>
                  <div>
                    <InfoRow
                      label="Period To"
                      value={formatDate(review.periodTo)}
                    />
                  </div>
                  <div>
                    <InfoRow
                      label="Due Date"
                      value={formatDate(review.dueDate)}
                    />
                  </div>
                </div>

                {/* KPI RATINGS */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h2 className="text-[13px] font-semibold text-slate-800">
                    KPI Ratings
                  </h2>

                  {!review.kpiRatings || review.kpiRatings.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No KPI ratings have been recorded for this review.
                    </p>
                  ) : (
                    <div className="border border-slate-100 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[11px] text-slate-500 border-b">
                          <tr>
                            <th className="px-3 py-2 text-left">KPI</th>
                            <th className="px-3 py-2 text-left w-24">Rating</th>
                            <th className="px-3 py-2 text-left">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {review.kpiRatings.map((k: any, idx: number) => {
                            const kpiTitle =
                              typeof k.kpi === "string"
                                ? k.kpi
                                : k.kpi?.kpiTitle || "-";
                            return (
                              <tr
                                key={idx}
                                className="border-t border-slate-100 hover:bg-slate-50/50"
                              >
                                <td className="px-3 py-2 align-top">
                                  {kpiTitle}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  {k.rating != null ? k.rating : "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-pre-wrap">
                                  {k.comment || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ============================
   SMALL INFO ROW COMPONENT
============================ */

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      <span className="text-[11px] text-slate-800 text-right">{value}</span>
    </div>
  );
}
