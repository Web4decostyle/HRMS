// frontend/src/pages/recruitment/RecruitmentPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetCandidatesQuery } from "../../features/recruitment/recruitmentApi";
import { useGetJobTitlesQuery } from "../../features/admin/adminApi";
import { FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";

/* ================= Top Tabs ================= */

const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill =
    "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-lime-500 text-white shadow-sm`
      : `${pill} text-slate-600 hover:bg-white hover:shadow-sm`;

  return (
    <div className="mb-4 flex items-center gap-2">
      <NavLink to={base} end className={getClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/vacancies`} className={getClass}>
        Vacancies
      </NavLink>
      <NavLink to={`${base}/interviewed`} className={getClass}>
        Interviewed
      </NavLink>
    </div>
  );
};

/* ================= Status Badge ================= */

function StatusBadge({ status }: { status?: string }) {
  const base =
    "px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block";

  const map: Record<string, string> = {
    APPLIED: "bg-slate-100 text-slate-700 border-slate-200",
    SHORTLISTED: "bg-amber-100 text-amber-700 border-amber-200",
    INTERVIEW: "bg-sky-100 text-sky-700 border-sky-200",
    HIRED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
    SELECTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={`${base} ${map[status || ""] || "bg-slate-100"}`}>
      {status || "-"}
    </span>
  );
}

function toIsoDate(v: any) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/* ================= Page ================= */

export default function RecruitmentPage() {
  const navigate = useNavigate();

  // ✅ FIX: Fetch job titles from Admin module (this is what your Admin page shows)
  const { data: jobTitles = [], isLoading: loadingJobs } =
    useGetJobTitlesQuery();

  const { data: candidates = [] } = useGetCandidatesQuery();

  // Filters UI state
  const [jobTitleId, setJobTitleId] = useState("");
  const [status, setStatus] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Applied filters (only set on Search click)
  const [appliedFilters, setAppliedFilters] = useState({
    jobTitleId: "",
    status: "",
    candidateName: "",
    dateFrom: "",
    dateTo: "",
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setAppliedFilters({
      jobTitleId,
      status,
      candidateName,
      dateFrom,
      dateTo,
    });
  }

  function handleReset() {
    setJobTitleId("");
    setStatus("");
    setCandidateName("");
    setDateFrom("");
    setDateTo("");
    setAppliedFilters({
      jobTitleId: "",
      status: "",
      candidateName: "",
      dateFrom: "",
      dateTo: "",
    });
  }

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter((c: any) => {
      // ✅ job matching:
      // Your candidates might store job as:
      // - string (id)
      // - populated object
      // - OR not at all (if you attach via vacancy)
      if (appliedFilters.jobTitleId) {
        const candidateJobId =
          typeof c.job === "string"
            ? c.job
            : (c.job?._id ??
              c.jobTitleId ?? // fallback if your backend uses this
              "");

        if (candidateJobId !== appliedFilters.jobTitleId) return false;
      }

      if (appliedFilters.status && c.status !== appliedFilters.status) {
        return false;
      }

      if (appliedFilters.candidateName) {
        const fullName = `${c.firstName ?? ""} ${c.lastName ?? ""}`
          .toLowerCase()
          .trim();
        if (
          !fullName.includes(appliedFilters.candidateName.toLowerCase().trim())
        ) {
          return false;
        }
      }

      // date filter
      if (appliedFilters.dateFrom || appliedFilters.dateTo) {
        const rawDate = c.applicationDate || c.dateOfApplication || c.createdAt;
        if (rawDate) {
          const d = new Date(rawDate).getTime();

          if (appliedFilters.dateFrom) {
            const from = new Date(appliedFilters.dateFrom).getTime();
            if (d < from) return false;
          }
          if (appliedFilters.dateTo) {
            const to = new Date(appliedFilters.dateTo).getTime();
            if (d > to) return false;
          }
        }
      }

      return true;
    });
  }, [candidates, appliedFilters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-lime-50 via-white to-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Recruitment</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage candidates and track hiring progress
            </p>
          </div>

          <button
            onClick={() => navigate("/recruitment/candidates/add")}
            className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-2 text-sm font-semibold text-white hover:bg-lime-600 transition"
          >
            <FiPlus />
            Add Candidate
          </button>
        </div>
      </div>

      <RecruitmentTopTabs />

      {/* Search Filters */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Job Title
              </label>
              <select
                value={jobTitleId}
                onChange={(e) => setJobTitleId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-300"
              >
                <option value="">{loadingJobs ? "Loading..." : "All"}</option>
                {jobTitles.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-300"
              >
                <option value="">All</option>
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
                <option value="SELECTED">Selected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Candidate Name
              </label>
              <input
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-300"
                placeholder="Search name..."
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-lime-500 px-5 py-2 text-sm font-semibold text-white hover:bg-lime-600"
              >
                <FiSearch />
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <FiRefreshCw />
                Reset
              </button>
            </div>
          </div>

          {/* Optional date filters (kept, but visually smaller) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-lime-300"
              />
            </div>
            <div className="hidden lg:block" />
            <div className="hidden lg:block" />
          </div>
        </form>
      </section>

      {/* Candidate Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">Vacancy</th>
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-6 py-3 text-left">Date Applied</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c: any) => {
                  const dateRaw =
                    c.applicationDate || c.dateOfApplication || c.createdAt;
                  const formatted = dateRaw
                    ? new Date(dateRaw).toLocaleDateString()
                    : "-";

                  return (
                    <tr
                      key={c._id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 text-slate-700">
                        {c.vacancy?.name || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatted}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/recruitment/candidates/${c._id}`)
                          }
                          className="text-lime-600 font-semibold hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
