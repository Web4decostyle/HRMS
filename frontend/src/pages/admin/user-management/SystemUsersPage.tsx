import { FormEvent, useState, ChangeEvent } from "react";
import {
  useGetSystemUsersQuery,
  useCreateSystemUserMutation,
  useUpdateSystemUserStatusMutation,
  useDeleteSystemUserMutation,
} from "../../../features/admin/adminApi";
import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Plus,
  Shield,
  UserCog,
} from "lucide-react";

type RoleOption = "ADMIN" | "HR" | "ESS" | "ESS_VIEWER" | "SUPERVISOR" | "";
type StatusOption = "ENABLED" | "DISABLED" | "";

export default function SystemUsersPage() {
  const [filters, setFilters] = useState<{
    username: string;
    role: RoleOption;
    status: StatusOption;
  }>({
    username: "",
    role: "",
    status: "",
  });

  const { data: users, isLoading } = useGetSystemUsersQuery({
    username: filters.username || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  const [createUser, { isLoading: isSaving }] = useCreateSystemUserMutation();
  const [updateStatus] = useUpdateSystemUserStatusMutation();
  const [deleteUser] = useDeleteSystemUserMutation();

  const [errorMsg, setErrorMsg] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const [addForm, setAddForm] = useState({
    role: "" as RoleOption,
    employeeName: "",
    status: "" as StatusOption,
    username: "",
    password: "",
    confirmPassword: "",
  });

  function handleFilterChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value as any }));
  }

  function handleResetFilters() {
    setFilters({ username: "", role: "", status: "" });
  }

  function handleAddChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setAddForm((p) => ({ ...p, [name]: value }));
  }

  function openAdd() {
    setErrorMsg("");
    setAddForm({
      role: "",
      employeeName: "",
      status: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    setShowAddModal(true);
  }

  function closeAdd() {
    setShowAddModal(false);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!addForm.role) return setErrorMsg("User Role is required.");
    if (!addForm.employeeName.trim())
      return setErrorMsg("Employee Name is required.");
    if (!addForm.status) return setErrorMsg("Status is required.");
    if (!addForm.username.trim()) return setErrorMsg("Username is required.");
    if (!addForm.password.trim()) return setErrorMsg("Password is required.");
    if (!addForm.confirmPassword.trim())
      return setErrorMsg("Confirm Password is required.");
    if (addForm.password !== addForm.confirmPassword)
      return setErrorMsg("Password and Confirm Password do not match.");

    try {
      const full = addForm.employeeName.trim();
      const parts = full.split(/\s+/).filter(Boolean);

      const firstName = parts[0] || "Employee";
      const lastName = parts.slice(1).join(" ") || "User";

      await createUser({
        username: addForm.username.trim(),
        password: addForm.password.trim(),
        role: addForm.role as any,
        firstName,
        lastName,
        employeeName: addForm.employeeName.trim(),
        status: addForm.status as any,
      } as any).unwrap();

      closeAdd();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to create user.");
    }
  }

  async function toggleStatus(id: string, current: "ENABLED" | "DISABLED") {
    setErrorMsg("");
    const next = current === "ENABLED" ? "DISABLED" : "ENABLED";
    try {
      await updateStatus({ id, status: next }).unwrap();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to update status.");
    }
  }

  async function handleDelete(id: string) {
    setErrorMsg("");
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id).unwrap();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to delete user.");
    }
  }

  const recordCount = users?.length ?? 0;

  const labelCls =
    "mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-600";
  const inputCls =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-100";
  const selectCls =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-100";

  function getRoleBadge(role: string) {
    const map: Record<string, string> = {
      ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
      HR: "bg-sky-50 text-sky-700 border-sky-200",
      ESS: "bg-slate-50 text-slate-700 border-slate-200",
      ESS_VIEWER: "bg-amber-50 text-amber-700 border-amber-200",
      SUPERVISOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    return map[role] || "bg-slate-50 text-slate-700 border-slate-200";
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Admin Panel</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                System Users
              </h1>
              <p className="text-sm text-slate-500">
                Manage user access, role assignments and account status.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAdd}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-600 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Search & Filters
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Narrow down system users by username, role or account status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFiltersExpanded((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
          >
            {filtersExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {filtersExpanded && (
          <form
            onSubmit={handleSearch}
            className="px-5 py-5 sm:px-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className={labelCls}>Username</label>
                <input
                  name="username"
                  value={filters.username}
                  onChange={handleFilterChange}
                  placeholder="Search username"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>User Role</label>
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className={selectCls}
                >
                  <option value="">-- Select --</option>
                  <option value="ADMIN">Admin</option>
                  <option value="HR">HR</option>
                  <option value="ESS">ESS</option>
                  <option value="ESS_VIEWER">ESS (View Only)</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Employee Name</label>
                <input
                  disabled
                  placeholder="Type for hints…"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-400"
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={selectCls}
                >
                  <option value="">-- Select --</option>
                  <option value="ENABLED">Enabled</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-600"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User list */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              User Directory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {recordCount} {recordCount === 1 ? "record" : "records"} found
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            <Shield className="h-4 w-4 text-lime-600" />
            Access Control Overview
          </div>
        </div>

        {/* Mobile cards */}
        <div className="block p-4 lg:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
              Loading...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
              No Records Found
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {u.username}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {u.employeeName || "-"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStatus(u._id, u.status)}
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                        u.status === "ENABLED"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {u.status === "ENABLED" ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
                      >
                        <KeyRound className="h-4 w-4 text-slate-500" />
                      </button>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(u._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 transition hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block px-6 py-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input type="checkbox" className="accent-lime-500" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      User Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-slate-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : !users || users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-slate-400"
                      >
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u._id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-4">
                          <input type="checkbox" className="accent-lime-500" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {u.username}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {u.employeeName || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleStatus(u._id, u.status)}
                            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
                              u.status === "ENABLED"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {u.status === "ENABLED" ? "Enabled" : "Disabled"}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4 text-slate-500" />
                            </button>

                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-50"
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4 text-slate-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(u._id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 transition hover:bg-rose-100"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeAdd}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Add New User
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a new system user and assign access permissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(90vh-88px)] overflow-y-auto">
                <form onSubmit={handleCreateUser} className="px-6 py-6 sm:px-8">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>
                        User Role<span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={addForm.role}
                        onChange={handleAddChange}
                        className={selectCls}
                      >
                        <option value="">-- Select --</option>
                        <option value="ADMIN">Admin</option>
                        <option value="HR">HR</option>
                        <option value="ESS">ESS</option>
                        <option value="ESS_VIEWER">ESS (View Only)</option>
                        <option value="SUPERVISOR">Supervisor</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Employee Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="employeeName"
                        value={addForm.employeeName}
                        onChange={handleAddChange}
                        placeholder="Enter employee full name"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Status<span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={addForm.status}
                        onChange={handleAddChange}
                        className={selectCls}
                      >
                        <option value="">-- Select --</option>
                        <option value="ENABLED">Enabled</option>
                        <option value="DISABLED">Disabled</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Username<span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="username"
                        value={addForm.username}
                        onChange={handleAddChange}
                        placeholder="Enter username"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>
                        Password<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={addForm.password}
                        onChange={handleAddChange}
                        placeholder="Enter password"
                        className={inputCls}
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Use uppercase, lowercase, symbols and numbers for a stronger password.
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Confirm Password<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={addForm.confirmPassword}
                        onChange={handleAddChange}
                        placeholder="Re-enter password"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      <span className="text-rose-500">*</span> Required fields
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={closeAdd}
                        className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-full bg-lime-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-600 disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save User"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}