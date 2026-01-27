import { FormEvent, useState, ChangeEvent } from "react";
import {
  useGetSystemUsersQuery,
  useCreateSystemUserMutation,
  useUpdateSystemUserStatusMutation,
  useDeleteSystemUserMutation,
} from "../../../features/admin/adminApi";
import { ChevronUp, KeyRound, Pencil, Trash2 } from "lucide-react";

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
  const [addForm, setAddForm] = useState({
    role: "" as RoleOption, // required like screenshot
    employeeName: "", // required like screenshot
    status: "" as StatusOption, // required like screenshot
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

    // ✅ validations 
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
      // ✅ Convert "Employee Name" into firstName + lastName for backend requirement
      const full = addForm.employeeName.trim();
      const parts = full.split(/\s+/).filter(Boolean);

      const firstName = parts[0] || "Employee";
      const lastName = parts.slice(1).join(" ") || "User";

      await createUser({
        username: addForm.username.trim(),
        password: addForm.password.trim(),
        role: addForm.role as any,

        // ✅ REQUIred by your backend
        firstName,
        lastName,

        // keep these (optional)
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

  // shared input styles 
  const labelCls = "font-medium text-slate-700 text-[11px]";
  const inputCls =
    "border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400";
  const selectCls =
    "border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400";

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] text-slate-400">Admin</p>
        <h1 className="text-base md:text-lg font-semibold text-slate-900">
          Admin /{" "}
          <span className="text-red-500 font-semibold">User Management</span>
        </h1>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[11px] text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Filters card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">System Users</h2>
          <button
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50"
          >
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Username</label>
            <input
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1">
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

          <div className="flex flex-col gap-1">
            <label className={labelCls}>Employee Name</label>
            <input
              disabled
              placeholder="Type for hints…"
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
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

      {/* List card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            type="button"
            onClick={openAdd}
            disabled={isSaving}
            className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-[11px] font-semibold disabled:opacity-60 flex items-center justify-center shadow-sm"
          >
            + Add
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 text-[11px] text-slate-500">
          ({recordCount}) Record Found
        </div>

        <div className="px-6 pb-5">
          <div className="mt-1 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/70">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 w-10 text-left">
                    <input type="checkbox" className="accent-red-500" />
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
                        <input type="checkbox" className="accent-red-500" />
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
                          >
                            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50"
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

      {/* ✅ Add User Modal  */}
      {showAddModal && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={closeAdd} />
          {/* modal */}
          <div className="absolute inset-0 flex items-start justify-center p-4 md:p-10">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">
                  Add User
                </h2>
              </div>

              <form onSubmit={handleCreateUser} className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* User Role */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      User Role<span className="text-red-500">*</span>
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

                  {/* Employee Name */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      Employee Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="employeeName"
                      value={addForm.employeeName}
                      onChange={handleAddChange}
                      placeholder="Type for hints…"
                      className={inputCls}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      Status<span className="text-red-500">*</span>
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

                  {/* Username */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      Username<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="username"
                      value={addForm.username}
                      onChange={handleAddChange}
                      className={inputCls}
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      Password<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={addForm.password}
                      onChange={handleAddChange}
                      className={inputCls}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      For a strong password, use upper/lowercase, symbols and
                      numbers.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>
                      Confirm Password<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={addForm.confirmPassword}
                      onChange={handleAddChange}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    <span className="text-red-500">*</span> Required
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={closeAdd}
                      className="px-8 py-2 rounded-full border border-lime-500 text-lime-600 text-[11px] font-semibold bg-white hover:bg-lime-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-10 py-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-[11px] font-semibold disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
