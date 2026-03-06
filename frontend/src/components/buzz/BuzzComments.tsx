import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
  useUpdateCommentMutation,
} from "../../features/buzz/buzzApi";
import { selectAuthRole, selectAuthUser } from "../../features/auth/selectors";

export default function BuzzComments({ postId }: { postId: string }) {
  const role = useSelector(selectAuthRole);
  const authUser = useSelector(selectAuthUser);

  const canManageBuzz = role === "ADMIN" || role === "HR";

  const { data = [] } = useGetCommentsQuery(postId);
  const [addComment] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  async function submit() {
    if (!canManageBuzz) return;
    if (!text.trim()) return;

    await addComment({ postId, text: text.trim() }).unwrap();
    setText("");
  }

  async function saveEdit(commentId: string) {
    if (!canManageBuzz) return;
    if (!editingText.trim()) return;

    await updateComment({
      postId,
      commentId,
      text: editingText.trim(),
    }).unwrap();

    setEditingId(null);
    setEditingText("");
  }

  return (
    <div className="mt-3 space-y-2">
      {data.map((c: any) => {
        const isAuthor =
          !!authUser?.id &&
          (c.author?._id === authUser.id || c.author?.id === authUser.id);

        const canEditDeleteThisComment = canManageBuzz && isAuthor;

        return (
          <div key={c._id} className="text-xs bg-slate-50 rounded-lg p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800">
                  {c.author?.firstName} {c.author?.lastName}
                </div>

                {editingId === c._id ? (
                  <div className="mt-1 flex gap-2">
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 rounded-full border px-3 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(c._id)}
                      className="px-3 rounded-full bg-green-600 text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                      className="px-3 rounded-full border"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 text-slate-700">{c.text}</div>
                )}
              </div>

              {canEditDeleteThisComment && editingId !== c._id && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-800"
                    onClick={() => {
                      setEditingId(c._id);
                      setEditingText(c.text);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-green-500 hover:text-green-700"
                    onClick={() =>
                      deleteComment({ postId, commentId: c._id }).unwrap()
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {canManageBuzz ? (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border px-3 py-2 text-xs"
          />
          <button
            type="button"
            onClick={submit}
            className="px-4 rounded-full bg-green-600 text-white text-xs font-semibold"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 pt-1">
          Only Admin and HR can comment.
        </div>
      )}
    </div>
  );
}