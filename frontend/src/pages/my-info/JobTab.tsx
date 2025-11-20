import { useState, useEffect } from "react";
import {
  useGetJobQuery,
  useUpdateJobMutation,
} from "../../features/myInfo/myInfoApi";

const label = "block text-[11px] font-semibold text-slate-500 mb-1";
const input =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function JobTab({ employeeId }: { employeeId: string }) {
  // FETCH JOB DATA
  const { data: jobData = {}, isLoading } = useGetJobQuery(employeeId);
  const [updateJob, { isLoading: saving }] = useUpdateJobMutation();

  const [form, setForm] = useState({
    joinedDate: "",
    jobTitle: "",
    jobCategory: "",
    subUnit: "",
    location: "",
    employmentStatus: "",
  });

  // SET INITIAL VALUES WHEN DATA COMES
  useEffect(() => {
    if (jobData) {
      setForm({
        joinedDate: jobData.joinedDate?.slice(0, 10) || "",
        jobTitle: jobData.jobTitle || "",
        jobCategory: jobData.jobCategory || "",
        subUnit: jobData.subUnit || "",
        location: jobData.location || "",
        employmentStatus: jobData.employmentStatus || "",
      });
    }
  }, [jobData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateJob({
      employeeId,
      data: {
        ...form,
        joinedDate: form.joinedDate ? new Date(form.joinedDate).toISOString() : null,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading Job Details...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Job Details
        </h2>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="px-7 pt-6 pb-6 space-y-5 text-[12px]"
      >
        {/* Join Date */}
        <div>
          <label className={label}>Joined Date</label>
          <input
            type="date"
            name="joinedDate"
            value={form.joinedDate}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Job Title */}
        <div>
          <label className={label}>Job Title</label>
          <input
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            className={input}
            placeholder="Job Title"
          />
        </div>

        {/* Job Category */}
        <div>
          <label className={label}>Job Category</label>
          <input
            name="jobCategory"
            value={form.jobCategory}
            onChange={handleChange}
            className={input}
            placeholder="e.g. Senior, Junior, Manager"
          />
        </div>

        {/* Sub Unit */}
        <div>
          <label className={label}>Sub Unit</label>
          <input
            name="subUnit"
            value={form.subUnit}
            onChange={handleChange}
            className={input}
            placeholder="Department"
          />
        </div>

        {/* Location */}
        <div>
          <label className={label}>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className={input}
            placeholder="Office Location"
          />
        </div>

        {/* Employment Status */}
        <div>
          <label className={label}>Employment Status</label>
          <select
            name="employmentStatus"
            value={form.employmentStatus}
            onChange={handleChange}
            className={input}
          >
            <option value="">-- Select --</option>
            <option value="Full-Time Permanent">Full-Time Permanent</option>
            <option value="Full-Time Contract">Full-Time Contract</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Intern">Intern</option>
          </select>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4 border-t border-[#edf0f7]">
          <button
            type="submit"
            disabled={saving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}
