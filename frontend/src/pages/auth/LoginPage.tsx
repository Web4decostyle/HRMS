// frontend/src/pages/auth/LoginPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useLoginMutation,
  LoginResponse,
  LoginRequest,
} from "../../features/auth/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: LoginRequest = { username, password };

    try {
      const res: LoginResponse = await login(payload).unwrap();

      // Save token + user somewhere (here: localStorage)
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/");
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.error ??
        "Unable to login. Please check your credentials.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-4 text-slate-800">
          DecoStyle (MERN) Login
        </h1>

        <label className="block mb-3 text-sm">
          <span className="block mb-1">Username</span>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="block mb-4 text-sm">
          <span className="block mb-1">Password</span>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white text-sm font-medium py-2 rounded-md hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-xs text-slate-500 text-center">
          First time here?{" "}
          <Link to="/register" className="text-slate-900 font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
