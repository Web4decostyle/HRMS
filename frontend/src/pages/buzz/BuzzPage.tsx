// frontend/src/pages/buzz/BuzzPage.tsx
import { FormEvent, useState } from "react";
import {
  useGetBuzzPostsQuery,
  useCreateBuzzPostMutation,
  useLikeBuzzPostMutation,
} from "../../features/buzz/buzzApi";

export default function BuzzPage() {
  const { data: posts } = useGetBuzzPostsQuery();
  const [createPost] = useCreateBuzzPostMutation();
  const [likePost] = useLikeBuzzPostMutation();
  const [content, setContent] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await createPost({ content }).unwrap();
    setContent("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Buzz · Feed</h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-2 text-xs">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update with your organization..."
            className="w-full rounded-md border border-slate-200 px-2 py-1"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Post
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {posts?.map((p) => {
            // ✅ Safe author display
            const authorObj =
              p.author && typeof p.author === "object" ? (p.author as any) : null;

            const authorName = authorObj
              ? `${authorObj.firstName ?? ""} ${authorObj.lastName ?? ""}`.trim() ||
                "User"
              : "User";

            const createdAt = p.createdAt
              ? new Date(p.createdAt).toLocaleString()
              : "";

            return (
              <article
                key={p._id}
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50"
              >
                <div className="flex justify-between mb-1">
                  <div className="font-semibold text-slate-800">
                    {authorName}
                  </div>
                  <div className="text-[10px] text-slate-400">{createdAt}</div>
                </div>
                <p className="text-slate-700 mb-2 whitespace-pre-wrap">
                  {p.content}
                </p>
                <button
                  type="button"
                  onClick={() => likePost(p._id).unwrap()}
                  className="text-[11px] text-green-600 hover:text-green-700"
                >
                  👍 {p.likes?.length ?? 0} like
                  {p.likes && p.likes.length === 1 ? "" : "s"}
                </button>
              </article>
            );
          })}

          {!posts?.length && (
            <div className="text-xs text-slate-400">
              No posts yet. Be the first to share something!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
