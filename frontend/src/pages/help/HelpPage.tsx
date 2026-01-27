// frontend/src/pages/help/HelpPage.tsx
import { useGetHelpTopicsQuery } from "../../features/help/helpApi";

export default function HelpPage() {
  const { data } = useGetHelpTopicsQuery();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">
        Help & Documentation
      </h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs">
        <ul className="space-y-2">
          {data?.topics.map((t) => (
            <li key={t.id}>
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:underline"
              >
                {t.title}
              </a>
            </li>
          ))}
          {!data?.topics?.length && (
            <li className="text-slate-400">
              No help topics configured yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
