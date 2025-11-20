import {
  useGetDependentsQuery,
  useCreateDependentMutation,
  useDeleteDependentMutation,
} from "../../features/pim/pimApi";
import AttachmentsBlock from "./AttachmentsBlock";

export default function DependentsTab({
  employeeId,
}: {
  employeeId: string;
}) {
  const { data: dependents = [] } = useGetDependentsQuery(employeeId);
  const [createDep] = useCreateDependentMutation();
  const [deleteDep] = useDeleteDependentMutation();

  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Dependents
          </h2>
          <button
            type="button"
            onClick={() => {
              const name = prompt("Dependent name?");
              if (!name) return;
              createDep({ employeeId, data: { name } });
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
                  Date of Birth
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dependents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-[11px] text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                dependents.map((d: any) => (
                  <tr key={d._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">{d.relationship || ""}</td>
                    <td className="px-3 py-2">
                      {d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : ""}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete?") &&
                          deleteDep({ employeeId, id: d._id })
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
