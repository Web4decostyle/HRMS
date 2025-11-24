import { FormEvent, useState } from "react";
import {
  useGetWorkShiftsQuery,
  useCreateWorkShiftMutation,
} from "../../../features/admin/adminApi";

export default function WorkShiftsPage() {
  const { data: shifts, isLoading } = useGetWorkShiftsQuery();
  const [createShift, { isLoading: isSaving }] = useCreateWorkShiftMutation();

  const [name, setName] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await createShift({
      name: name.trim(),
      hoursPerDay: Number(hoursPerDay) || 8,
    }).unwrap();

    setName("");
    setHoursPerDay("8");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Job</h1>
        <p className="text-xs text-slate-500 mt-1">Work Shifts</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Work Shifts</h2>
          <button
            form="work-shifts-form"
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        <form
          id="work-shifts-form"
          onSubmit={handleSubmit}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Shift Name *</label>
            <input
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General Shift"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Hours per Day</label>
            <input
              type="number"
              min={1}
              max={24}
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-400 focus:outline-none"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
            />
          </div>
        </form>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Work Shift
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">
                    Hours per Day
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !shifts || shifts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr
                      key={s._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-green-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{s.name}</td>
                      <td className="px-4 py-2 text-slate-800">
                        {s.hoursPerDay}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
