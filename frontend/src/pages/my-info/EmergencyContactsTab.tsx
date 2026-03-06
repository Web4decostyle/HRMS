import {
  useGetEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
} from "../../features/pim/pimApi";
import AttachmentsBlock from "./AttachmentsBlock";

export default function EmergencyContactsTab({
  employeeId,
}: {
  employeeId: string;
}) {
  const { data: contacts = [] } = useGetEmergencyContactsQuery(employeeId);
  const [createContact] = useCreateEmergencyContactMutation();
  const [deleteContact] = useDeleteEmergencyContactMutation();

  return (
    <>
      <div className="px-3 sm:px-5 lg:px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Emergency Contacts
          </h2>

          <button
            type="button"
            onClick={() => {
              const name = prompt("Contact name?");
              if (!name) return;
              createContact({ employeeId, data: { name } });
            }}
            className="w-full sm:w-auto px-5 h-10 sm:h-9 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="px-3 sm:px-5 lg:px-7 pt-4 pb-3">
        {/* Mobile / tablet card view */}
        <div className="block xl:hidden space-y-3">
          {contacts.length === 0 ? (
            <div className="border border-[#e3e5f0] rounded-xl bg-white px-4 py-6 text-center text-[11px] text-slate-400">
              No Records Found
            </div>
          ) : (
            contacts.map((c: any) => (
              <div
                key={c._id}
                className="rounded-xl border border-[#e3e5f0] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-slate-800 break-words">
                      {c.name || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 break-words">
                      {c.relationship || "No relationship"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.confirm("Delete?") &&
                      deleteContact({ employeeId, id: c._id })
                    }
                    className="shrink-0 text-[11px] text-green-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-slate-500 font-medium">
                      Home Telephone
                    </div>
                    <div className="text-slate-700 mt-1 break-words">
                      {c.homeTelephone || "—"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-slate-500 font-medium">Mobile</div>
                    <div className="text-slate-700 mt-1 break-words">
                      {c.mobile || "—"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
                    <div className="text-slate-500 font-medium">
                      Work Telephone
                    </div>
                    <div className="text-slate-700 mt-1 break-words">
                      {c.workTelephone || "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden xl:block border border-[#e3e5f0] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Relationship
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Home Telephone
                </th>
                <th className="px-3 py-2 text-left font-semibold">Mobile</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Work Telephone
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-[11px] text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                contacts.map((c: any) => (
                  <tr key={c._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{c.relationship || ""}</td>
                    <td className="px-3 py-2">{c.homeTelephone || ""}</td>
                    <td className="px-3 py-2">{c.mobile || ""}</td>
                    <td className="px-3 py-2">{c.workTelephone || ""}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete?") &&
                          deleteContact({ employeeId, id: c._id })
                        }
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

      <div className="px-3 sm:px-5 lg:px-7 pb-4">
        <AttachmentsBlock employeeId={employeeId} title="Attachments" />
      </div>
    </>
  );
}