// frontend/src/pages/buzz/BuzzPage.tsx
import { FormEvent, useMemo, useState } from "react";
import {
  useGetBuzzPostsQuery,
  useCreateBuzzPostMutation,
  useLikeBuzzPostMutation,
} from "../../features/buzz/buzzApi";

type BuzzFilter = "recent" | "liked" | "commented";

export default function BuzzPage() {
  const { data: posts = [], isLoading, isError, refetch } =
    useGetBuzzPostsQuery();
  const [createPost, { isLoading: isPosting }] = useCreateBuzzPostMutation();
  const [likePost] = useLikeBuzzPostMutation();
  const [content, setContent] = useState("");
  const [activeFilter, setActiveFilter] = useState<BuzzFilter>("recent");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await createPost({ content }).unwrap();
    setContent("");
  }

  const sortedPosts = useMemo(() => {
    const arr = [...posts];

    if (activeFilter === "liked") {
      return arr.sort(
        (a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    }

    if (activeFilter === "commented") {
      return arr.sort(
        (a: any, b: any) =>
          (b.comments?.length || 0) - (a.comments?.length || 0)
      );
    }

    // recent
    return arr.sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [posts, activeFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fb]">
      {/* Main content area */}
      <div className="flex-1 flex gap-6 px-8 py-6">
        {/* Left column: tabs */}
        <div className="w-64">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveFilter("recent")}
              className={`w-full text-sm font-semibold rounded-full px-4 py-3 text-left shadow-sm ${
                activeFilter === "recent"
                  ? "bg-[#ffb43a] text-white"
                  : "bg-[#dde1f2] text-slate-600"
              }`}
            >
              Most Recent Posts
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("liked")}
              className={`w-full text-sm font-semibold rounded-full px-4 py-3 text-left ${
                activeFilter === "liked"
                  ? "bg-[#ffb43a] text-white shadow-sm"
                  : "bg-[#dde1f2] text-slate-600"
              }`}
            >
              <span className="mr-2">💜</span>
              Most Liked Posts
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("commented")}
              className={`w-full text-sm font-semibold rounded-full px-4 py-3 text-left ${
                activeFilter === "commented"
                  ? "bg-[#ffb43a] text-white shadow-sm"
                  : "bg-[#dde1f2] text-slate-600"
              }`}
            >
              <span className="mr-2">💬</span>
              Most Commented Posts
            </button>
          </div>
        </div>

        {/* Center column: composer + feed */}
        <div className="flex-1 space-y-4">
          {/* Buzz Newsfeed card (composer + first card) */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Buzz Newsfeed
            </h2>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-[#f7f7ff] border border-slate-100 p-4 mb-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="ml-2 px-5 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold shadow-sm hover:bg-orange-600 disabled:opacity-60"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>

              <div className="flex items-center gap-3 pl-12">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <span>📷</span>
                  <span>Share Photos</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <span>🎥</span>
                  <span>Share Video</span>
                </button>
              </div>
            </form>

            {/* Posts list */}
            <div className="space-y-3">
              {isLoading && (
                <div className="text-xs text-slate-500">Loading posts…</div>
              )}

              {isError && (
                <div className="text-xs text-red-500">
                  Failed to load posts.{" "}
                  <button
                    className="underline text-indigo-600"
                    type="button"
                    onClick={() => refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !sortedPosts.length && !isError && (
                <div className="text-xs text-slate-400">
                  No posts yet. Be the first to share something!
                </div>
              )}

              {!isLoading &&
                !isError &&
                sortedPosts.map((p: any) => {
                  const authorObj =
                    p.author && typeof p.author === "object"
                      ? (p.author as any)
                      : null;

                  const authorName = authorObj
                    ? `${authorObj.firstName ?? ""} ${
                        authorObj.lastName ?? ""
                      }`.trim() || "User"
                    : "User";

                  const createdAt = p.createdAt
                    ? new Date(p.createdAt).toLocaleString()
                    : "";

                  const likesCount = p.likes?.length || 0;
                  const commentsCount = p.comments?.length || 0;

                  return (
                    <article
                      key={p._id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 text-xs"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200" />
                          <div>
                            <div className="text-[13px] font-semibold text-slate-800">
                              {authorName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {createdAt}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-slate-400 text-lg px-2"
                        >
                          ⋯
                        </button>
                      </div>

                      <p className="text-slate-700 mb-3 whitespace-pre-wrap text-[13px]">
                        {p.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => likePost(p._id).unwrap()}
                            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-500"
                          >
                            ❤️ <span>Like</span>
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] text-slate-600"
                          >
                            💬 <span>Comment</span>
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] text-slate-600"
                          >
                            🔗 <span>Share</span>
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-500 text-right">
                          <div className="flex items-center gap-1 justify-end text-red-500">
                            ❤️ {likesCount} Like
                            {likesCount === 1 ? "" : "s"}
                          </div>
                          <div>
                            {commentsCount} Comments, 0 Shares
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </div>

        {/* Right column: upcoming anniversaries */}
        <div className="w-72">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Upcoming Anniversaries
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <div className="mb-3 text-3xl">🌿</div>
              <div>No Records Found</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer like OrangeHRM */}
      <div className="h-10 flex items-center justify-center text-[11px] text-slate-400">
        DecoStyle HRMS · {new Date().getFullYear()} · All rights reserved.
      </div>
    </div>
  );
}
