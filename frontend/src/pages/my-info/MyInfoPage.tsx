// frontend/src/pages/my-info/MyInfoPage.tsx
import { useMeQuery } from "../../features/auth/authApi";

export default function MyInfoPage() {
  const { data } = useMeQuery();

  const user = data?.user;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">My Info</h1>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs">
        {user ? (
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {user.firstName} {user.lastName}
            </div>
            <div>
              <span className="font-semibold">Username:</span>{" "}
              {user.username}
            </div>
            {user.email && (
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
            )}
            <div>
              <span className="font-semibold">Role:</span> {user.role}
            </div>
          </div>
        ) : (
          <div className="text-slate-400">Unable to load profile.</div>
        )}
      </section>
    </div>
  );
}
