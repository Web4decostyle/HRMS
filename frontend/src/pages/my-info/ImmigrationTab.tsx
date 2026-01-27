// frontend/src/pages/my-info/ImmigrationTab.tsx
import { useRef, useState } from "react";
import {
  useGetEmployeeAttachmentsQuery,
  useUploadEmployeeAttachmentMutation,
  useDeleteEmployeeAttachmentMutation,
} from "../../features/employees/employeesApi";

export default function ImmigrationTab({
  employeeId,
}: {
  employeeId: string;
}) {
  /* -------------------- Attachments data/hooks -------------------- */
  const {
    data: attachments = [],
    isLoading,
    error,
  } = useGetEmployeeAttachmentsQuery(employeeId);

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadEmployeeAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] =
    useDeleteEmployeeAttachmentMutation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [desc, setDesc] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (desc) fd.append("description", desc);
      await uploadAttachment({ employeeId, formData: fd }).unwrap();
      setDesc("");
      // clear input so same file can be selected again later
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete attachment?")) return;
    try {
      await deleteAttachment({ employeeId, id }).unwrap();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <>
      {/* ===================== TOP: IMMIGRATION RECORDS ===================== */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Immigration Records
          </h2>

          
          <button
            type="button"
            className="px-6 h-8 rounded-full bg-[#f3f4f7] text-[11px] font-semibold text-slate-600 border border-[#dde0eb] hover:bg-[#e7e9f3]"
          >
            + Add
          </button>
        </div>
      </div>

      {/* table area */}
      <div className="px-7 pt-4 pb-2">
        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Document</th>
                <th className="px-3 py-2 text-left font-semibold">Number</th>
                <th className="px-3 py-2 text-left font-semibold">Issued By</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Issued Date
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Expiry Date
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* exact “No Records Found” single row */}
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[11px] text-slate-400"
                >
                  No Records Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== ATTACHMENTS SECTION ===================== */}
      <div className="px-7 pt-6 pb-6">
        {/* header row: title + grey +Add pill */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-slate-800">
            Attachments
          </h3>

          <div className="flex items-center gap-2">
            {/* small, subtle description input (optional) */}
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="h-8 px-3 rounded-full border border-[#dde0eb] text-[11px] text-slate-700 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]"
            />

            {/* hidden file input triggered by +Add pill */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 h-8 rounded-full bg-[#f3f4f7] text-[11px] font-semibold text-slate-600 border border-[#dde0eb] hover:bg-[#e7e9f3] disabled:opacity-60"
            >
              {isUploading ? "Uploading..." : "+ Add"}
            </button>
          </div>
        </div>

        {/* “No Records Found” text line (like the screenshot) */}
        {attachments.length === 0 && !isLoading && !error && (
          <p className="text-[11px] text-slate-400 mb-2">No Records Found</p>
        )}

        {/* attachments table strip */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-green-500"
                  >
                    Failed to load attachments.
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                // when there are no records we already show “No Records Found”
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-center text-[11px]">
                    {/* keep body minimal when empty */}
                  </td>
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
                        onClick={() => handleDelete(a._id)}
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