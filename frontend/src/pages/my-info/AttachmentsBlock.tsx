import { useState } from "react";
import {
  useGetEmployeeAttachmentsQuery,
  useUploadEmployeeAttachmentMutation,
  useDeleteEmployeeAttachmentMutation,
} from "../../features/employees/employeesApi";

interface AttachmentsBlockProps {
  employeeId: string;
  title?: string;
}

export default function AttachmentsBlock({
  employeeId,
  title = "Attachments",
}: AttachmentsBlockProps) {
  const { data: attachments = [], isLoading, error } =
    useGetEmployeeAttachmentsQuery(employeeId);

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadEmployeeAttachmentMutation();
  const [deleteAttachment, { isLoading: isDeleting }] =
    useDeleteEmployeeAttachmentMutation();

  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");

  async function handleUpload() {
    if (!file) return alert("Choose a file first");

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (desc) fd.append("description", desc);

      await uploadAttachment({ employeeId, formData: fd }).unwrap();
      setFile(null);
      setDesc("");
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
    <div className="mt-6 border-t border-[#edf0f7] pt-4 px-7">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold text-slate-800">{title}</h3>

        <div className="flex items-center gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
            className="px-3 py-1 rounded border text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-1 bg-[#f7941d] text-white rounded-full text-[11px] font-semibold disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "+ Add"}
          </button>
        </div>
      </div>

      <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-[#f5f6fb] text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left w-6">
                <input type="checkbox" disabled />
              </th>
              <th className="px-3 py-2 text-left font-semibold">File Name</th>
              <th className="px-3 py-2 text-left font-semibold">
                Description
              </th>
              <th className="px-3 py-2 text-left font-semibold">Size</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Date Added</th>
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
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  No Records Found
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
                  <td className="px-3 py-2">{a.addedBy?.name || ""}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={isDeleting}
                      className="text-[11px] text-green-500 hover:underline"
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
  );
}