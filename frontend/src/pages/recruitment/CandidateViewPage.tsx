import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiChevronLeft,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiHash,
  FiCheckCircle,
  FiClipboard,
  FiBriefcase,
} from "react-icons/fi";
import {
  useGetCandidateByIdQuery,
  useGetCandidatesQuery,
  useSetInterviewDateMutation,
  useUpdateCandidateStatusMutation,
} from "../../features/recruitment/recruitmentApi";

function safeDate(v?: any) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isoDateOnly(v?: any) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function renderValue(v: any): React.ReactNode {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    const out = v
      .map((x) => {
        if (x == null) return "";
        if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") return String(x);
        if (typeof x === "object") return x.name ?? x.title ?? x.label ?? x._id ?? "";
        return "";
      })
      .filter(Boolean)
      .join(", ");
    return out || "—";
  }
  if (typeof v === "object") return v.name ?? v.title ?? v.label ?? v._id ?? "—";
  return "—";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function CardRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-wide text-slate-500">{label}</div>
        <div className="mt-0.5 truncate text-[13px] font-medium text-slate-800">{renderValue(value)}</div>
      </div>
    </div>
  );
}

export default function CandidateViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: apiCandidate, isLoading: loadingById } = useGetCandidateByIdQuery(id as string, { skip: !id });
  const { data: listCandidates, isLoading: loadingList } = useGetCandidatesQuery();

  const candidate = useMemo(() => {
    if (apiCandidate) return apiCandidate as any;
    if (!id || !listCandidates) return null;
    return (listCandidates as any[]).find((c: any) => c._id === id) ?? null;
  }, [apiCandidate, listCandidates, id]);

  const isLoading = loadingById || (!apiCandidate && loadingList);

  const [setInterviewDate, { isLoading: savingInterview }] = useSetInterviewDateMutation();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateCandidateStatusMutation();

  const [interviewDraft, setInterviewDraft] = useState<string>("");

  // keep input in sync once candidate loads
  React.useEffect(() => {
    if (candidate?.interviewDate) setInterviewDraft(isoDateOnly(candidate.interviewDate));
  }, [candidate?.interviewDate]);

  const fullName = candidate ? `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim() : "—";

  const jobTitle =
    typeof candidate?.job === "string"
      ? candidate?.job
      : candidate?.job?.title ?? candidate?.job?.name ?? "—";

  const vacancyLabel =
    candidate?.vacancyTitle ??
    (typeof candidate?.vacancy === "string"
      ? candidate?.vacancy
      : candidate?.vacancy?.title ?? candidate?.vacancy?.name ?? candidate?.vacancy);

  const canConvert = Boolean(candidate?.interviewDate);

  async function handleGenerateTemp() {
    if (!id) return;
    if (!interviewDraft) {
      alert("Please select interview date first.");
      return;
    }
    try {
      await setInterviewDate({ id, interviewDate: interviewDraft }).unwrap();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to set interview date");
    }
  }

  async function handleSetStatus(next: string) {
    if (!id) return;
    try {
      await updateStatus({ id, status: next }).unwrap();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to update status");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-50 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <FiChevronLeft />
              Back
            </button>

            <div>
              <div className="text-[11px] font-semibold tracking-wide text-slate-500">Candidate</div>
              <div className="text-lg font-semibold text-slate-800">{fullName || "—"}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Status: {renderValue(candidate?.status)}</Badge>
            <Badge>
              <FiCalendar className="mr-2 text-slate-500" />
              Applied: {safeDate(candidate?.dateOfApplication || candidate?.createdAt)}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {candidate?.tempEmployeeCode ? <Badge><FiHash className="mr-2" />Temp: {candidate.tempEmployeeCode}</Badge> : null}
          {candidate?.employeeCode ? <Badge><FiCheckCircle className="mr-2" />Employee: {candidate.employeeCode}</Badge> : null}
        </div>
      </div>

      {/* Main Card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Details</h2>
          <div className="text-[11px] text-slate-500">Updated: {safeDate(candidate?.updatedAt)}</div>
        </div>

        <div className="border-t border-slate-100" />

        {isLoading ? (
          <div className="px-6 py-10 text-sm text-slate-500">Loading...</div>
        ) : !candidate ? (
          <div className="px-6 py-10 text-sm text-slate-500">Candidate not found.</div>
        ) : (
          <div className="px-6 py-6 space-y-6">
            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CardRow icon={<FiUser />} label="First Name" value={candidate.firstName} />
              <CardRow icon={<FiUser />} label="Last Name" value={candidate.lastName} />
              <CardRow icon={<FiMail />} label="Email" value={candidate.email} />
              <CardRow icon={<FiPhone />} label="Phone" value={candidate.phone ?? candidate.contactNumber} />
              <CardRow icon={<FiBriefcase />} label="Job Title" value={jobTitle} />
              <CardRow icon={<FiBriefcase />} label="Vacancy" value={vacancyLabel} />
              <CardRow icon={<FiClipboard />} label="Keywords" value={candidate.keywords} />
              <CardRow icon={<FiClipboard />} label="Notes" value={candidate.notes} />
            </div>

            {/* Interview + Code actions */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">Interview & Employee Code</div>
                  <div className="text-[11px] text-slate-500">
                    Set interview date → generates TEMP code. When SELECTED/HIRED → generates FINAL employee code.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetStatus("SHORTLISTED")}
                    disabled={updatingStatus}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus("INTERVIEW")}
                    disabled={updatingStatus}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus("SELECTED")}
                    disabled={updatingStatus || !canConvert}
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    title={!canConvert ? "Set interview date first" : ""}
                  >
                    Mark Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus("HIRED")}
                    disabled={updatingStatus || !canConvert}
                    className="rounded-full bg-lime-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-lime-700 disabled:opacity-60"
                    title={!canConvert ? "Set interview date first" : ""}
                  >
                    Mark Hired
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={interviewDraft}
                    onChange={(e) => setInterviewDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lime-300"
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateTemp}
                    disabled={savingInterview}
                    className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {savingInterview ? "Saving..." : "Save Interview Date & Generate TEMP Code"}
                  </button>

                  {candidate?.tempEmployeeCode ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs">
                      <div className="text-[11px] font-semibold text-slate-500">Temporary Code</div>
                      <div className="font-mono text-slate-800">{candidate.tempEmployeeCode}</div>
                    </div>
                  ) : null}

                  {candidate?.employeeCode ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs">
                      <div className="text-[11px] font-semibold text-emerald-700">Employee Code</div>
                      <div className="font-mono text-emerald-900">{candidate.employeeCode}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
