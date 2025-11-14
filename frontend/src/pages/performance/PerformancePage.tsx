// frontend/src/pages/performance/PerformancePage.tsx
import { useGetReviewsQuery } from "../../features/performance/performanceApi";

export default function PerformancePage() {
  const { data: reviews } = useGetReviewsQuery();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Performance · Reviews
      </h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-slate-500 border-b">
            <tr>
              <th className="py-1">Employee</th>
              <th className="py-1">Reviewer</th>
              <th className="py-1">Period</th>
              <th className="py-1">Rating</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews?.map((r) => (
              <tr key={r._id} className="border-b last:border-0">
                <td className="py-1">
                  {typeof r.employee === "object"
                    ? `${r.employee.firstName} ${r.employee.lastName}`
                    : r.employee}
                </td>
                <td className="py-1">
                  {typeof r.reviewer === "object"
                    ? `${r.reviewer.firstName} ${r.reviewer.lastName}`
                    : r.reviewer}
                </td>
                <td className="py-1">
                  {r.periodStart.slice(0, 10)} – {r.periodEnd.slice(0, 10)}
                </td>
                <td className="py-1">{r.rating}/5</td>
                <td className="py-1 text-[11px]">{r.status}</td>
              </tr>
            ))}
            {!reviews?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="py-3 text-center text-slate-400 text-xs"
                >
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
