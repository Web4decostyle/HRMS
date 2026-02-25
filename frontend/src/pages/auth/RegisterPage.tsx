// frontend/src/pages/auth/RegisterPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation, RegisterRequest } from "../../features/auth/authApi";
import logo from "../../assets/logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  function updateField<K extends keyof RegisterRequest>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const passwordsMatch = form.password === confirmPassword;

  const canSubmit = useMemo(() => {
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.username.trim().length >= 3 &&
      form.password.trim().length >= 6 &&
      passwordsMatch
    );
  }, [form, passwordsMatch]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await registerUser({
        ...form,
        email: (form.email ?? "").trim() || "",
      }).unwrap();

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
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-3">
            <img src={logo} alt="DecoStyle" className="h-10 w-auto object-contain" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500 text-center">
            Register as an <span className="font-medium text-slate-700">ESS User</span>
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-lg"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />

          <div className="p-6 sm:p-7">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="First Name">
                <Input
                  value={form.firstName}
                  onChange={(v) => updateField("firstName", v)}
                  placeholder="e.g. Utkarsh"
                />
              </Field>

              <Field label="Last Name">
                <Input
                  value={form.lastName}
                  onChange={(v) => updateField("lastName", v)}
                  placeholder="e.g. Sharma"
                />
              </Field>
            </div>

            {/* Username */}
            <div className="mt-3">
              <Field label="Username">
                <Input
                  value={form.username}
                  onChange={(v) => updateField("username", v)}
                  placeholder="Minimum 3 characters"
                  leftIcon="👤"
                />
              </Field>
            </div>

            {/* Email */}
            <div className="mt-3">
              <Field label="Email (optional)">
                <Input
                  value={form.email ?? ""}
                  onChange={(v) => updateField("email", v)}
                  placeholder="user@company.com"
                  leftIcon="✉️"
                />
              </Field>
            </div>

            {/* Password */}
            <div className="mt-3">
              <Field label="Password">
                <Input
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div className="mt-3">
              <Field label="Confirm Password">
                <Input
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter password"
                  type={showConfirm ? "text" : "password"}
                  leftIcon="🔐"
                  rightSlot={
                    <ToggleBtn
                      show={showConfirm}
                      onClick={() => setShowConfirm((s) => !s)}
                    />
                  }
                />
              </Field>

              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-600">
                  Passwords do not match
                </p>
              )}
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
              {isLoading ? "Creating..." : "Create Account"}
            </button>

            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-slate-900 font-semibold hover:underline">
                  Back to login
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

/* ---------- UI helpers ---------- */

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