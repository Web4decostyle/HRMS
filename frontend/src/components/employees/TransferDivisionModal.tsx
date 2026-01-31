import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useGetDivisionsQuery } from "../../features/divisions/divisionsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  currentDivisionId?: string | null;
  onConfirm: (divisionId: string | null) => Promise<void> | void;
  title?: string;
};

export default function TransferDivisionModal({
  open,
  onClose,
  currentDivisionId,
  onConfirm,
  title = "Transfer Division",
}: Props) {
  const { data: divisions = [], isLoading } = useGetDivisionsQuery();
  const [divisionId, setDivisionId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    setDivisionId(currentDivisionId ? String(currentDivisionId) : "");
  }, [open, currentDivisionId]);

  const activeDivisions = useMemo(
    () => divisions.filter((d) => d.isActive !== false),
    [divisions]
  );

  if (!open) return null;

  async function handleSave() {
    setError(null);

    // If no change
    const next = divisionId ? divisionId : "";
    const current = currentDivisionId ? String(currentDivisionId) : "";
    if (next === current) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await onConfirm(divisionId ? divisionId : null);
      onClose();
    } catch (e: any) {
      setError(
        e?.data?.message ||
          e?.message ||
          "Failed to transfer division. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => !saving && onClose()}
      />

      {/* modal */}
      <div className="relative w-[92vw] max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select a new division for this employee.
            </p>
          </div>

          <button
            type="button"
            className="h-9 w-9 rounded-full hover:bg-slate-50 flex items-center justify-center"
            onClick={() => !saving && onClose()}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-500">
              Division
            </label>

            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              disabled={saving}
            >
              <option value="">
                {isLoading ? "Loading..." : "— No Division —"}
              </option>

              {activeDivisions.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-400">
              Choosing “No Division” will remove the employee from any division.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="px-4 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 h-9 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
