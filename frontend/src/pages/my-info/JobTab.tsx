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
  "w-full h-10 sm:h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

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
    if (!jobData) return;

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

  const {
    data: attachments = [],
    isLoading: attLoading,
    error: attError,
  } = useGetEmployeeAttachmentsQuery(employeeId);

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadEmployeeAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] =
    useDeleteEmployeeAttachmentMutation();

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

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 text-sm text-slate-500">
        Loading Job Details...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Job Details
        </h2>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="px-4 sm:px-6 lg:px-7 pt-5 sm:pt-6 pb-4 text-[12px] flex flex-col gap-5"
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
              className="w-full h-10 sm:h-9 rounded border border-[#e3e5f0] bg-[#f5f6fb] px-3 text-[12px] text-slate-500"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
          <div className="hidden md:block" />
          <div className="hidden xl:block" />
        </div>

        {/* Toggle */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-slate-600">
            Include Employment Contract Details
          </span>

          <button
            type="button"
            onClick={handleToggleContract}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              form.includeContractDetails ? "bg-[#ff9800]" : "bg-[#d7d9e3]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.includeContractDetails
                  ? "translate-x-5"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {form.includeContractDetails && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-3">
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
              <div className="hidden xl:block" />
            </div>

            <div className="mt-3">
              <label className={labelCls}>Contract Details</label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => contractInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 h-10 sm:h-9 rounded border border-[#d5d7e5] bg-[#f5f6fb] text-[12px] text-slate-700 hover:bg-[#e7e9f3]"
                >
                  Browse
                </button>

                <span className="flex-1 text-[11px] text-slate-500 truncate min-w-0">
                  {contractFile ? contractFile.name : "No file selected"}
                </span>

                <button
                  type="button"
                  onClick={handleContractUpload}
                  disabled={!contractFile || isUploading}
                  className="h-10 w-full sm:w-10 sm:h-9 flex items-center justify-center rounded border border-[#d5d7e5] bg-white text-slate-500 hover:bg-[#f5f6fb] disabled:opacity-50"
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
        <div className="mt-4 flex justify-stretch sm:justify-end border-t border-[#edf0f7] pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-7 h-10 sm:h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* ATTACHMENTS */}
      <div className="px-4 sm:px-6 lg:px-7 pb-6">
        <h3 className="text-[12px] font-semibold text-slate-800 mb-2">
          Attachments
        </h3>

        {attachments.length === 0 && !attLoading && !attError && (
          <p className="text-[11px] text-slate-400 mb-2">No Records Found</p>
        )}

        <div className="flex justify-stretch sm:justify-end mb-3">
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
            className="w-full sm:w-auto px-6 h-10 sm:h-8 rounded-full bg-[#f3f4f7] text-[11px] font-semibold text-slate-600 border border-[#dde0eb] hover:bg-[#e7e9f3] disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "+ Add"}
          </button>
        </div>

        {/* Mobile card view */}
        <div className="block lg:hidden space-y-3">
          {attLoading ? (
            <div className="rounded-xl border border-[#e3e5f0] bg-white px-4 py-6 text-center text-[11px]">
              Loading...
            </div>
          ) : attError ? (
            <div className="rounded-xl border border-[#e3e5f0] bg-white px-4 py-6 text-center text-[11px] text-green-500">
              Failed to load attachments.
            </div>
          ) : attachments.length === 0 ? (
            <div className="hidden" />
          ) : (
            attachments.map((a: any) => (
              <div
                key={a._id}
                className="rounded-xl border border-[#e3e5f0] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-slate-800 truncate">
                      {a.filename || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {a.description || "No description"}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteAttachment(a._id)}
                    className="shrink-0 text-[11px] text-green-500 hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="text-slate-500 font-medium">Size</div>
                    <div className="text-slate-700 mt-0.5">
                      {a.size ? (a.size / 1024).toFixed(1) + " KB" : "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Type</div>
                    <div className="text-slate-700 mt-0.5">
                      {a.mimeType || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Date Added</div>
                    <div className="text-slate-700 mt-0.5">
                      {a.dateAdded ? a.dateAdded.slice(0, 10) : "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Added By</div>
                    <div className="text-slate-700 mt-0.5">
                      {(a.addedBy && a.addedBy.name) || "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block border border-[#e3e5f0] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[1050px] text-[11px]">
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
                    className="px-3 py-6 text-center text-green-500"
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
                        className="text-[11px] text-green-500 hover:underline disabled:opacity-60"
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