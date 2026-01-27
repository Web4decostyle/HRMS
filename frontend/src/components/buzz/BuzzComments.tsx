import { useState } from "react";
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
  useUpdateCommentMutation,
} from "../../features/buzz/buzzApi";

export default function BuzzComments({ postId }: { postId: string }) {
  const { data = [] } = useGetCommentsQuery(postId);
  const [addComment] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  async function submit() {
    if (!text.trim()) return;
    await addComment({ postId, text: text.trim() }).unwrap();
    setText("");
  }

  async function saveEdit(commentId: string) {
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
      {data.map((c) => (
        <div key={c._id} className="text-xs bg-slate-50 rounded-lg p-2">
          <div className="flex items-start justify-between gap-2">
            <div>
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
                    className="px-3 rounded-full bg-red-600 text-white"
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

            {/* Edit/Delete */}
            {editingId !== c._id && (
              <div className="flex gap-2">
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
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteComment({ postId, commentId: c._id }).unwrap()}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add comment */}
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
          className="px-4 rounded-full bg-red-600 text-white text-xs font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
