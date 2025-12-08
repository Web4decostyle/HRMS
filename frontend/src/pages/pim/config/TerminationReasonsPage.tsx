// frontend/src/pages/pim/config/TerminationReasonsPage.tsx
import React, { useEffect, useState } from "react";
import {
  useGetTerminationReasonsQuery,
  useCreateTerminationReasonMutation,
  useUpdateTerminationReasonMutation,
  useDeleteTerminationReasonMutation,
  TerminationReason,
} from "../../../features/pim/pimConfigApi";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const tabBase =
  "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

const TerminationReasonsPage: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="flex min-h-screen bg-[#f4f5fb]">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        {/* green top bar with user menu */}
        <Topbar active="pim-config-termination-reasons" />

        {/* PIM / Configuration heading + tabs  */}
        <main className="flex-1 px-8 py-6 space-y-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-slate-800">
              PIM / Configuration
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {/* Configuration (active) */}
              <button
                type="button"
                className={`${tabBase} bg-green-500 text-white shadow-sm`}
              >
                Configuration
              </button>

              {/* Employee List */}
              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/pim")}
              >
                Employee List
              </button>

              {/* Add Employee */}
              <button
                type="button"
                className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
                onClick={() => navigate("/employees/add")}
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

          {/* Termination Reasons card – cloned layout */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header row with title + Add button */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-sm md:text-base font-semibold text-slate-800">
                Termination Reasons
              </h2>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs md:text-sm font-semibold bg-[#6fb64a] text-white hover:bg-[#63a441] shadow-sm"
              >
                <span className="text-base leading-none">+</span>
                <span>Add</span>
              </button>
            </div>

            {/* Record count */}
            <div className="px-8 pb-2 text-[11px] text-slate-500">
              ({total}) Records Found
            </div>

            {/* Header “Name / Actions” row */}
            <div className="px-8 pb-4">
              <div className="flex items-center rounded-full bg-[#f3f5fa] h-10 px-5 text-[11px] font-semibold text-slate-500">
                <div className="w-10 flex justify-center">
                  <input type="checkbox" className="accent-green-500" />
                </div>
                <div className="flex-1">Name</div>
                <div className="w-28 text-right pr-2">Actions</div>
              </div>
            </div>

            {/* List body */}
            <div className="px-8 pb-6 space-y-3">
              {isLoading && (
                <div className="text-xs text-slate-500 px-2 py-4">
                  Loading…
                </div>
              )}

              {isError && !isLoading && (
                <div className="text-xs text-red-500 px-2 py-4">
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
                <div className="text-xs text-slate-500 px-2 py-4">
                  No termination reasons configured yet.
                </div>
              )}

              {!isLoading &&
                !isError &&
                items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center rounded-full bg-white border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-10 px-5 hover:bg-green-50/40 transition-colors"
                  >
                    <div className="w-10 flex justify-center">
                      <input
                        type="checkbox"
                        className="accent-green-500"
                      />
                    </div>

                    <div className="flex-1 text-xs md:text-sm text-slate-700">
                      {item.name}
                    </div>

                    <div className="w-28 flex items-center justify-end gap-2 pr-1">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f7fb] hover:bg-red-50"
                        title="Delete"
                      >
                        <FiTrash2 className="text-slate-500" size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f7fb] hover:bg-indigo-50"
                        title="Edit"
                      >
                        <FiEdit2 className="text-slate-500" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
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
                className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-60"
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
    </div>
  );
};

export default TerminationReasonsPage;
