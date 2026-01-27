// frontend/src/pages/admin/work-shifts/WorkShiftsPage.tsx
import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetWorkShiftsQuery,
  useCreateWorkShiftMutation,
  useUpdateWorkShiftMutation,
  useDeleteWorkShiftMutation,
} from "../../../features/admin/adminApi";

type WorkShift = {
  _id: string;
  name: string;
  hoursPerDay: number;
  from?: string; // "HH:MM"
  to?: string; // "HH:MM"
  assignedEmployees?: string[];
};

function minutesBetween(from: string, to: string) {
  const fm = from.split(":");
  const tm = to.split(":");
  if (fm.length < 2 || tm.length < 2) return 0;
  const fh = parseInt(fm[0], 10);
  const fmnt = parseInt(fm[1], 10);
  const th = parseInt(tm[0], 10);
  const tmnt = parseInt(tm[1], 10);
  if (Number.isNaN(fh) || Number.isNaN(fmnt) || Number.isNaN(th) || Number.isNaN(tmnt)) return 0;
  let start = fh * 60 + fmnt;
  let end = th * 60 + tmnt;
  if (end <= start) end += 24 * 60;
  return end - start;
}

export default function WorkShiftsPage() {
  const { data: shiftsFromApi, isLoading } = useGetWorkShiftsQuery();
  const [createShift, { isLoading: isSaving }] = useCreateWorkShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateWorkShiftMutation();
  const [deleteShift, { isLoading: isDeleting }] = useDeleteWorkShiftMutation();

  const [localShifts, setLocalShifts] = useState<WorkShift[] | null>(null);

  // Add/Edit panel state
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null => adding
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("17:00");
  const [assigned, setAssigned] = useState(""); // comma-separated text UI

  useEffect(() => {
    if (shiftsFromApi) setLocalShifts(shiftsFromApi as WorkShift[]);
  }, [shiftsFromApi]);

  useEffect(() => {
    if (showPanel) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [showPanel]);

  const minutes = useMemo(() => minutesBetween(fromTime, toTime), [fromTime, toTime]);
  const durationHours = useMemo(() => Math.round((minutes / 60) * 100) / 100, [minutes]);

  function openAdd() {
    setEditingId(null);
    setName("");
    setFromTime("09:00");
    setToTime("17:00");
    setAssigned("");
    setShowPanel(true);
  }

  function openEdit(shift: WorkShift) {
    setEditingId(shift._id);
    setName(shift.name ?? "");
    setFromTime(shift.from ?? "09:00");
    setToTime(shift.to ?? "17:00");
    setAssigned((shift.assignedEmployees && shift.assignedEmployees.join(", ")) || "");
    setShowPanel(true);
  }

  async function handleSave(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!name.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    const hoursPerDay = durationHours || 8;

    if (editingId) {
      // update existing
      try {
        const payload = {
          id: editingId,
          changes: {
            name: name.trim(),
            hoursPerDay,
            from: fromTime,
            to: toTime,
            assignedEmployees: assigned ? assigned.split(",").map((s) => s.trim()) : [],
          },
        };
        const updated = await updateShift(payload as any).unwrap();

        // update local state
        setLocalShifts((prev) =>
          prev?.map((s) =>
            s._id === editingId
              ? {
                  ...s,
                  name: updated?.name ?? name.trim(),
                  hoursPerDay: updated?.hoursPerDay ?? hoursPerDay,
                  from: updated?.from ?? fromTime,
                  to: updated?.to ?? toTime,
                  assignedEmployees:
                    (updated?.assignedEmployees as string[]) ??
                    (assigned ? assigned.split(",").map((x) => x.trim()) : []),
                }
              : s
          ) ?? null
        );

        setShowPanel(false);
        setEditingId(null);
      } catch (err) {
        console.error("Failed to update shift", err);
      }
    } else {
      // create new
      try {
        const created = await createShift({
          name: name.trim(),
          hoursPerDay,
          // Optionally send from/to/assigned if API supports
          // from: fromTime,
          // to: toTime,
          // assignedEmployees: assigned ? assigned.split(",").map(s => s.trim()) : [],
        }).unwrap();

        const newShift: WorkShift = {
          _id: (created && created._id) || `tmp-${Date.now()}`,
          name: created?.name ?? name.trim(),
          hoursPerDay: created?.hoursPerDay ?? hoursPerDay,
          from: created?.from ?? fromTime,
          to: created?.to ?? toTime,
          assignedEmployees: (created?.assignedEmployees as string[]) ?? (assigned ? assigned.split(",").map(x => x.trim()) : []),
        };

        setLocalShifts((prev) => {
          const arr = prev ? [...prev] : [];
          arr.unshift(newShift);
          return arr;
        });

        setShowPanel(false);
      } catch (err) {
        console.error("Failed to create shift", err);
      }
    }
  }

async function handleDelete(id: string) {
  const ok = window.confirm("Delete this work shift? This action cannot be undone.");
  if (!ok) return;
  try {
    // pass plain id (string), not an object
    await deleteShift(id).unwrap();

    // remove from local state
    setLocalShifts((prev) => prev?.filter((s) => s._id !== id) ?? null);
  } catch (err) {
    console.error("Failed to delete shift", err);
  }
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

          <div>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold"
              aria-haspopup="dialog"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2 w-10">
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="text-left px-4 py-2 font-semibold">Work Shift</th>
                  <th className="text-left px-4 py-2 font-semibold">Hours per Day</th>
                  <th className="text-left px-4 py-2 font-semibold w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs">
                      Loading...
                    </td>
                  </tr>
                ) : !localShifts || localShifts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-400">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  localShifts.map((s) => (
                    <tr key={s._id} className="odd:bg-white even:bg-slate-50/50">
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-green-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">{s.name}</td>
                      <td className="px-4 py-2 text-slate-800">{s.hoursPerDay.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="px-2 py-1 rounded-md border border-green-200 text-xs text-green-600 hover:bg-green-50"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit panel modal */}
      {showPanel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center px-4 py-10 md:py-20"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />

          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10">
            <form onSubmit={handleSave}>
              <div className="px-8 py-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingId ? "Edit Work Shift" : "Add Work Shift"}
                </h3>
              </div>

              <div className="px-8 py-6 space-y-6 text-sm">
                <div>
                  <label className="block text-slate-600 text-xs font-medium mb-2">Shift Name*</label>
                  <input
                    ref={nameInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. General Shift"
                    className="w-full border border-slate-200 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-medium mb-3">Working Hours *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-xs text-slate-500 mb-2">From</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          className="border border-slate-200 rounded-md px-3 py-2 focus:outline-none"
                        />
                        <div className="w-9 h-9 rounded-md border border-slate-100 flex items-center justify-center bg-white">⏱</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 mb-2">To</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          className="border border-slate-200 rounded-md px-3 py-2 focus:outline-none"
                        />
                        <div className="w-9 h-9 rounded-md border border-slate-100 flex items-center justify-center bg-white">⏱</div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="text-xs text-slate-500 mb-2">Duration Per Day</div>
                      <div className="text-sm text-slate-700 font-medium">{durationHours.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-medium mb-2">Assigned Employees</label>
                  <input
                    placeholder="Type for hints..."
                    value={assigned}
                    onChange={(e) => setAssigned(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                  <p className="text-xs text-slate-400 mt-2">Enter comma-separated names (typeahead not implemented).</p>
                </div>

                <div className="text-xs text-slate-400">*</div>
              </div>

              <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPanel(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-full border border-lime-400 text-lime-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUpdating}
                  className="px-6 py-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {editingId ? (isUpdating ? "Updating..." : "Update") : (isSaving ? "Saving..." : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
