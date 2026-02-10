import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

import TimeTopBar from "./TimeTopBar";

/* ------------------------------------------------------------------
 * My Timesheet view (UI clone of the screenshot)
 * ------------------------------------------------------------------ */

const days = [
  { label: "1", day: "Mon" },
  { label: "2", day: "Tue" },
  { label: "3", day: "Wed" },
  { label: "4", day: "Thu" },
  { label: "5", day: "Fri" },
  { label: "6", day: "Sat" },
  { label: "7", day: "Sun" },
];

export default function MyTimesheetViewPage() {
  // hooks MUST be inside component
  const { id } = useParams<{ id: string }>(); // route: /time/timesheets/:id
  const navigate = useNavigate();

  // for now this is static; later you can update from API
  const [periodLabel] = useState("2025-12-01 to 2025-12-07");

  return (
    <div className="space-y-6">
      {/* module top bar */}
      <TimeTopBar />

      {/* Timesheet card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800">
              My Timesheet
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium">Timesheet Period</span>

            {/* Period selector pill */}
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 bg-slate-50 hover:bg-white">
              <FiCalendar className="text-slate-400" />
              <span>{periodLabel}</span>
            </button>

            {/* Left / right arrows */}
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronLeft className="text-slate-500" />
            </button>
            <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <FiChevronRight className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-6 py-3 text-left font-medium">Project</th>
                <th className="px-3 py-3 text-left font-medium">Activity</th>
                {days.map((d) => (
                  <th
                    key={d.day}
                    className="px-3 py-3 text-center font-medium"
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] uppercase tracking-wide">
                      {d.day}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* No records row */}
              <tr>
                <td
                  className="px-6 py-6 text-xs text-slate-400 border-t border-slate-100"
                  colSpan={days.length + 3}
                >
                  No Records Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer: status + buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            <span className="font-semibold">Status:</span>{" "}
            <span>Not Submitted</span>
          </div>

          <div className="flex gap-3">
            <button
              className="px-6 py-1.5 rounded-full border border-lime-500 text-xs font-semibold text-lime-600 bg-white hover:bg-lime-50"
              onClick={() => id && navigate(`/time/timesheets/${id}/edit`)}
            >
              Edit
            </button>
            <button className="px-6 py-1.5 rounded-full bg-lime-500 text-xs font-semibold text-white hover:bg-lime-600">
              Submit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
