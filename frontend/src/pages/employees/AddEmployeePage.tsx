// frontend/src/pages/employees/AddEmployeePage.tsx
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
} from "../../features/employees/employeesApi";
import { useRegisterMutation } from "../../features/auth/authApi";

type LoginStatus = "ENABLED" | "DISABLED";

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  createLogin: boolean;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  loginStatus: LoginStatus;
}

const initialForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  employeeId: "",
  createLogin: true,
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  loginStatus: "ENABLED",
};

export default function AddEmployeePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // UI only for now
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // NEW: config dropdown open/close (same as EmployeesPage)
  const [configOpen, setConfigOpen] = useState(false);

  // For auto-generating next employeeId like 0002
  const { data: employees = [] } = useGetEmployeesQuery(undefined);

  const [createEmployee, { isLoading: isCreatingEmployee }] =
    useCreateEmployeeMutation();
  const [registerUser, { isLoading: isCreatingUser }] = useRegisterMutation();

  const isSaving = isCreatingEmployee || isCreatingUser;

  // Auto-fill next employeeId if empty and employees loaded
  useEffect(() => {
    if (!form.employeeId && employees.length > 0) {
      let maxNum = 0;
      for (const emp of employees) {
        const n = parseInt(emp.employeeId, 10);
        if (!Number.isNaN(n) && n > maxNum) maxNum = n;
      }
      const next = String(maxNum + 1 || 1).padStart(4, "0");
      setForm((prev) => ({ ...prev, employeeId: next }));
    }
  }, [employees, form.employeeId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      const checked = e.target.checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }
    if (!form.employeeId.trim()) {
      setError("Employee Id is required.");
      return;
    }

    if (form.createLogin) {
      if (!form.username.trim()) {
        setError("Username is required when creating login details.");
        return;
      }
      if (!form.email.trim()) {
        setError("Email is required when creating login details.");
        return;
      }
      if (!form.password) {
        setError("Password is required when creating login details.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Password and Confirm Password must match.");
        return;
      }
    }

    try {
      let userEmail: string | undefined = undefined;

      // 1) Optionally create login user
      if (form.createLogin) {
        const registerRes = await registerUser({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: "ESS", // normal employee self-service role
          isActive: form.loginStatus === "ENABLED",
        }).unwrap();

        userEmail = registerRes.user.email;
      }

      // 2) Create employee record
      const status = form.loginStatus === "DISABLED" ? "INACTIVE" : "ACTIVE";

      await createEmployee({
        employeeId: form.employeeId.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: userEmail || form.email.trim() || "no-email@example.com",
        status,
      }).unwrap();

      setSuccess("Employee created successfully.");
      setTimeout(() => {
        navigate("/employees");
      }, 800);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Failed to save employee. Please try again.";
      setError(msg);
    }
  }

  const tabBase =
    "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

  return (
    <div className="space-y-5">
      {/* PIM Tabs */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">PIM</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configuration + dropdown (same as EmployeesPage) */}
          <div
            className="relative"
            onMouseLeave={() => setConfigOpen(false)}
          >
            <button
              type="button"
              onClick={() => setConfigOpen((o) => !o)}
              className={`${tabBase} ${
                configOpen
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>Configuration</span>
              <span className="ml-1 text-[10px] align-middle">▾</span>
            </button>

            {configOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 text-xs text-slate-600 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/optional-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50"
                >
                  Optional Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/custom-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50"
                >
                  Custom Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/data-import");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50"
                >
                  Data Import
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/reporting-methods");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50"
                >
                  Reporting Methods
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/termination-reasons");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50 rounded-b-xl"
                >
                  Termination Reasons
                </button>
              </div>
            )}
          </div>

          {/* Employee List */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/employees")}
          >
            Employee List
          </button>

          {/* Add Employee (active) */}
          <button
            type="button"
            className={`${tabBase} bg-orange-500 text-white shadow-sm`}
          >
            Add Employee
          </button>

          {/* Reports */}
          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim/reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Add Employee
        </h2>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Photo */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div
                className="relative h-40 w-40 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 cursor-pointer"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 text-xs gap-1">
                    <div className="h-16 w-16 rounded-full bg-slate-200" />
                    <span>Upload Photo</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-md"
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center lg:text-left max-w-[220px]">
                Accepts .jpg, .png, .gif up to 1MB. Recommended dimensions:
                200px x 200px
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Right: main form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Employee full name */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Employee Full Name<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Employee Id */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Employee Id
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full md:w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Create Login Details + Status */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Create Login Details
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="relative">
                        <input
                          type="checkbox"
                          name="createLogin"
                          checked={form.createLogin}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
                      </span>
                    </label>
                  </div>

                  {/* Status radio */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-500">Status</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="loginStatus"
                        value="ENABLED"
                        checked={form.loginStatus === "ENABLED"}
                        onChange={handleChange}
                        className="text-green-500"
                      />
                      <span>Enabled</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="loginStatus"
                        value="DISABLED"
                        checked={form.loginStatus === "DISABLED"}
                        onChange={handleChange}
                        className="text-green-500"
                      />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>

                {/* Login fields */}
                {form.createLogin && (
                  <div className="space-y-4">
                    {/* Username + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Username<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Email<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    {/* Password + Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Password<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Confirm Password
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      For a strong password, use a hard-to-guess combination of
                      upper and lower case letters, numbers, and symbols.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-5 py-2 rounded-full border border-slate-300 text-xs md:text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-lime-500 text-xs md:text-sm text-white font-semibold shadow-sm hover:bg-lime-600 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            <span className="text-red-500">*</span> Required
          </p>
        </form>
      </div>
    </div>
  );
}
