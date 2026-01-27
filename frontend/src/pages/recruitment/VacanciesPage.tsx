// frontend/src/pages/recruitment/VacanciesPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  useGetJobsQuery,
  useGetVacanciesQuery,
  useCreateVacancyMutation,
} from "../../features/recruitment/recruitmentApi";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

/** Local top tabs for Recruitment (same as in RecruitmentPage) */
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

export default function VacanciesPage() {
  const { data: jobs } = useGetJobsQuery();
  const { data: vacancies } = useGetVacanciesQuery();
  const [createVacancy, { isLoading: creating }] = useCreateVacancyMutation();

  // ── Filter form state ─────────────────────────────────────────────
  const [jobIdFilter, setJobIdFilter] = useState("");
  const [vacancyNameFilter, setVacancyNameFilter] = useState("");
  const [hiringManagerFilter, setHiringManagerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    jobId: "",
    vacancyName: "",
    hiringManager: "",
    status: "",
  });

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setAppliedFilters({
      jobId: jobIdFilter,
      vacancyName: vacancyNameFilter,
      hiringManager: hiringManagerFilter,
      status: statusFilter,
    });
  }

  function handleReset() {
    setJobIdFilter("");
    setVacancyNameFilter("");
    setHiringManagerFilter("");
    setStatusFilter("");
    setAppliedFilters({
      jobId: "",
      vacancyName: "",
      hiringManager: "",
      status: "",
    });
  }

  const filteredVacancies = useMemo(() => {
    if (!vacancies) return [];

    return vacancies.filter((v: any) => {
      if (appliedFilters.jobId) {
        const idFromJob =
          typeof v.job === "string" ? v.job : v.job?._id ?? "";
        if (idFromJob !== appliedFilters.jobId) return false;
      }

      if (appliedFilters.status && v.status !== appliedFilters.status) {
        return false;
      }

      if (appliedFilters.vacancyName) {
        if (
          !v.name
            ?.toLowerCase()
            .includes(appliedFilters.vacancyName.toLowerCase().trim())
        ) {
          return false;
        }
      }

      if (appliedFilters.hiringManager) {
        const hm = (v.hiringManagerName ?? "").toLowerCase();
        if (!hm.includes(appliedFilters.hiringManager.toLowerCase().trim())) {
          return false;
        }
      }

      return true;
    });
  }, [vacancies, appliedFilters]);

  // ── Add vacancy inline form ───────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobId, setNewJobId] = useState("");
  const [newName, setNewName] = useState("");
  const [newHiringManager, setNewHiringManager] = useState("");
  const [newStatus, setNewStatus] = useState<"OPEN" | "CLOSED">("OPEN");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newJobId || !newName.trim()) return;

    await createVacancy({
      jobId: newJobId,
      name: newName.trim(),
      hiringManagerName: newHiringManager.trim() || undefined,
      status: newStatus,
    }).unwrap();

    setNewJobId("");
    setNewName("");
    setNewHiringManager("");
    setNewStatus("OPEN");
    setShowAddForm(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right side: topbar + page content */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-slate-800">
            Recruitment
          </h1>

          <RecruitmentTopTabs />

          {/* Filters card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Vacancies
              </h2>
            </div>

            <form
              onSubmit={handleSearch}
              className="px-6 pb-5 space-y-4 text-xs"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Job Title */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Job Title
                  </label>
                  <div className="relative">
                    <select
                      value={jobIdFilter}
                      onChange={(e) => setJobIdFilter(e.target.value)}
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

                {/* Vacancy */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Vacancy
                  </label>
                  <input
                    value={vacancyNameFilter}
                    onChange={(e) => setVacancyNameFilter(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
                    placeholder="Type to filter..."
                  />
                </div>

                {/* Hiring Manager */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Hiring Manager
                  </label>
                  <input
                    value={hiringManagerFilter}
                    onChange={(e) => setHiringManagerFilter(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white"
                    placeholder="Type to filter..."
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white appearance-none"
                    >
                      <option value="">-- Select --</option>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
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

          {/* Vacancies list card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
              >
                <FiPlus className="text-sm" />
                <span>Add</span>
              </button>
            </div>

            {showAddForm && (
              <div className="px-6 pb-3">
                <form
                  onSubmit={handleCreate}
                  className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-xs items-end bg-slate-50/60 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Job Title *
                    </label>
                    <div className="relative">
                      <select
                        value={newJobId}
                        onChange={(e) => setNewJobId(e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
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

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Vacancy Name *
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="e.g. Senior Designer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-500">
                      Hiring Manager
                    </label>
                    <input
                      value={newHiringManager}
                      onChange={(e) => setNewHiringManager(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Manager name"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          value={newStatus}
                          onChange={(e) =>
                            setNewStatus(e.target.value as "OPEN" | "CLOSED")
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creating}
                      className="mt-4 rounded-full bg-green-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                    >
                      {creating ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                      <th className="px-3 py-2 text-left">Job Title</th>
                      <th className="px-3 py-2 text-left">Hiring Manager</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVacancies.length > 0 ? (
                      filteredVacancies.map((v: any) => {
                        const jobTitle =
                          typeof v.job === "string" ? "" : v.job?.title ?? "";

                        return (
                          <tr
                            key={v._id}
                            className="border-t border-slate-100 last:border-b-0"
                          >
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="h-3 w-3 rounded"
                              />
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-700">
                              {v.name}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-700">
                              {jobTitle || "-"}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-700">
                              {v.hiringManagerName || "-"}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-700">
                              {v.status}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-green-600">
                              View
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
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
        </main>
      </div>
    </div>
  );
}
