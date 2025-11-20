import AttachmentsBlock from "./AttachmentsBlock";

export default function ImmigrationTab({
  employeeId,
}: {
  employeeId: string;
}) {
  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Immigration Records
          </h2>
          <button
            type="button"
            className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>
      </div>

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
                <th className="px-3 py-2 text-left font-semibold">
                  Issued By
                </th>
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

      <AttachmentsBlock employeeId={employeeId} title="Attachments" />
    </>
  );
}
