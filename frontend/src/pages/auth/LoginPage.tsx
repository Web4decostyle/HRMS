// frontend/src/pages/auth/LoginPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation, LoginRequest } from "../../features/auth/authApi";
import logo from "../../assets/logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0;
  }, [username, password]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: LoginRequest = { username, password };

    try {
      await login(payload).unwrap();
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
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-3">
            <img src={logo} alt="DecoStyle" className="h-10 w-auto object-contain" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />

          <div className="p-6 sm:p-7">
            {/* Username */}
            <div>
              <Field label="Username">
                <Input
                  value={username}
                  onChange={setUsername}
                  placeholder="Enter your username"
                  leftIcon="👤"
                />
              </Field>
            </div>

            {/* Password */}
            <div className="mt-4">
              <Field label="Password">
                <Input
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  leftIcon="🔒"
                  rightSlot={
                    <ToggleBtn
                      show={showPassword}
                      onClick={() => setShowPassword((s) => !s)}
                    />
                  }
                />
              </Field>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="w-full mt-5 rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5
                         hover:bg-slate-800 active:scale-[0.99] transition
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Footer */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500">
                First time here?{" "}
                <Link to="/register" className="text-slate-900 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </form>

        <p className="mt-5 text-[11px] text-slate-400 text-center">
          © {new Date().getFullYear()} DecoStyle
        </p>
      </div>
    </div>
  );
}

/* ---------- UI helpers (same pattern as register) ---------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  leftIcon,
  rightSlot,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  leftIcon?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5
                    text-sm text-slate-900
                    focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100 transition">
      {leftIcon && <span className="text-slate-400">{leftIcon}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
      />
      {rightSlot}
    </div>
  );
}

function ToggleBtn({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
    >
      {show ? "Hide" : "Show"}
    </button>
  );
}