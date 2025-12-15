import { useEffect, useMemo, useRef, useState } from "react";
import { HintItem } from "../../features/maintenance/maintenanceApi";

type Props = {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;

  // hints from parent (already fetched)
  hints: HintItem[];
  isLoading?: boolean;

  onPick: (item: HintItem) => void;
};

export default function Typeahead({
  label,
  required,
  placeholder,
  value,
  onChange,
  hints,
  isLoading,
  onPick,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const show = open && value.trim().length > 0;

  const items = useMemo(() => hints || [], [hints]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type for hints..."}
        className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
      />

      {show ? (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-slate-500">Loading…</div>
          ) : items.length ? (
            items.slice(0, 10).map((it) => (
              <button
                type="button"
                key={it.id}
                onClick={() => {
                  onPick(it);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                {it.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">No results</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
