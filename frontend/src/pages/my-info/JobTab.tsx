import { useState, useEffect, useRef } from "react";
import { UploadCloud } from "lucide-react";
import {
  useGetJobQuery,
  useUpdateJobMutation,
} from "../../features/myInfo/myInfoApi";
import {
  useGetEmployeeAttachmentsQuery,
  useUploadEmployeeAttachmentMutation,
  useDeleteEmployeeAttachmentMutation,
} from "../../features/employees/employeesApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function JobTab({ employeeId }: { employeeId: string }) {
  const { data: jobData, isLoading } = useGetJobQuery(employeeId);
  const [updateJob, { isLoading: saving }] = useUpdateJobMutation();

  const [form, setForm] = useState({
    joinedDate: "",
    jobTitle: "",
    jobCategory: "",
    subUnit: "",
    location: "",
    employmentStatus: "",
    includeContractDetails: false,
    contractStartDate: "",
    contractEndDate: "",
  });

  useEffect(() => {
    if (!jobData) return; // nothing yet

    setForm((prev) => ({
      ...prev,
      joinedDate: jobData.joinedDate?.slice(0, 10) || "",
      jobTitle: jobData.jobTitle || "",
      jobCategory: jobData.jobCategory || "",
      subUnit: jobData.subUnit || "",
      location: jobData.location || "",
      employmentStatus: jobData.employmentStatus || "",
      includeContractDetails: jobData.includeContractDetails || false,
      contractStartDate: jobData.contractStartDate?.slice(0, 10) || "",
      contractEndDate: jobData.contractEndDate?.slice(0, 10) || "",
    }));
  }, [jobData]);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggleContract() {
    setForm((prev) => ({
      ...prev,
      includeContractDetails: !prev.includeContractDetails,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateJob({
      employeeId,
      data: {
        ...form,
        joinedDate: form.joinedDate
          ? new Date(form.joinedDate).toISOString()
          : null,
        contractStartDate: form.contractStartDate
          ? new Date(form.contractStartDate).toISOString()
          : null,
        contractEndDate: form.contractEndDate
          ? new Date(form.contractEndDate).toISOString()
          : null,
      },
    }).unwrap();
  }

  /* ================= ATTACHMENTS / CONTRACT FILE ================= */

  const {
    data: attachments = [],
    isLoading: attLoading,
    error: attError,
  } = useGetEmployeeAttachmentsQuery(employeeId);

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadEmployeeAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] =
    useDeleteEmployeeAttachmentMutation();

  // bottom Attachments "+ Add"
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  async function handleAttachmentsFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadAttachment({ employeeId, formData: fd }).unwrap();
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  async function handleDeleteAttachment(id: string) {
    if (!window.confirm("Delete attachment?")) return;
    try {
      await deleteAttachment({ employeeId, id }).unwrap();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  // contract “Browse / upload” (employment contract)
  const contractInputRef = useRef<HTMLInputElement | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  function handleContractFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setContractFile(file);
  }

  async function handleContractUpload() {
    if (!contractFile) {
      alert("Please choose a contract file first.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", contractFile);
      fd.append("description", "Employment Contract");
      await uploadAttachment({ employeeId, formData: fd }).unwrap();
      setContractFile(null);
      if (contractInputRef.current) contractInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Contract upload failed");
    }
  }

  /* ================= RENDER ================= */

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-500">Loading Job Details...</div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">Job Details</h2>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="px-7 pt-6 pb-4 text-[12px] flex flex-col gap-5"
      >
        {/* Row 1: Joined Date / Job Title / Job Specification */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelCls}>Joined Date</label>
            <input
              type="date"
              name="joinedDate"
              value={form.joinedDate}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Job Title</label>
            <select
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">-- Select --</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Sales Executive">Sales Executive</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Job Specification</label>
            <input
              disabled
              value="Not Defined"
              className="w-full h-9 rounded border border-[#e3e5f0] bg-[#f5f6fb] px-3 text-[12px] text-slate-500"
            />
          </div>
        </div>

        {/* Row 2: Job Category / Sub Unit / Location */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelCls}>Job Category</label>
            <select
              name="jobCategory"
              value={form.jobCategory}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">-- Select --</option>
              <option value="Professional">Professional</option>
              <option value="Management">Management</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Sub Unit</label>
            <select
              name="subUnit"
              value={form.subUnit}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">-- Select --</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">-- Select --</option>
              <option value="Head Office">Head Office</option>
              <option value="Branch 1">Branch 1</option>
              <option value="Branch 2">Branch 2</option>
            </select>
          </div>
        </div>

        {/* Row 3: Employment Status */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelCls}>Employment Status</label>
            <select
              name="employmentStatus"
              value={form.employmentStatus}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="">-- Select --</option>
              <option value="Full-Time Permanent">Full-Time Permanent</option>
              <option value="Full-Time Contract">Full-Time Contract</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
          <div />
          <div />
        </div>

        {/* Include Employment Contract Details (toggle row) */}
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[11px] text-slate-600">
            Include Employment Contract Details
          </span>

          <button
            type="button"
            onClick={handleToggleContract}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
              form.includeContractDetails ? "bg-[#ff9800]" : "bg-[#d7d9e3]"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                form.includeContractDetails ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Contract details block (only when toggle ON) */}
        {form.includeContractDetails && (
          <>
            {/* Contract Start / End Dates */}
            <div className="grid grid-cols-3 gap-6 mt-3">
              <div>
                <label className={labelCls}>Contract Start Date</label>
                <input
                  type="date"
                  name="contractStartDate"
                  value={form.contractStartDate}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contract End Date</label>
                <input
                  type="date"
                  name="contractEndDate"
                  value={form.contractEndDate}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div />
            </div>

            {/* Contract file upload row (Browse / No file selected / icon) */}
            <div className="mt-3">
              <label className={labelCls}>Contract Details</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => contractInputRef.current?.click()}
                  className="px-4 h-9 rounded border border-[#d5d7e5] bg-[#f5f6fb] text-[12px] text-slate-700 hover:bg-[#e7e9f3]"
                >
                  Browse
                </button>

                <span className="flex-1 text-[11px] text-slate-500 truncate">
                  {contractFile ? contractFile.name : "No file selected"}
                </span>

                <button
                  type="button"
                  onClick={handleContractUpload}
                  disabled={!contractFile || isUploading}
                  className="h-9 w-9 flex items-center justify-center rounded border border-[#d5d7e5] bg-white text-slate-500 hover:bg-[#f5f6fb] disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                </button>

                <input
                  ref={contractInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleContractFileChange}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Accepts up to 1MB
              </p>
            </div>
          </>
        )}

        {/* SAVE BUTTON */}
        <div className="mt-4 flex justify-end border-t border-[#edf0f7] pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* ================= ATTACHMENTS  ================= */}
      <div className="px-7 pb-6">
        <h3 className="text-[12px] font-semibold text-slate-800 mb-2">
          Attachments
        </h3>

        {attachments.length === 0 && !attLoading && !attError && (
          <p className="text-[11px] text-slate-400 mb-2">No Records Found</p>
        )}

        <div className="flex justify-end mb-2">
          <input
            ref={attachmentsInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachmentsFileChange}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => attachmentsInputRef.current?.click()}
            className="px-6 h-8 rounded-full bg-[#f3f4f7] text-[11px] font-semibold text-slate-600 border border-[#dde0eb] hover:bg-[#e7e9f3] disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "+ Add"}
          </button>
        </div>

        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">File Name</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Description
                </th>
                <th className="px-3 py-2 text-left font-semibold">Size</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Date Added
                </th>
                <th className="px-3 py-2 text-left font-semibold">Added By</th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : attError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-red-500"
                  >
                    Failed to load attachments.
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-3" />
                </tr>
              ) : (
                attachments.map((a: any) => (
                  <tr key={a._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2">{a.filename}</td>
                    <td className="px-3 py-2">{a.description || ""}</td>
                    <td className="px-3 py-2">
                      {a.size ? (a.size / 1024).toFixed(1) + " KB" : ""}
                    </td>
                    <td className="px-3 py-2">{a.mimeType || ""}</td>
                    <td className="px-3 py-2">
                      {a.dateAdded ? a.dateAdded.slice(0, 10) : ""}
                    </td>
                    <td className="px-3 py-2">
                      {(a.addedBy && a.addedBy.name) || ""}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteAttachment(a._id)}
                        className="text-[11px] text-red-500 hover:underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}