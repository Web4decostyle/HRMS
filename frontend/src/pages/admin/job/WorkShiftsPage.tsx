import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetWorkShiftsQuery,
  useCreateWorkShiftMutation,
  useUpdateWorkShiftMutation,
  useDeleteWorkShiftMutation,
} from "../../../features/admin/adminApi";
import {
  Plus,
  Clock3,
  PencilLine,
  Trash2,
  TimerReset,
  Users,
} from "lucide-react";

type WorkShift = {
  _id: string;
  name: string;
  hoursPerDay: number;
  from?: string;
  to?: string;
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

  if (
    Number.isNaN(fh) ||
    Number.isNaN(fmnt) ||
    Number.isNaN(th) ||
    Number.isNaN(tmnt)
  ) {
    return 0;
  }

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

  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("17:00");
  const [assigned, setAssigned] = useState("");

  useEffect(() => {
    if (shiftsFromApi) setLocalShifts(shiftsFromApi as WorkShift[]);
  }, [shiftsFromApi]);

  useEffect(() => {
    if (showPanel) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showPanel]);

  const minutes = useMemo(
    () => minutesBetween(fromTime, toTime),
    [fromTime, toTime]
  );

  const durationHours = useMemo(
    () => Math.round((minutes / 60) * 100) / 100,
    [minutes]
  );

  const isBusy = isSaving || isUpdating || isDeleting;

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
    setAssigned(
      (shift.assignedEmployees && shift.assignedEmployees.join(", ")) || ""
    );
    setShowPanel(true);
  }

  function closePanel() {
    setShowPanel(false);
    setEditingId(null);
    setName("");
    setFromTime("09:00");
    setToTime("17:00");
    setAssigned("");
  }

  async function handleSave(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!name.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    const hoursPerDay = durationHours || 8;

    if (editingId) {
      try {
        const payload = {
          id: editingId,
          changes: {
            name: name.trim(),
            hoursPerDay,
            from: fromTime,
            to: toTime,
            assignedEmployees: assigned
              ? assigned.split(",").map((s) => s.trim())
              : [],
          },
        };

        const updated = await updateShift(payload as any).unwrap();

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
                    (assigned
                      ? assigned.split(",").map((x) => x.trim())
                      : []),
                }
              : s
          ) ?? null
        );

        closePanel();
      } catch (err) {
        console.error("Failed to update shift", err);
      }
    } else {
      try {
        const created = await createShift({
          name: name.trim(),
          hoursPerDay,
        }).unwrap();

        const newShift: WorkShift = {
          _id: (created && created._id) || `tmp-${Date.now()}`,
          name: created?.name ?? name.trim(),
          hoursPerDay: created?.hoursPerDay ?? hoursPerDay,
          from: created?.from ?? fromTime,
          to: created?.to ?? toTime,
          assignedEmployees:
            (created?.assignedEmployees as string[]) ??
            (assigned ? assigned.split(",").map((x) => x.trim()) : []),
        };

        setLocalShifts((prev) => {
          const arr = prev ? [...prev] : [];
          arr.unshift(newShift);
          return arr;
        });

        closePanel();
      } catch (err) {
        console.error("Failed to create shift", err);
      }
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm(
      "Delete this work shift? This action cannot be undone."
    );
    if (!ok) return;

    try {
      await deleteShift(id).unwrap();
      setLocalShifts((prev) => prev?.filter((s) => s._id !== id) ?? null);
    } catch (err) {
      console.error("Failed to delete shift", err);
    }
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
            <Clock3 className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Work Shifts
            </h1>
            <p className="text-xs text-slate-500">
              Create and manage daily work schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            {localShifts?.length ?? 0} Records
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Shift
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Work Shift List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Work Shift
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Hours per Day
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Time Range
                </th>
                <th className="w-[160px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : !localShifts || localShifts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                localShifts.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {s.name}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {s.hoursPerDay.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {s.from && s.to ? `${s.from} - ${s.to}` : "-"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(s)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
                          title="Edit"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(s._id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Mobile cards */}
      <div className="md:hidden rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Work Shift List
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading...
            </div>
          ) : !localShifts || localShifts.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No Records Found
            </div>
          ) : (
            localShifts.map((s) => (
              <div
                key={s._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {s.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {s.from && s.to ? `${s.from} - ${s.to}` : "No time range"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      title="Edit"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      title="Delete"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="text-[11px] text-slate-500">
                      Hours per Day
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">
                      {s.hoursPerDay.toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="text-[11px] text-slate-500">Employees</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">
                      {s.assignedEmployees?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showPanel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center px-4 py-8 md:py-16"
        >
          <div className="absolute inset-0 bg-black/35" onClick={closePanel} />

          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <form onSubmit={handleSave}>
              <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Work Shift" : "Add Work Shift"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Configure shift hours and employee assignment details.
                </p>
              </div>

              <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-6">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Shift Name *
                  </label>
                  <input
                    ref={nameInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. General Shift"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-semibold text-slate-600">
                    Working Hours *
                  </label>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <div className="mb-2 text-xs text-slate-500">From</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
                          <Clock3 className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs text-slate-500">To</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                        />
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
                          <Clock3 className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs text-slate-500">
                        Duration Per Day
                      </div>
                      <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                        <TimerReset className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-800">
                          {durationHours.toFixed(2)} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Assigned Employees
                  </label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      placeholder="Comma-separated names"
                      value={assigned}
                      onChange={(e) => setAssigned(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Enter comma-separated names. Typeahead is not implemented yet.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUpdating}
                  className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {editingId
                    ? isUpdating
                      ? "Updating..."
                      : "Update Shift"
                    : isSaving
                    ? "Saving..."
                    : "Save Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}