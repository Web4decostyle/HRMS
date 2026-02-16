import { ReactNode } from "react";

export default function BaseWidget({
  title,
  icon,
  rightSlot,
  children,
}: {
  title: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.06)] overflow-hidden">
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-slate-500 shrink-0">{icon}</div>
          <div className="text-[13px] font-semibold text-slate-700 truncate">
            {title}
          </div>
        </div>
        <div className="shrink-0">{rightSlot}</div>
      </header>

      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}
