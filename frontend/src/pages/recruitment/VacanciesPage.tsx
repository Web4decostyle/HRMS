// frontend/src/pages/recruitment/VacanciesPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  useGetJobsQuery,
  useGetVacanciesQuery,
  useCreateVacancyMutation,
} from "../../features/recruitment/recruitmentApi";
import { FiPlus } from "react-icons/fi";

// ✅ Fetch employees for Hiring Manager dropdown
import { useGetEmployeesQuery } from "../../features/employees/employeesApi";

/* ================= Tabs ================= */

const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill = "px-4 py-1.5 text-xs font-medium rounded-full transition-colors";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-lime-500 text-white shadow-sm`
      : `${pill} text-slate-600 hover:bg-white hover:shadow-sm`;

  return (
    <div className="mb-4 flex gap-2">
      <NavLink to={base} end className={getClass}>
        Candidates
      </NavLink>
      <NavLink to={`${base}/vacancies`} className={getClass}>
        Vacancies
      </NavLink>
    </div>
  );
};

function toFullName(e: any) {
  const first = (e?.firstName ?? "").trim();
  const last = (e?.lastName ?? "").trim();
  const full = `${first} ${last}`.trim();
  return full || e?.name || e?.email || "—";
}

/* ================= Page ================= */

export default function VacanciesPage() {
  const navigate = useNavigate();

  const { data: jobs } = useGetJobsQuery();
  const { data: vacancies } = useGetVacanciesQuery();
  const [createVacancy, { isLoading: creating }] = useCreateVacancyMutation();

  // ✅ Employees (for hiring manager dropdown)
  // If your API requires params, adjust accordingly:
  // useGetEmployeesQuery({ include: "all" })
  const { data: employees = [] } = useGetEmployeesQuery({ include: "all" } as any);

  // Build unique manager name list (clean + sorted)
  const managerNames = useMemo(() => {
    const names = (employees as any[])
      .map(toFullName)
      .filter((n) => n && n !== "—");

    // unique + sort
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  /* ================= Filters ================= */

  const [jobIdFilter, setJobIdFilter] = useState("");
  const [vacancyNameFilter, setVacancyNameFilter] = useState("");

  // ✅ Now a dropdown value (employee name)
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
        const q = appliedFilters.vacancyName.toLowerCase().trim();
        if (!v.name?.toLowerCase().includes(q)) return false;
      }

      // ✅ Hiring manager dropdown filter (exact match OR contains; we’ll do contains-safe)
      if (appliedFilters.hiringManager) {
        const hm = (v.hiringManagerName ?? "").toLowerCase().trim();
        const sel = appliedFilters.hiringManager.toLowerCase().trim();
        if (!hm.includes(sel)) return false;
      }

      return true;
    });
  }, [vacancies, appliedFilters]);

  /* ================= Add Vacancy ================= */

  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobId, setNewJobId] = useState("");
  const [newName, setNewName] = useState("");

  // ✅ Now a dropdown value (employee name)
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

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-lime-50 to-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">
          Vacancies Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and track open recruitment vacancies
        </p>
      </div>

      <RecruitmentTopTabs />

      {/* Filters */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
          <select
            value={jobIdFilter}
            onChange={(e) => setJobIdFilter(e.target.value)}
            className="input"
          >
            <option value="">All Jobs</option>
            {jobs?.map((j: any) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>

          <input
            value={vacancyNameFilter}
            onChange={(e) => setVacancyNameFilter(e.target.value)}
            className="input"
            placeholder="Vacancy Name"
          />

          {/* ✅ Hiring Manager Dropdown */}
          <select
            value={hiringManagerFilter}
            onChange={(e) => setHiringManagerFilter(e.target.value)}
            className="input"
          >
            <option value="">All Hiring Managers</option>
            {managerNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>

          <div className="md:col-span-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-full bg-lime-500 px-5 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Vacancies Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <h3 className="font-semibold text-slate-700">Vacancies</h3>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-lime-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
          >
            <FiPlus className="text-sm" />
            Add Vacancy
          </button>
        </div>

        {showAddForm && (
          <div className="px-6 pb-6 border-t border-slate-100">
            <form
              onSubmit={handleCreate}
              className="mt-4 grid md:grid-cols-4 gap-4"
            >
              <select
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="input"
              >
                <option value="">Select Job *</option>
                {jobs?.map((j: any) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input"
                placeholder="Vacancy Name *"
              />

              {/* ✅ Hiring Manager Dropdown */}
              <select
                value={newHiringManager}
                onChange={(e) => setNewHiringManager(e.target.value)}
                className="input"
              >
                <option value="">Select Hiring Manager</option>
                {managerNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "OPEN" | "CLOSED")
                }
                className="input"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-lime-500 px-6 py-1.5 text-xs font-semibold text-white hover:bg-lime-600 disabled:opacity-60"
                >
                  {creating ? "Saving..." : "Save Vacancy"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="border-t border-slate-100" />

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Vacancy</th>
                <th className="px-6 py-3 text-left">Job</th>
                <th className="px-6 py-3 text-left">Hiring Manager</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
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
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {v.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {jobTitle || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {v.hiringManagerName || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.status === "OPEN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/recruitment/vacancies/${v._id}`)
                          }
                          className="text-lime-600 hover:underline text-xs font-medium"
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
                    No Vacancies Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.55rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
          background: white;
        }
        .input:focus {
          border-color: #84cc16;
          box-shadow: 0 0 0 2px rgba(132, 204, 22, 0.2);
        }
      `}</style>
    </div>
  );
}
