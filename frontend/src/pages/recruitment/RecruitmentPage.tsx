// frontend/src/pages/recruitment/RecruitmentPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetJobsQuery,
  useCreateJobMutation,
  useGetCandidatesQuery,
} from "../../features/recruitment/recruitmentApi";

export default function RecruitmentPage() {
  const { data: jobs } = useGetJobsQuery();
  const { data: candidates } = useGetCandidatesQuery();
  const [createJob] = useCreateJobMutation();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createJob({ title, code }).unwrap();
    setTitle("");
    setCode("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Recruitment · Jobs & Candidates
      </h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Job Openings</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-3 text-xs"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job title"
            className="flex-1 rounded-md border border-slate-200 px-2 py-1"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="w-32 rounded-md border border-slate-200 px-2 py-1"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-md bg-orange-500 text-white hover:bg-orange-600"
          >
            Add
          </button>
        </form>
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-slate-500 border-b">
            <tr>
              <th className="py-1">Title</th>
              <th className="py-1">Code</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.map((j) => (
              <tr key={j._id} className="border-b last:border-0">
                <td className="py-1">{j.title}</td>
                <td className="py-1">{j.code}</td>
                <td className="py-1 text-[11px]">{j.status}</td>
              </tr>
            ))}
            {!jobs?.length && (
              <tr>
                <td
                  colSpan={3}
                  className="py-3 text-center text-slate-400 text-xs"
                >
                  No jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Candidates
        </h2>
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-slate-500 border-b">
            <tr>
              <th className="py-1">Name</th>
              <th className="py-1">Job</th>
              <th className="py-1">Email</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {candidates?.map((c) => (
              <tr key={c._id} className="border-b last:border-0">
                <td className="py-1">
                  {c.firstName} {c.lastName}
                </td>
                <td className="py-1">
                  {typeof c.job === "string" ? c.job : c.job?.title}
                </td>
                <td className="py-1">{c.email}</td>
                <td className="py-1 text-[11px]">{c.status}</td>
              </tr>
            ))}
            {!candidates?.length && (
              <tr>
                <td
                  colSpan={4}
                  className="py-3 text-center text-slate-400 text-xs"
                >
                  No candidates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
