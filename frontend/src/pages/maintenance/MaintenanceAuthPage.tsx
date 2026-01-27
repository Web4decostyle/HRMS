// frontend/src/pages/maintenance/MaintenanceAuthPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyMaintenanceMutation } from "../../features/maintenance/maintenanceApi";

export default function MaintenanceAuthPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const scope = params.get("scope") || "system-info";
  const next = params.get("next") || "/maintenance/system-info";

  const [password, setPassword] = useState("");
  const [verify, { isLoading, error }] = useVerifyMaintenanceMutation();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await verify({ password, scope }).unwrap();
    nav(next, { replace: true, state: { maintenanceToken: res.maintenanceToken } });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl border border-slate-200"
      >
        <h1 className="text-2xl font-semibold text-slate-800">
          Administrator Access
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Enter your password to continue
        </p>

        <div className="mt-6">
          <label className="text-xs font-semibold text-slate-600">Username</label>
          <input
            disabled
            value={user.username || ""}
            className="w-full h-10 bg-slate-100 border border-slate-200 rounded-lg px-3 mt-1 text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            className="w-full h-10 border border-slate-200 rounded-lg px-3 mt-1 text-sm"
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 mt-2">
            Authentication failed
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => nav("/", { replace: true })}
            className="flex-1 border border-slate-200 rounded-full py-2 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !password}
            className="flex-1 bg-red-600 text-white rounded-full py-2 font-semibold disabled:opacity-60"
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}
