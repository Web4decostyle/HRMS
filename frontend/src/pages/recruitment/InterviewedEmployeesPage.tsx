// frontend/src/pages/recruitment/InterviewedEmployeesPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetInterviewedCandidatesQuery } from "../../features/recruitment/recruitmentApi";

const RecruitmentTopTabs: React.FC = () => {
  const base = "/recruitment";

  const pill =
    "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-lime-500 text-white shadow-sm`
      : `${pill} text-slate-600 hover:bg-white hover:shadow-sm`;

  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
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

function fmtDate(v: any) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function StatusBadge({ status }: { status?: string }) {
  const base =
    "px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block";
  const map: Record<string, string> = {
    INTERVIEW: "bg-sky-100 text-sky-700 border-sky-200",
    SELECTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    HIRED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`${base} ${map[status || ""] || "bg-slate-100 border-slate-200 text-slate-700"}`}>
      {status || "-"}
    </span>
  );
}

export default function InterviewedEmployeesPage() {
  const navigate = useNavigate();

  // UI filter fields
  const [tempCode, setTempCode] = useState("");
  const [status, setStatus] = useState("");

  // applied filters for search button
  const [applied, setApplied] = useState({ tempCode: "", status: "" });

  const { data: rows = [], isLoading } = useGetInterviewedCandidatesQuery(
    applied.tempCode || applied.status ? applied : undefined
  );

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setApplied({
      tempCode: tempCode.trim(),
      status: status.trim(),
    });
  }

  function handleReset() {
    setTempCode("");
    setStatus("");
    setApplied({ tempCode: "", status: "" });
  }

  const filtered = useMemo(() => rows || [], [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-lime-50 via-white to-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Interviewed</h1>
        <p className="text-sm text-slate-500 mt-1">
          All candidates with interview date / temp code. Filter by temp code and status.
        </p>
      </div>

      <RecruitmentTopTabs />

      {/* Filters */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="p-6 grid gap-4 md:grid-cols-3">
          <input
            value={tempCode}
            onChange={(e) => setTempCode(e.target.value)}
            className="input"
            placeholder="Search TEMP code (e.g. TMP-2026...)"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="HIRED">Hired</option>
          </select>

          <div className="flex items-center justify-end gap-3 md:col-span-1">
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

      {/* Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">Interviewed List</h3>
          <div className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-800">{filtered.length}</span>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-6 py-3 text-left">Vacancy</th>
                <th className="px-6 py-3 text-left">Interview Date</th>
                <th className="px-6 py-3 text-left">TEMP Code</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Employee Code</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No Interviewed Candidates Found
                  </td>
                </tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c._id} className="border-t hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {c.firstName} {c.lastName}
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {typeof c.vacancy === "string" ? "-" : c.vacancy?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{fmtDate(c.interviewDate)}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-slate-700">
                      {c.tempEmployeeCode || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-[12px] text-slate-700">
                      {c.employeeCode || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/recruitment/candidates/${c._id}`)}
                        className="text-lime-600 hover:underline text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
      </section>
    </div>
  );
}
