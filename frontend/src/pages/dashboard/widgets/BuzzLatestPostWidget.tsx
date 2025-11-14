// frontend/src/pages/dashboard/widgets/BuzzLatestPostWidget.tsx
import BaseWidget from "./BaseWidget";

export default function BuzzLatestPostWidget() {
  const posts = [
    {
      id: 1,
      author: "HR Admin",
      time: "2h ago",
      content: "Welcome to the new DecoStyle MERN dashboard!",
    },
    {
      id: 2,
      author: "HR Team",
      time: "1d ago",
      content: "Don’t forget to submit your timesheets by Friday.",
    },
  ];

  return (
    <BaseWidget title="Latest Buzz" icon="💬" empty={posts.length === 0}>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id} className="text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-0.5">
              <span className="font-medium text-slate-700">
                {post.author}
              </span>
              <span>{post.time}</span>
            </div>
            <p className="text-slate-600 leading-snug">
              {post.content}
            </p>
          </li>
        ))}
      </ul>
    </BaseWidget>
  );
}
