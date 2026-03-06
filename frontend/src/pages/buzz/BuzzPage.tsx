import { FormEvent, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BuzzMedia,
  useCreateBuzzPostMutation,
  useDeleteBuzzPostMutation,
  useGetBuzzPostsQuery,
  useLikeBuzzPostMutation,
  useReshareBuzzPostMutation,
  useUpdateBuzzPostMutation,
  useUploadBuzzMediaMutation,
} from "../../features/buzz/buzzApi";
import BuzzComments from "../../components/buzz/BuzzComments";
import BuzzMediaPicker from "../../components/buzz/BuzzMediaPicker";
import { selectAuthRole, selectAuthUser } from "../../features/auth/selectors";

type Filter = "recent" | "liked" | "commented";

const pillBase =
  "px-5 py-2 rounded-full text-xs font-semibold border transition";
const pillActive = "bg-[#ffe9cf] border-[#ffd7a3] text-[#f08a1a]";
const pillIdle = "bg-[#e9edf7] border-transparent text-slate-600";

export default function BuzzPage() {
  const role = useSelector(selectAuthRole);
  const authUser = useSelector(selectAuthUser);

  const canManageBuzz = role === "ADMIN" || role === "HR";

  const [filter, setFilter] = useState<Filter>("recent");
  const { data: posts = [], isLoading } = useGetBuzzPostsQuery({ filter });

  const [createPost, { isLoading: isPosting }] = useCreateBuzzPostMutation();
  const [uploadMedia] = useUploadBuzzMediaMutation();
  const [likePost] = useLikeBuzzPostMutation();
  const [resharePost] = useReshareBuzzPostMutation();
  const [updatePost] = useUpdateBuzzPostMutation();
  const [deletePost] = useDeleteBuzzPostMutation();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<BuzzMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [pickerReset, setPickerReset] = useState(0);

  const canPost = useMemo(() => {
    if (!canManageBuzz) return false;
    return !isUploading && !isPosting && (content.trim() || media.length > 0);
  }, [canManageBuzz, content, media.length, isUploading, isPosting]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canPost) return;

    await createPost({ content: content.trim(), media }).unwrap();

    setContent("");
    setMedia([]);
    setPickerReset((x) => x + 1);
  }

  async function saveEdit(postId: string) {
    if (!editText.trim()) return;
    await updatePost({ id: postId, content: editText.trim() }).unwrap();
    setEditId(null);
    setEditText("");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fb]">
      <div className="flex-1 flex gap-8 px-8 py-6">
        {/* CENTER: feed */}
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Buzz Newsfeed
          </div>

          {/* Composer card */}
          {canManageBuzz ? (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <form onSubmit={submit}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 h-10 rounded-full border border-slate-200 px-4 text-xs bg-white outline-none focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="submit"
                    disabled={!canPost}
                    className="h-10 px-8 rounded-full bg-[#ff7a1a] text-white text-xs font-semibold disabled:opacity-60"
                  >
                    {isUploading ? "Uploading…" : isPosting ? "Posting…" : "Post"}
                  </button>
                </div>

                <div className="mt-3 flex gap-4 justify-center">
                  <div className="px-6 py-2 rounded-full bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      🖼️ <span>Share Photos</span>
                    </div>

                    <div className="mt-2">
                      <BuzzMediaPicker
                        resetSignal={pickerReset}
                        upload={async (fd) => {
                          setIsUploading(true);
                          try {
                            return await uploadMedia(fd).unwrap();
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        onUploaded={(m) => setMedia(m)}
                      />
                    </div>
                  </div>

                  <div className="px-6 py-2 rounded-full bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      🎥 <span>Share Video</span>
                    </div>
                  </div>
                </div>
              </form>
            </section>
          ) : (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="text-sm font-semibold text-slate-700">
                Buzz posting is restricted
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Only Admin and HR can create posts, comment, or reshare. You can still view and like posts.
              </div>
            </section>
          )}

          {/* Filter pills */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter("recent")}
              className={`${pillBase} ${
                filter === "recent" ? pillActive : pillIdle
              }`}
            >
              🕒 Most Recent Posts
            </button>
            <button
              type="button"
              onClick={() => setFilter("liked")}
              className={`${pillBase} ${
                filter === "liked" ? pillActive : pillIdle
              }`}
            >
              💜 Most Liked Posts
            </button>
            <button
              type="button"
              onClick={() => setFilter("commented")}
              className={`${pillBase} ${
                filter === "commented" ? pillActive : pillIdle
              }`}
            >
              💬 Most Commented Posts
            </button>
          </div>

          {/* Posts */}
          <div className="mt-4 space-y-4">
            {isLoading && (
              <div className="text-xs text-slate-500">Loading…</div>
            )}

            {posts.map((p) => {
              const isAuthor =
                !!authUser?.id &&
                ((p as any).author?._id === authUser.id ||
                  (p as any).author?.id === authUser.id);

              const canEditDeleteThisPost = canManageBuzz && isAuthor;

              return (
                <article
                  key={p._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {p.author?.firstName} {p.author?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    </div>

                    {canEditDeleteThisPost && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(openMenu === p._id ? null : p._id)
                          }
                          className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                        >
                          ⋯
                        </button>

                        {openMenu === p._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                              onClick={() => {
                                setEditId(p._id);
                                setEditText(p.content || "");
                                setOpenMenu(null);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-slate-50"
                              onClick={async () => {
                                setOpenMenu(null);
                                await deletePost(p._id).unwrap();
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {p.reshareOf && (
                    <div className="mt-2 text-xs text-slate-500">
                      Reshared from{" "}
                      <span className="font-semibold">
                        {p.reshareOf.author?.firstName}{" "}
                        {p.reshareOf.author?.lastName}
                      </span>
                    </div>
                  )}

                  {editId === p._id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(p._id)}
                        className="px-4 rounded-full bg-green-600 text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(null);
                          setEditText("");
                        }}
                        className="px-4 rounded-full border text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                      {p.content}
                    </div>
                  )}

                  {p.media?.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {p.media.map((m, i) =>
                        m.type === "VIDEO" ? (
                          <video
                            key={i}
                            src={m.url}
                            controls
                            className="w-full max-w-[520px] rounded-xl mx-auto"
                          />
                        ) : (
                          <img
                            key={i}
                            src={m.url}
                            className="w-full max-w-[520px] rounded-xl mx-auto"
                            alt=""
                          />
                        )
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => likePost(p._id)}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        title="Like"
                      >
                        ❤️
                      </button>

                      {canManageBuzz && (
                        <button
                          type="button"
                          onClick={() => resharePost({ id: p._id })}
                          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                          title="Reshare"
                        >
                          🔁
                        </button>
                      )}

                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        title="Copy link"
                      >
                        🔗
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 text-right">
                      <div className="text-green-500 font-semibold">
                        ❤️ {p.likes?.length || 0} Likes
                      </div>
                      <div>
                        {p.commentsCount || 0} Comments, {p.resharesCount || 0}{" "}
                        Shares
                      </div>
                    </div>
                  </div>

                  <BuzzComments postId={p._id} />
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Upcoming anniversaries */}
        <div className="w-80">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-full">
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Upcoming Anniversaries
            </div>
            <div className="flex flex-col items-center justify-center h-[340px] text-center text-sm text-slate-400">
              <div className="text-5xl mb-3">🏵️</div>
              <div>No Records Found</div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12 flex items-center justify-center text-[11px] text-slate-400">
        Decostyle Buzz · {new Date().getFullYear()} · All rights reserved.
      </div>
    </div>
  );
}