import React from "react";

export type Tab = "submit" | "myclaims" | "employee" | "assign";

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;

  // controls visibility of admin-only items
  canSeeAdminTabs: boolean;

  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ClaimTopBar({
  activeTab,
  setActiveTab,
  canSeeAdminTabs,
  open,
  setOpen,
}: Props) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ Close dropdown when clicking outside
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [setOpen]);

  const items: { key: Tab; label: string; adminOnly?: boolean }[] = [
    { key: "submit", label: "Submit Claim" },
    { key: "myclaims", label: "My Claims" },
    { key: "employee", label: "Employee Claims", adminOnly: true },
    { key: "assign", label: "Assign Claim", adminOnly: true },
  ];

  const visibleItems = items.filter((it) => (it.adminOnly ? canSeeAdminTabs : true));

  const activeLabel =
    visibleItems.find((i) => i.key === activeTab)?.label ?? "Submit Claim";

  return (
    <div className="bg-white px-8 py-3 shadow-sm flex items-center gap-4 relative">
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-green-500 text-white shadow"
        >
          Claim Requests
          <span className="text-xs">{open ? "▴" : "▾"}</span>
        </button>

        {open && (
          <div className="absolute mt-2 min-w-[240px] rounded-2xl bg-white shadow-lg border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-3 text-[11px] text-slate-500 border-b bg-[#f8fafc]">
              Select Option
              <span className="ml-2 text-slate-700 font-medium">({activeLabel})</span>
            </div>

            <div className="py-2">
              {visibleItems.map((it) => {
                const isActive = activeTab === it.key;
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(it.key);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                      isActive ? "font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}