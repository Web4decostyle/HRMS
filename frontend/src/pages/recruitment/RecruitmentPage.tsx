// frontend/src/pages/recruitment/RecruitmentPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  useGetJobsQuery,
  useGetCandidatesQuery,
} from "../../features/recruitment/recruitmentApi";
import { FiChevronDown, FiCalendar, FiPlus } from "react-icons/fi";

/** Local top tabs for Recruitment (Candidates / Vacancies) */
const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-white text-green-600 shadow-sm`
      : `${pill} text-slate-600 hover:bg-white/70`;

  return (
    <div className="mb-4 flex items-center gap-2">
      <NavLink to={base} end className={getClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/vacancies`} className={getClass}>
        Vacancies
      </NavLink>
    </div>
  );
};

export default function RecruitmentPage() {
  const { data: jobs } = useGetJobsQuery();
  const { data: candidates } = useGetCandidatesQuery();

  // --- Filter form state ---
  const [jobId, setJobId] = useState("");
  const [vacancyId, setVacancyId] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [status, setStatus] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("");

  // Applied filters (only change when Search is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    jobId: "",
    vacancyId: "",
    hiringManager: "",
    status: "",
    candidateName: "",
    keywords: "",
    dateFrom: "",
    dateTo: "",
    method: "",
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setAppliedFilters({
      jobId,
      vacancyId,
      hiringManager,
      status,
      candidateName,
      keywords,
      dateFrom,
      dateTo,
      method,
    });
  }

  function handleReset() {
    setJobId("");
    setVacancyId("");
    setHiringManager("");
    setStatus("");
    setCandidateName("");
    setKeywords("");
    setDateFrom("");
    setDateTo("");
    setMethod("");
    setAppliedFilters({
      jobId: "",
      vacancyId: "",
      hiringManager: "",
      status: "",
      candidateName: "",
      keywords: "",
      dateFrom: "",
      dateTo: "",
      method: "",
    });
  }

  // Simple front-end filtering to match the Search button
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter((c: any) => {
      if (appliedFilters.jobId) {
        const idFromJob =
          typeof c.job === "string" ? c.job : c.job?._id ?? "";
        if (idFromJob !== appliedFilters.jobId) return false;
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

      // naive date filter using applicationDate / createdAt if present
      if (appliedFilters.dateFrom || appliedFilters.dateTo) {
        const rawDate = c.applicationDate || c.createdAt;
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Recruitment</h1>

      <RecruitmentTopTabs />

      {/* Filters card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-slate-800">Candidates</h2>
        </div>

        <form onSubmit={handleSearch} className="px-6 pb-5 space-y-4 text-xs">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Job Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Job Title
              </label>
              <div className="relative">
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                >
                  <option value="">-- Select --</option>
                  {jobs?.map((j: any) => (
                    <option key={j._id} value={j._id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Vacancy (placeholder for now) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Vacancy
              </label>
              <div className="relative">
                <select
                  value={vacancyId}
                  onChange={(e) => setVacancyId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                >
                  <option value="">-- Select --</option>
                  {/* hook up real vacancies later */}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Hiring Manager (placeholder) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Hiring Manager
              </label>
              <div className="relative">
                <select
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                >
                  <option value="">-- Select --</option>
                  {/* fill with managers from API later */}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                >
                  <option value="">-- Select --</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Candidate Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Candidate Name
              </label>
              <input
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Type for hints..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Keywords
              </label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter comma separated words..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
              />
            </div>

            {/* Date From */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Date of Application (From)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
                />
                <FiCalendar className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Date of Application (To)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
                />
                <FiCalendar className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Method of Application */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">
                Method of Application
              </label>
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                >
                  <option value="">-- Select --</option>
                  <option value="ONLINE">Online</option>
                  <option value="EMAIL">Email</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="WALKIN">Walk-in</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-slate-200 px-5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-lime-500 px-6 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Candidates list card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <button className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-lime-600">
            <FiPlus className="text-sm" />
            <span>Add</span>
          </button>
        </div>

        <div className="border-t border-slate-100" />

        <div className="px-6 pb-4 pt-2">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2 text-left">
                    <input type="checkbox" className="h-3 w-3 rounded" />
                  </th>
                  <th className="px-3 py-2 text-left">Vacancy</th>
                  <th className="px-3 py-2 text-left">Candidate</th>
                  <th className="px-3 py-2 text-left">Hiring Manager</th>
                  <th className="px-3 py-2 text-left">Date of Application</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c: any) => {
                    const jobTitle =
                      typeof c.job === "string" ? "" : c.job?.title ?? "";
                    const applicationDate =
                      c.applicationDate || c.createdAt || "";
                    const formattedDate = applicationDate
                      ? new Date(applicationDate).toLocaleDateString()
                      : "-";

                    return (
                      <tr
                        key={c._id}
                        className="border-t border-slate-100 last:border-b-0"
                      >
                        <td className="px-3 py-2">
                          <input type="checkbox" className="h-3 w-3 rounded" />
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                          {jobTitle || "-"}
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                          {c.firstName} {c.lastName}
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                          {/* hook real manager later */}
                          {c.hiringManagerName || "-"}
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                          {formattedDate}
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                          {c.status || "-"}
                        </td>
                        <td className="px-3 py-2 align-top text-[11px] text-green-600">
                          {/* placeholder for action buttons */}
                          View
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-[11px] text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
