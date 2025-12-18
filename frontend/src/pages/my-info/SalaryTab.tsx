// frontend/src/pages/my-info/SalaryTab.tsx
import { useGetSalaryQuery } from "../../features/myInfo/myInfoApi";

const headCell =
  "px-3 py-2 text-left font-semibold text-[11px] text-slate-500";

export default function SalaryTab({ employeeId }: { employeeId: string }) {
  const {
    data: salary = [],
    isLoading,
    error,
  } = useGetSalaryQuery(employeeId);

  const hasRows = Array.isArray(salary) && salary.length > 0;
  const showNoRecords = !isLoading && !error && !hasRows;

  return (
    <>
      {/* ================= ASSIGNED SALARY COMPONENTS ================= */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Assigned Salary Components
        </h2>
      </div>

      <div className="px-7 pt-4 pb-6">
        {isLoading ? (
          <p className="text-[11px] text-slate-400 mb-3">Loading...</p>
        ) : error ? (
          <p className="text-[11px] text-red-500 mb-3">
            Failed to load salary components.
          </p>
        ) : showNoRecords ? (
          <p className="text-[11px] text-slate-400 mb-3">No Records Found</p>
        ) : null}

        {/* Header-only table (rows only if data exists) */}
        <div className="border-y border-[#e3e5f0]">
          <table className="w-full text-[11px] text-slate-700">
            <thead className="bg-[#f5f6fb]">
              <tr>
                <th className={headCell}>Salary Component</th>
                <th className={headCell}>Amount</th>
                <th className={headCell}>Currency</th>
                <th className={headCell}>Pay Frequency</th>
                <th className={headCell}>Direct Deposit Amount</th>
              </tr>
            </thead>
            <tbody>
              {hasRows ? (
                salary.map((row: any) => (
                  <tr key={row._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">{row.componentName}</td>
                    <td className="px-3 py-2">{row.amount}</td>
                    <td className="px-3 py-2">{row.currency}</td>
                    <td className="px-3 py-2">{row.payFrequency}</td>
                    <td className="px-3 py-2">
                      {row.directDepositAmount ?? ""}
                    </td>
                  </tr>
                ))
              ) : (
                // keep tbody valid but visually empty when there are no rows
                <tr className="hidden" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= ATTACHMENTS ======================= */}
      <div className="px-7 py-4 border-t border-[#f5f6fb]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Attachments
        </h2>
      </div>

      <div className="px-7 pb-6">
        
        <p className="text-[11px] text-slate-400 mb-3">No Records Found</p>

        <div className="border-y border-[#e3e5f0]">
          <table className="w-full text-[11px] text-slate-700">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className={headCell}>File Name</th>
                <th className={headCell}>Description</th>
                <th className={headCell}>Size</th>
                <th className={headCell}>Type</th>
                <th className={headCell}>Date Added</th>
                <th className={headCell}>Added By</th>
                <th className={headCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* skeleton only – no data rows, same as screenshot */}
              <tr className="hidden" />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}