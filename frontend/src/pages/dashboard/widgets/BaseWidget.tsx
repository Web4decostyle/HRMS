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
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="text-slate-500">{icon}</div>
          <div className="text-[13px] font-semibold text-slate-700">
            {title}
          </div>
        </div>
        {rightSlot}
      </header>

      <div className="p-4">{children}</div>
    </section>
  );
}
