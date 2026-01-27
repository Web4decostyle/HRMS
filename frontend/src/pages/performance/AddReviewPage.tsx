// frontend/src/pages/performance/AddReviewPage.tsx

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useCreateReviewMutation,
  useGetKpisQuery,
  Kpi,
} from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiSave, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

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
   FORM TYPES
============================ */

type ReviewStatus =
  | "NOT_STARTED"
  | "ACTIVATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED";

interface ReviewFormState {
  employeeId: string;
  reviewerId: string;
  additionalReviewerIds: string; // comma separated
  jobTitle: string;
  subUnit: string;
  periodFrom: string;
  periodTo: string;
  dueDate: string;
  status: ReviewStatus;
}

const emptyForm: ReviewFormState = {
  employeeId: "",
  reviewerId: "",
  additionalReviewerIds: "",
  jobTitle: "",
  subUnit: "",
  periodFrom: "",
  periodTo: "",
  dueDate: "",
  status: "NOT_STARTED",
};

interface KpiRatingForm {
  kpiId: string;
  kpiTitle: string;
  rating: number | "";
  comment: string;
}

/* ============================
   ADD REVIEW PAGE
============================ */

export default function AddReviewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ReviewFormState>(emptyForm);

  // Fetch KPIs for the selected job title
  const { data: kpis, isLoading: isKpiLoading, refetch } = useGetKpisQuery(
    form.jobTitle ? { jobTitle: form.jobTitle } : undefined,
    {
      skip: !form.jobTitle,
    }
  );

  const [kpiRatings, setKpiRatings] = useState<KpiRatingForm[]>([]);

  const [createReview, { isLoading: isSaving }] = useCreateReviewMutation();

  // When job title changes, clear kpiRatings (we will reload)
  useEffect(() => {
    setKpiRatings([]);
  }, [form.jobTitle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadKpisForJobTitle = () => {
    if (!form.jobTitle) {
      alert("Please enter a Job Title first.");
      return;
    }
    // If kpis already fetched, just map; else refetch first
    if (kpis && kpis.length > 0) {
      setKpiRatings(
        kpis.map((k: Kpi) => ({
          kpiId: k._id,
          kpiTitle: k.kpiTitle,
          rating: "",
          comment: "",
        }))
      );
    } else {
      // force refetch then map
      refetch().then((res) => {
        if ("data" in res && res.data && (res.data as Kpi[]).length > 0) {
          const fetched = res.data as Kpi[];
          setKpiRatings(
            fetched.map((k: Kpi) => ({
              kpiId: k._id,
              kpiTitle: k.kpiTitle,
              rating: "",
              comment: "",
            }))
          );
        } else {
          alert("No KPIs found for this job title.");
        }
      });
    }
  };

  const handleKpiRatingChange = (
    kpiId: string,
    field: "rating" | "comment",
    value: string
  ) => {
    setKpiRatings((prev) =>
      prev.map((item) =>
        item.kpiId === kpiId
          ? {
              ...item,
              [field]:
                field === "rating"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const additionalReviewers = form.additionalReviewerIds
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const payload = {
      employee: form.employeeId,
      reviewer: form.reviewerId,
      additionalReviewers,
      jobTitle: form.jobTitle,
      subUnit: form.subUnit || undefined,
      periodFrom: form.periodFrom,
      periodTo: form.periodTo,
      dueDate: form.dueDate,
      status: form.status,
      kpiRatings: kpiRatings
        .filter((k) => k.rating !== "" || k.comment.trim() !== "")
        .map((k) => ({
          kpi: k.kpiId,
          rating: k.rating === "" ? undefined : k.rating,
          comment: k.comment || undefined,
        })),
    };

    try {
      await createReview(payload).unwrap();
      navigate("/performance/manage/reviews");
    } catch (err) {
      console.error(err);
      alert("Failed to create review");
    }
  };

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
                  Performance · Add Review
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create a new performance review and assign KPIs
                </p>
              </div>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* FILTER CARD WITH SUBTABS */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <ManageReviewSubtabs />
          </section>

          {/* FORM CARD */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* BASIC INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* LEFT COLUMN */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Employee ID
                    </label>
                    <input
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      required
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="employee _id"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Reviewer ID
                    </label>
                    <input
                      name="reviewerId"
                      value={form.reviewerId}
                      onChange={handleChange}
                      required
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="reviewer _id"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Additional Reviewer IDs
                    </label>
                    <input
                      name="additionalReviewerIds"
                      value={form.additionalReviewerIds}
                      onChange={handleChange}
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="id1,id2,id3 (optional)"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Job Title
                    </label>
                    <input
                      name="jobTitle"
                      value={form.jobTitle}
                      onChange={handleChange}
                      required
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. Sales Executive"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Sub Unit
                    </label>
                    <input
                      name="subUnit"
                      value={form.subUnit}
                      onChange={handleChange}
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="e.g. Marketing"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="ACTIVATED">Activated</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DATES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Period From
                  </label>
                  <input
                    type="date"
                    name="periodFrom"
                    value={form.periodFrom}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Period To
                  </label>
                  <input
                    type="date"
                    name="periodTo"
                    value={form.periodTo}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* KPI RATINGS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-slate-800">
                    KPI Ratings (optional)
                  </h2>
                  <button
                    type="button"
                    onClick={loadKpisForJobTitle}
                    disabled={!form.jobTitle || isKpiLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <FiRefreshCw className="text-xs" />
                    {isKpiLoading ? "Loading KPIs..." : "Load KPIs for Job Title"}
                  </button>
                </div>

                {kpiRatings.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No KPIs loaded yet. Enter a Job Title and click{" "}
                    <span className="font-medium">"Load KPIs for Job Title"</span>.
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
                        {kpiRatings.map((k) => (
                          <tr
                            key={k.kpiId}
                            className="border-t border-slate-100 hover:bg-slate-50/50"
                          >
                            <td className="px-3 py-2 align-top">{k.kpiTitle}</td>
                            <td className="px-3 py-2 align-top">
                              <input
                                type="number"
                                min={0}
                                max={5}
                                value={k.rating === "" ? "" : k.rating}
                                onChange={(e) =>
                                  handleKpiRatingChange(
                                    k.kpiId,
                                    "rating",
                                    e.target.value
                                  )
                                }
                                className="w-20 rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="-"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <textarea
                                value={k.comment}
                                onChange={(e) =>
                                  handleKpiRatingChange(
                                    k.kpiId,
                                    "comment",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                                placeholder="Add comment (optional)"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/performance/manage/reviews")}
                  className="px-4 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-60"
                >
                  <FiSave className="text-xs" />
                  {isSaving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
