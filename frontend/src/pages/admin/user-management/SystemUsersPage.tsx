import { FormEvent, useState, ChangeEvent } from "react";
import {
  useGetSystemUsersQuery,
  useCreateSystemUserMutation,
  useUpdateSystemUserStatusMutation,
  useDeleteSystemUserMutation,
} from "../../../features/admin/adminApi";
import { ChevronUp, KeyRound, Pencil, Trash2 } from "lucide-react";

type RoleOption = "ADMIN" | "HR" | "ESS" | "";
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

  // "Add User" inline form (hidden by default)
  const [showAddRow, setShowAddRow] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ESS" as RoleOption,
    employeeName: "",
  });

  function handleFilterChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value as any }));
  }

  function handleFormChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleResetFilters() {
    setFilters({ username: "", role: "", status: "" });
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    // filters already bound to query
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;

    await createUser({
      username: form.username.trim(),
      password: form.password.trim(),
      role: (form.role || "ESS") as any,
      employeeName: form.employeeName.trim() || undefined,
    }).unwrap();

    setForm({
      username: "",
      password: "",
      role: "ESS",
      employeeName: "",
    });
    setShowAddRow(false);
  }

  async function toggleStatus(id: string, current: "ENABLED" | "DISABLED") {
    const next = current === "ENABLED" ? "DISABLED" : "ENABLED";
    await updateStatus({ id, status: next }).unwrap();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(id).unwrap();
  }

  const recordCount = users?.length ?? 0;

  return (
    <div className="space-y-6 text-xs">
      {/* Breadcrumb / Page title */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] text-slate-400">Admin</p>
        <h1 className="text-base md:text-lg font-semibold text-slate-900">
          Admin /{" "}
          <span className="text-green-500 font-semibold">User Management</span>
        </h1>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            System Users
          </h2>
          <button
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50"
          >
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 text-[11px]">
              Username
            </label>
            <input
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 text-[11px]">
              User Role
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            >
              <option value="">-- Select --</option>
              <option value="ADMIN">Admin</option>
              <option value="HR">HR</option>
              <option value="ESS">ESS</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 text-[11px]">
              Employee Name
            </label>
            <input
              disabled
              placeholder="Type for hints…"
              className="border border-slate-200 rounded-md px-3 py-2 text-xs bg-slate-50 text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700 text-[11px]">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            >
              <option value="">-- Select --</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          {/* Buttons row */}
          <div className="md:col-span-4 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-1.5 rounded-full border border-lime-500 text-lime-600 text-[11px] font-semibold bg-white hover:bg-lime-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-[11px] font-semibold"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ADD + TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Top bar with +Add */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setShowAddRow((v) => !v)}
            disabled={isSaving}
            className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-[11px] font-semibold disabled:opacity-60 flex items-center justify-center shadow-sm"
          >
            + Add
          </button>
        </div>

        {/* Inline Add Row (hidden by default –  opens a separate page, this keeps your existing backend) */}
        {showAddRow && (
          <form
            onSubmit={handleCreateUser}
            className="px-6 pt-4 pb-3 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50/50"
          >
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-[11px]">
                Username *
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleFormChange}
                className="border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-[11px]">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                className="border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-[11px]">
                User Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="border border-slate-200 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              >
                <option value="ADMIN">Admin</option>
                <option value="HR">HR</option>
                <option value="ESS">ESS</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700 text-[11px]">
                Employee Name (text)
              </label>
              <input
                name="employeeName"
                value={form.employeeName}
                onChange={handleFormChange}
                placeholder="Optional display name"
                className="border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddRow(false)}
                className="px-4 py-1.5 rounded-full border border-slate-200 text-[11px] text-slate-600 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-[11px] font-semibold disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Record count */}
        <div className="px-6 pt-4 pb-2 text-[11px] text-slate-500">
          ({recordCount}) Record Found
        </div>

        {/* Table */}
        <div className="px-6 pb-5">
          <div className="mt-1 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/70">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 w-10 text-left">
                    <input type="checkbox" className="accent-green-500" />
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Username</th>
                  <th className="px-4 py-2 text-left font-semibold">User Role</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Employee Name
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : !users || users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-slate-400"
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="bg-white">
                      <td className="px-4 py-3 border-t border-slate-100">
                        <input type="checkbox" className="accent-green-500" />
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100 text-slate-800">
                        {u.username}
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100 text-slate-500">
                        {u.role}
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100 text-slate-500">
                        {u.employeeName || "-"}
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleStatus(u._id, u.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                            u.status === "ENABLED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {u.status === "ENABLED" ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50"
                            // TODO: implement reset password / view details
                          >
                            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50"
                            // TODO: implement edit flow
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u._id)}
                            className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
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
  );
}
