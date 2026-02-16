import BaseWidget from "./BaseWidget";
import { useGetBuzzPostsQuery } from "../../../features/buzz/buzzApi";

export default function BuzzLatestPostWidget() {
  const { data: posts = [], isLoading } = useGetBuzzPostsQuery({
    filter: "recent",
  } as any);

  const latest = posts?.[0];

  return (
    <BaseWidget title="Buzz Latest Posts" icon="💬">
      {isLoading ? (
        <div className="text-xs text-slate-400">Loading…</div>
      ) : !latest ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center text-[11px] text-slate-400">
          No Records Found
        </div>
      ) : (
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-100" />
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  {latest.author?.firstName} {latest.author?.lastName}
                </div>
                <div className="text-[10px] text-slate-400">
                  {latest.createdAt
                    ? new Date(latest.createdAt).toLocaleString()
                    : ""}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 whitespace-pre-wrap break-words">
              {latest.content}
            </div>

            {latest.media?.length > 0 && (
              <div className="mt-3">
                {latest.media[0].type === "VIDEO" ? (
                  <video
                    src={latest.media[0].url}
                    controls
                    className="w-full rounded-xl max-h-[260px] object-cover"
                  />
                ) : (
                  <img
                    src={latest.media[0].url}
                    className="w-full rounded-xl max-h-[260px] object-cover"
                    alt=""
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </BaseWidget>
  );
}
