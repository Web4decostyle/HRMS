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
      {/* ASSIGNED SALARY COMPONENTS */}
      <div className="px-4 sm:px-6 lg:px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Assigned Salary Components
        </h2>
      </div>

      <div className="px-4 sm:px-6 lg:px-7 pt-4 pb-6">
        {isLoading ? (
          <p className="text-[11px] text-slate-400 mb-3">Loading...</p>
        ) : error ? (
          <p className="text-[11px] text-green-500 mb-3">
            Failed to load salary components.
          </p>
        ) : showNoRecords ? (
          <p className="text-[11px] text-slate-400 mb-3">No Records Found</p>
        ) : null}

        {/* Mobile cards */}
        <div className="block lg:hidden space-y-3">
          {hasRows ? (
            salary.map((row: any) => (
              <div
                key={row._id}
                className="rounded-xl border border-[#e3e5f0] bg-white p-4"
              >
                <div className="text-[12px] font-semibold text-slate-800">
                  {row.componentName || "—"}
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="text-slate-500 font-medium">Amount</div>
                    <div className="text-slate-700 mt-0.5">
                      {row.amount ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">Currency</div>
                    <div className="text-slate-700 mt-0.5">
                      {row.currency || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">
                      Pay Frequency
                    </div>
                    <div className="text-slate-700 mt-0.5">
                      {row.payFrequency || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-medium">
                      Direct Deposit Amount
                    </div>
                    <div className="text-slate-700 mt-0.5">
                      {row.directDepositAmount ?? "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="hidden" />
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block border-y border-[#e3e5f0] overflow-x-auto">
          <table className="w-full min-w-[760px] text-[11px] text-slate-700">
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
                <tr className="hidden" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div className="px-4 sm:px-6 lg:px-7 py-4 border-t border-[#f5f6fb]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Attachments
        </h2>
      </div>

      <div className="px-4 sm:px-6 lg:px-7 pb-6">
        <p className="text-[11px] text-slate-400 mb-3">No Records Found</p>

        {/* Mobile */}
        <div className="block lg:hidden rounded-xl border border-[#e3e5f0] bg-white px-4 py-6 text-center text-[11px] text-slate-400">
          No attachment records available
        </div>

        {/* Desktop */}
        <div className="hidden lg:block border-y border-[#e3e5f0] overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11px] text-slate-700">
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
              <tr className="hidden" />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}