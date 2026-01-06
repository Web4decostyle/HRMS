import {
  useGetMyAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
} from "../../../features/time/timeApi";

export default function AttendancePage() {
  const { data: records = [], isLoading } = useGetMyAttendanceQuery();
  const [clockIn, { isLoading: clockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: clockingOut }] = useClockOutMutation();

  async function handleClockIn() {
    await clockIn().unwrap();
  }
  async function handleClockOut() {
    await clockOut().unwrap();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Attendance
          </h2>
          <p className="text-sm text-slate-500">
            Clock in and out, and view your recent attendance.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClockIn}
            disabled={clockingIn}
            className="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-sm disabled:opacity-50"
          >
            {clockingIn ? "Clocking in..." : "Clock In"}
          </button>
          <button
            onClick={handleClockOut}
            disabled={clockingOut}
            className="px-3 py-1.5 rounded-md bg-rose-500 text-white text-sm disabled:opacity-50"
          >
            {clockingOut ? "Clocking out..." : "Clock Out"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">In</th>
              <th className="px-4 py-2">Out</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={4}>
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && records.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-xs text-slate-400" colSpan={4}>
                  No attendance records yet.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-2">{r.date.slice(0, 10)}</td>
                <td className="px-4 py-2">
                  {r.inTime ? r.inTime.slice(11, 19) : "-"}
                </td>
                <td className="px-4 py-2">
                  {r.outTime ? r.outTime.slice(11, 19) : "-"}
                </td>
                <td className="px-4 py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
