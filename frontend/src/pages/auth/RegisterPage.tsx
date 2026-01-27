// frontend/src/pages/auth/RegisterPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useRegisterMutation,
  RegisterRequest,
} from "../../features/auth/authApi";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "ADMIN",
  });

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [registerUser, { isLoading }] = useRegisterMutation();

  function updateField<K extends keyof RegisterRequest>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await registerUser(form).unwrap();
      // after creating admin, redirect to login
      navigate("/login");
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.error ??
        "Unable to register. Please try again.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4 text-slate-800">
          Create Admin User
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="block mb-1">First Name</span>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="block mb-1">Last Name</span>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </label>
        </div>

        <label className="block mt-3 text-sm">
          <span className="block mb-1">Username</span>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
          />
        </label>

        <label className="block mt-3 text-sm">
          <span className="block mb-1">Email (optional)</span>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </label>

        <label className="block mt-3 text-sm">
          <span className="block mb-1">Password</span>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </label>

        <label className="block mt-3 text-sm">
          <span className="block mb-1">Role</span>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="HR">HR</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="ESS">ESS</option>
          </select>
        </label>

        {error && (
          <p className="text-sm text-green-600 mt-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-slate-900 text-white text-sm font-medium py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Create user"}
        </button>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
