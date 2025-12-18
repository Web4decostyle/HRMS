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
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
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
                        className="text-[11px] text-red-500 hover:underline"
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

      <AttachmentsBlock employeeId={employeeId} title="Attachments" />
    </>
  );
}