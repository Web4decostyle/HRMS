// frontend/src/pages/pim/config/TerminationReasonsPage.tsx
import React, { useEffect, useState } from "react";
import {
  useGetTerminationReasonsQuery,
  useCreateTerminationReasonMutation,
  useUpdateTerminationReasonMutation,
  useDeleteTerminationReasonMutation,
  TerminationReason,
} from "../../../features/pim/pimConfigApi";

import { NavLink } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

/** Small local tabs bar for PIM (top bar like OrangeHRM) */
const PimConfigTopTabs: React.FC = () => {
  const base = "/admin/pim";

  const linkClasses =
    "px-4 py-2 text-xs font-medium rounded-full transition-colors";
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${linkClasses} bg-white text-orange-600 shadow-sm`
      : `${linkClasses} text-white/80 hover:bg-white/10`;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 pt-4 pb-3">
      <div className="flex items-center gap-2">
        <NavLink to={`${base}/config/optional-fields`} className={getClassName}>
          Configuration
        </NavLink>
        <NavLink to={`${base}/employee-list`} className={getClassName}>
          Employee List
        </NavLink>
        <NavLink to={`${base}/add-employee`} className={getClassName}>
          Add Employee
        </NavLink>
        <NavLink to={`${base}/reports`} className={getClassName}>
          Reports
        </NavLink>
      </div>
    </div>
  );
};

const TerminationReasonsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetTerminationReasonsQuery();

  const [createReason, { isLoading: isCreating }] =
    useCreateTerminationReasonMutation();
  const [updateReason, { isLoading: isUpdating }] =
    useUpdateTerminationReasonMutation();
  const [deleteReason] = useDeleteTerminationReasonMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TerminationReason | null>(null);
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];

  useEffect(() => {
    if (!modalOpen) {
      setEditing(null);
      setName("");
      setErrorMsg(null);
    }
  }, [modalOpen]);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setModalOpen(true);
  };

  const openEdit = (item: TerminationReason) => {
    setEditing(item);
    setName(item.name);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Name is required");
      return;
    }

    try {
      if (editing) {
        await updateReason({ id: editing._id, name: trimmed }).unwrap();
      } else {
        await createReason({ name: trimmed }).unwrap();
      }
      setModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        (editing
          ? "Failed to update termination reason"
          : "Failed to create termination reason");
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this termination reason?")) return;
    try {
      await deleteReason(id).unwrap();
    } catch (err) {
      console.error(err);
      alert("Failed to delete termination reason");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen bg-slate-50">
        <Topbar active="pim-config-termination-reasons" />

        <main className="flex-1 flex flex-col">
          {/* Orange header with PIM tabs */}
          <PimConfigTopTabs />

          {/* Page content */}
          <div className="px-6 py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              {/* Header row */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Termination Reasons
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ({total}) Records Found
                  </p>
                </div>
                <button
                  onClick={openAdd}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition"
                >
                  + Add
                </button>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[60px_1fr_120px] px-6 py-3 text-xs font-semibold text-slate-500 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded-full border-slate-300"
                  />
                </div>
                <div>Name</div>
                <div className="text-right pr-4">Actions</div>
              </div>

              {/* Rows */}
              {isLoading && (
                <div className="p-6 text-sm text-slate-500">Loading…</div>
              )}

              {isError && !isLoading && (
                <div className="p-6 text-sm text-red-500">
                  Failed to load termination reasons.
                  <button
                    onClick={() => refetch()}
                    className="ml-2 text-indigo-600 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <div className="p-6 text-sm text-slate-500">
                  No termination reasons configured yet.
                </div>
              )}

              {!isLoading &&
                !isError &&
                items.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-[60px_1fr_120px] px-6 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded-full border-slate-300"
                      />
                    </div>
                    <div className="text-sm text-slate-700">{item.name}</div>
                    <div className="flex items-center justify-end gap-3 pr-3">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-red-50 hover:border-red-200"
                        title="Delete"
                      >
                        <FiTrash2 className="text-slate-500" size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                        title="Edit"
                      >
                        <FiEdit2 className="text-slate-500" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {editing ? "Edit Termination Reason" : "Add Termination Reason"}
            </h3>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Resigned - Self Proposed"
            />
            {errorMsg && (
              <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-full text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                disabled={isCreating || isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-full text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
                disabled={isCreating || isUpdating}
              >
                {editing
                  ? isUpdating
                    ? "Saving..."
                    : "Save"
                  : isCreating
                  ? "Adding..."
                  : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TerminationReasonsPage;
