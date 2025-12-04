// frontend/src/pages/performance/EditReviewPage.tsx

import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import {
  useGetReviewByIdQuery,
  useUpdateReviewMutation,
  useGetKpisQuery,
  Kpi,
} from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiArrowLeft, FiRefreshCw, FiSave } from "react-icons/fi";

/* =======================================
   PERFORMANCE TOP TABS
======================================= */

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
    </div>
  );
};

/* =======================================
   MANAGE REVIEWS SUBTABS
======================================= */

const ManageReviewSubtabs = () => {
  const base = "/performance/manage";
  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border transition-colors";

  const active =
    "bg-green-500 text-white shadow-sm border-green-500 hover:bg-green-600";
  const normal = "text-slate-700 bg-white hover:bg-green-50";

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

/* =======================================
   FORM TYPES
======================================= */

type ReviewStatus =
  | "NOT_STARTED"
  | "ACTIVATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED";

interface ReviewFormState {
  employeeId: string;
  reviewerId: string;
  additionalReviewerIds: string;
  jobTitle: string;
  subUnit: string;
  periodFrom: string;
  periodTo: string;
  dueDate: string;
  status: ReviewStatus;
}

interface KpiRatingForm {
  kpiId: string;
  kpiTitle: string;
  rating: number | "";
  comment: string;
}

/* =======================================
   EDIT REVIEW PAGE
======================================= */

export default function EditReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: review, isLoading } = useGetReviewByIdQuery(id || "");
  const [updateReview, { isLoading: isSaving }] = useUpdateReviewMutation();

  // PRE-FILLED FORM
  const [form, setForm] = useState<ReviewFormState>({
    employeeId: "",
    reviewerId: "",
    additionalReviewerIds: "",
    jobTitle: "",
    subUnit: "",
    periodFrom: "",
    periodTo: "",
    dueDate: "",
    status: "NOT_STARTED",
  });

  // KPI Fetching (dependent on Job Title)
  const {
    data: kpis,
    isLoading: isKpiLoading,
    refetch: refetchKpis,
  } = useGetKpisQuery(
    form.jobTitle ? { jobTitle: form.jobTitle } : undefined,
    { skip: !form.jobTitle }
  );

  const [kpiRatings, setKpiRatings] = useState<KpiRatingForm[]>([]);

  /* ---------------------------------------
     LOAD REVIEW INTO FORM
--------------------------------------- */
  useEffect(() => {
    if (!review) return;

    setForm({
      employeeId: review.employee?._id || "",
      reviewerId: review.reviewer?._id || "",
      additionalReviewerIds: review.additionalReviewers
        ? review.additionalReviewers.map((r: any) => r._id).join(",")
        : "",
      jobTitle: review.jobTitle || "",
      subUnit: review.subUnit || "",
      periodFrom: review.periodFrom?.substring(0, 10) || "",
      periodTo: review.periodTo?.substring(0, 10) || "",
      dueDate: review.dueDate?.substring(0, 10) || "",
      status: review.status as ReviewStatus,
    });

    // Load existing KPI ratings
    setKpiRatings(
      (review.kpiRatings || []).map((k: any) => ({
        kpiId: typeof k.kpi === "string" ? k.kpi : k.kpi?._id || "",
        kpiTitle:
          typeof k.kpi === "string" ? k.kpi : k.kpi?.kpiTitle || "Unknown KPI",
        rating: k.rating != null ? k.rating : "",
        comment: k.comment || "",
      }))
    );
  }, [review]);

  /* ---------------------------------------
     LOAD KPIs FOR JOB TITLE
--------------------------------------- */
const loadKpisForJobTitle = () => {
  if (!form.jobTitle) {
    alert("Enter Job Title first.");
    return;
  }

  if (kpis && kpis.length > 0) {
    // Merge existing ratings if available
    const merged: KpiRatingForm[] = (kpis as Kpi[]).map(
      (k): KpiRatingForm => {
        const existing = kpiRatings.find((kr) => kr.kpiId === k._id);
        if (existing) return existing;

        // fallback must be a valid KpiRatingForm
        return {
          kpiId: k._id,
          kpiTitle: k.kpiTitle,
          rating: "" as "", 
          comment: "",
        };
      }
    );

    setKpiRatings(merged);
  } else {
    refetchKpis();
  }
};


  /* ---------------------------------------
     FORM CHANGE HANDLER
--------------------------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------
     KPI FIELD UPDATE
--------------------------------------- */
  const handleKpiRatingChange = (
    kpiId: string,
    field: "rating" | "comment",
    value: string
  ) => {
    setKpiRatings((prev) =>
      prev.map((k) =>
        k.kpiId === kpiId
          ? {
              ...k,
              [field]:
                field === "rating"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : k
      )
    );
  };

  /* ---------------------------------------
     SUBMIT UPDATE
--------------------------------------- */
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
      kpiRatings: kpiRatings.map((k) => ({
        kpi: k.kpiId,
        rating: k.rating === "" ? undefined : k.rating,
        comment: k.comment || undefined,
      })),
    };

    try {
      await updateReview({ id: review!._id, ...payload }).unwrap();
      navigate("/performance/manage/reviews");
    } catch (err) {
      console.error(err);
      alert("Failed to update review");
    }
  };

  /* =======================================
     RENDER
======================================= */

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
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
                  Performance · Edit Review
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Modify review details and KPI ratings
                </p>
              </div>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* SUBTABS */}
          <section className="bg-white rounded-xl border p-4 shadow-sm">
            <ManageReviewSubtabs />
          </section>

          {/* MAIN FORM */}
          <section className="bg-white rounded-xl border p-5 shadow-sm">
            {isLoading || !review ? (
              <div className="text-center text-xs text-slate-500 py-10">
                {isLoading ? "Loading review..." : "Review not found"}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {/* GRID 1: EMPLOYEE + REVIEWER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} required />
                    <Input label="Reviewer ID" name="reviewerId" value={form.reviewerId} onChange={handleChange} required />
                    <Input label="Additional Reviewer IDs" name="additionalReviewerIds" value={form.additionalReviewerIds} onChange={handleChange} placeholder="id1,id2,id3" />
                  </div>

                  <div className="space-y-3">
                    <Input label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
                    <Input label="Sub Unit" name="subUnit" value={form.subUnit} onChange={handleChange} placeholder="Department (optional)" />
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      options={[
                        "NOT_STARTED",
                        "ACTIVATED",
                        "IN_PROGRESS",
                        "COMPLETED",
                        "ARCHIVED",
                      ]}
                    />
                  </div>
                </div>

                {/* GRID 2: DATES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input type="date" label="Period From" name="periodFrom" value={form.periodFrom} onChange={handleChange} required />
                  <Input type="date" label="Period To" name="periodTo" value={form.periodTo} onChange={handleChange} required />
                  <Input type="date" label="Due Date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
                </div>

                {/* KPI Ratings */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-[13px] font-semibold">KPI Ratings</h2>
                    <button
                      type="button"
                      onClick={loadKpisForJobTitle}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
                    >
                      <FiRefreshCw className="text-xs" />
                      Reload KPIs
                    </button>
                  </div>

                  {kpiRatings.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No KPIs loaded yet. Click "Reload KPIs".
                    </p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[11px] border-b">
                          <tr>
                            <th className="px-3 py-2 text-left">KPI</th>
                            <th className="px-3 py-2 text-left w-24">Rating</th>
                            <th className="px-3 py-2 text-left">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpiRatings.map((k) => (
                            <tr key={k.kpiId} className="border-t hover:bg-slate-50/50">
                              <td className="px-3 py-2">{k.kpiTitle}</td>
                              <td className="px-3 py-2">
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
                                  className="border rounded-md px-2 py-1 w-20"
                                  placeholder="-"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <textarea
                                  rows={2}
                                  value={k.comment}
                                  onChange={(e) =>
                                    handleKpiRatingChange(
                                      k.kpiId,
                                      "comment",
                                      e.target.value
                                    )
                                  }
                                  className="border rounded-md px-2 py-1 w-full resize-none"
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
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/performance/manage/reviews")}
                    className="px-4 py-1.5 border rounded-full text-xs hover:bg-slate-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold hover:bg-green-600 disabled:opacity-60 flex items-center gap-2"
                  >
                    <FiSave className="text-xs" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* =======================================
   SMALL UI COMPONENTS
======================================= */

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-slate-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-slate-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
