import { FormEvent, useState } from "react";
import {
  useGetSystemUsersQuery,
  useCreateSystemUserMutation,
  useUpdateSystemUserStatusMutation,
  useDeleteSystemUserMutation,
} from "../../../features/admin/adminApi";

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

  const { data: users, isLoading } = useGetSystemUsersQuery(
    {
      username: filters.username || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    },
  );

  const [createUser, { isLoading: isSaving }] = useCreateSystemUserMutation();
  const [updateStatus] = useUpdateSystemUserStatusMutation();
  const [deleteUser] = useDeleteSystemUserMutation();

  // Add form
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ESS" as RoleOption,
    employeeName: "",
  });

  function handleFilterChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value as any }));
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleResetFilters() {
    setFilters({ username: "", role: "", status: "" });
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    // nothing special – filters state already used in query
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
  }

  async function toggleStatus(id: string, current: "ENABLED" | "DISABLED") {
    const next = current === "ENABLED" ? "DISABLED" : "ENABLED";
    await updateStatus({ id, status: next }).unwrap();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(id).unwrap();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Admin / User Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">System Users</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 font-semibold text-sm text-slate-800">
          System Users
        </div>

        <form
          onSubmit={handleSearch}
          className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Username</label>
            <input
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">User Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white"
            >
              <option value="">-- Select --</option>
              <option value="ADMIN">Admin</option>
              <option value="HR">HR</option>
              <option value="ESS">ESS</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Employee Name</label>
            <input
              disabled
              placeholder="(not linked yet)"
              className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white"
            >
              <option value="">-- Select --</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-1.5 rounded-full border border-lime-500 text-lime-600 text-xs font-semibold bg-white hover:bg-lime-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Add User + Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">System Users</h2>
          <button
            form="add-user-form"
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            + Add
          </button>
        </div>

        {/* Add form is small inline row under header, OrangeHRM style-ish */}
        <form
          id="add-user-form"
          onSubmit={handleCreateUser}
          className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Username *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleFormChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              className="border border-slate-200 rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">User Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="border border-slate-200 rounded-md px-2 py-1 bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="HR">HR</option>
              <option value="ESS">ESS</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Employee Name (text)
            </label>
            <input
              name="employeeName"
              value={form.employeeName}
              onChange={handleFormChange}
              className="border border-slate-200 rounded-md px-2 py-1"
              placeholder="Optional display name"
            />
          </div>
        </form>

        <div className="px-6 pb-4">
          <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 w-10 text-left">
                    <input type="checkbox" className="accent-orange-500" />
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Username
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    User Role
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Employee Name
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-xs">
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
                    <tr
                      key={u._id}
                      className="odd:bg-white even:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-orange-500" />
                      </td>
                      <td className="px-4 py-2 text-slate-800">
                        {u.username}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{u.role}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {u.employeeName || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(u._id, u.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                            u.status === "ENABLED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.status === "ENABLED" ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(u._id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
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
