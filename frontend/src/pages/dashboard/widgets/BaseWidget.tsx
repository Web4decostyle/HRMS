// frontend/src/pages/dashboard/widgets/BaseWidget.tsx
import { ReactNode } from "react";

interface BaseWidgetProps {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  actionSlot?: ReactNode;
  children?: ReactNode;
}

export default function BaseWidget({
  title,
  icon,
  loading = false,
  empty = false,
  emptyText,
  actionSlot,
  children,
}: BaseWidgetProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg">
              {icon}
            </div>
          )}
          <h2 className="text-sm font-semibold text-slate-800">
            {title}
          </h2>
        </div>
        {actionSlot}
      </header>

      {/* Body */}
      <div className="px-4 py-3 flex-1 text-sm text-slate-700">
        {loading ? (
          <div className="h-24 flex items-center justify-center text-xs text-slate-500">
            Loading…
          </div>
        ) : empty ? (
          <div className="h-24 flex flex-col items-center justify-center text-xs text-slate-400 text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200" />
            <p>{emptyText || "No data available"}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}