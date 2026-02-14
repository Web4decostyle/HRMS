// frontend/src/pages/recruitment/VacancyViewPage.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import {
  useGetVacanciesQuery,
  // If you have this endpoint in RTK yet, uncomment and use it.
  // useGetVacancyByIdQuery,
} from "../../features/recruitment/recruitmentApi";

// Optional: only keep these if you really want to render them here.
// If your Layout already renders them, remove these imports + wrapper.
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

function safeDate(v?: any) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

/** Prevent: "Objects are not valid as a React child" */
function renderValue(v: any): React.ReactNode {
  if (v === undefined || v === null || v === "") return "—";

  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);

  if (Array.isArray(v)) {
    const out = v
      .map((x) => {
        if (x === undefined || x === null) return "";
        if (
          typeof x === "string" ||
          typeof x === "number" ||
          typeof x === "boolean"
        )
          return String(x);
        if (typeof x === "object")
          return (
            x.name ??
            x.title ??
            x.label ??
            x.fullName ??
            x.email ??
            x._id ??
            ""
          );
        return "";
      })
      .filter(Boolean)
      .join(", ");
    return out || "—";
  }

  if (typeof v === "object") {
    return (
      v.name ??
      v.title ??
      v.label ??
      v.fullName ??
      v.email ??
      v._id ??
      "—"
    );
  }

  return "—";
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toUpperCase();
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border";

  const cls =
    s === "OPEN"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "CLOSED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return <span className={`${base} ${cls}`}>{s || "—"}</span>;
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="text-[13px] text-slate-800">{renderValue(value)}</div>
    </div>
  );
}

export default function VacancyViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // If you have a by-id endpoint, use it (recommended).
  // const { data: apiVacancy, isLoading: loadingById, isError: errorById } =
  //   useGetVacancyByIdQuery(id as string, { skip: !id });

  // Fallback: load from list and find the vacancy.
  const { data: vacancies, isLoading: loadingList } = useGetVacanciesQuery();

  const vacancy = useMemo(() => {
    if (!id || !vacancies) return null;
    return (vacancies as any[]).find((v: any) => v._id === id) ?? null;
  }, [vacancies, id]);

  const isLoading = loadingList; // or (loadingById || (!apiVacancy && loadingList))
  const isError = false; // set to errorById if you use by-id endpoint

  const jobTitle =
    typeof vacancy?.job === "string"
      ? vacancy?.job
      : vacancy?.job?.title ?? vacancy?.job?.name ?? "—";

  const createdAt = safeDate(vacancy?.createdAt);
  const updatedAt = safeDate(vacancy?.updatedAt);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Remove Sidebar/Topbar wrapper if Layout already has them */}
      <div className="flex-1 flex flex-col">
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-gradient-to-r from-lime-50 to-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FiChevronLeft />
                    Back
                  </button>

                  <h1 className="text-2xl font-semibold text-slate-800">
                    Vacancy Details
                  </h1>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  Review vacancy information and status.
                </p>
              </div>

              <div className="pt-1">
                <StatusBadge status={vacancy?.status} />
              </div>
            </div>
          </div>

          {/* Content */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {isLoading ? (
              <div className="px-6 py-10 text-sm text-slate-500">Loading...</div>
            ) : isError ? (
              <div className="px-6 py-10 text-sm text-rose-600">
                Could not load vacancy.
              </div>
            ) : !vacancy ? (
              <div className="px-6 py-10 text-sm text-slate-500">
                Vacancy not found.
              </div>
            ) : (
              <>
                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">
                      {vacancy.name ?? "—"}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1">
                      Job: <span className="font-medium">{jobTitle}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Created: {createdAt}</div>
                    <div>Updated: {updatedAt}</div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div className="px-6 py-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Vacancy Name" value={vacancy.name} />
                  <Field label="Job Title" value={jobTitle} />
                  <Field
                    label="Hiring Manager"
                    value={vacancy.hiringManagerName ?? "—"}
                  />
                  <Field label="Status" value={vacancy.status} />
                  <Field label="Vacancy ID" value={vacancy._id} />

                  {/* Add more fields if your model has them */}
                  {/* <Field label="Description" value={vacancy.description} /> */}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
