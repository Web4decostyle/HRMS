// frontend/src/pages/performance/ConfigureTrackersPage.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  useGetTrackersQuery,
  useCreateTrackerMutation,
  useUpdateTrackerMutation,
  useDeleteTrackerMutation,
  Tracker,
} from "../../features/performance/performanceApi";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

// PERFORMANCE TOP TABS (same as KPI page)
const PerformanceTopTabs = () => {
  const base = "/performance";
  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-white text-green-600 shadow-sm`
      : `${pill} text-slate-600 hover:bg-white/60`;

  return (
    <div className="flex gap-2">
      <NavLink to={`${base}/configure/kpis`} className={getClass}>
        Configure
      </NavLink>
      <NavLink to={`${base}/manage/reviews`} className={getClass}>
        Manage Reviews
      </NavLink>
      <NavLink to={`${base}/my-trackers`} className={getClass}>
        My Trackers
      </NavLink>
      <NavLink to={`${base}/employee-trackers`} className={getClass}>
        Employee Trackers
      </NavLink>
    </div>
  );
};

// SUBTABS: KPIs / TRACKERS
const ConfigureSubTabs = () => {
  const base = "/performance/configure";
  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";

  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-green-500 text-white shadow-sm`
      : `${pill} bg-white text-slate-600 hover:bg-green-50`;

  return (
    <div className="flex gap-2">
      <NavLink to={`${base}/kpis`} className={getClass}>
        KPIs
      </NavLink>
      <NavLink to={`${base}/trackers`} className={getClass}>
        Trackers
      </NavLink>
    </div>
  );
};

interface TrackerFormState {
  name: string;
  employee: string;
  reviewers: string;
}

const emptyForm: TrackerFormState = {
  name: "",
  employee: "",
  reviewers: "",
};

export default function ConfigureTrackersPage() {
  const [filters, setFilters] = useState({
    name: "",
    employeeId: "",
    reviewerId: "",
  });

  const { data: trackers, isLoading } = useGetTrackersQuery(filters);
  const [createTracker] = useCreateTrackerMutation();
  const [updateTracker] = useUpdateTrackerMutation();
  const [deleteTracker] = useDeleteTrackerMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tracker | null>(null);
  const [form, setForm] = useState<TrackerFormState>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (t: Tracker) => {
    setEditing(t);
    setForm({
      name: t.name,
      employee: t.employee?._id || "",
      reviewers: (t.reviewers || []).map((r: any) => r._id).join(","),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const reviewersArray = form.reviewers
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const dataToSend = {
      name: form.name,
      employee: form.employee,
      reviewers: reviewersArray,
    };

    try {
      if (editing) {
        await updateTracker({ id: editing._id, ...dataToSend }).unwrap();
      } else {
        await createTracker(dataToSend).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving tracker");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tracker?")) return;
    try {
      await deleteTracker(id).unwrap();
    } catch (err) {
      console.error(err);
      alert("Error deleting tracker");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* TITLE */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-slate-800">
                Performance · Configure · Trackers
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Tracker assignment & reviewer mapping
              </p>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* FILTERS + BUTTON */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <ConfigureSubTabs />

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold px-4 py-2 shadow-sm"
              >
                <FiPlus className="text-sm" />
                Add
              </button>
            </div>

            {/* FILTER ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 font-medium">
                  Tracker Name
                </label>
                <input
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                  className="border border-slate-200 rounded-md px-2 py-1"
                  placeholder="Search by name..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 font-medium">
                  Employee ID
                </label>
                <input
                  value={filters.employeeId}
                  onChange={(e) =>
                    setFilters({ ...filters, employeeId: e.target.value })
                  }
                  className="border border-slate-200 rounded-md px-2 py-1"
                  placeholder="employee _id"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 font-medium">
                  Reviewer ID
                </label>
                <input
                  value={filters.reviewerId}
                  onChange={(e) =>
                    setFilters({ ...filters, reviewerId: e.target.value })
                  }
                  className="border border-slate-200 rounded-md px-2 py-1"
                  placeholder="reviewer _id"
                />
              </div>
            </div>
          </section>

          {/* TABLE */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100">
              <span className="text-[13px] font-medium text-slate-700">
                Trackers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-500 border-b bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-4 font-medium">Tracker Name</th>
                    <th className="py-2 px-4 font-medium">Employee</th>
                    <th className="py-2 px-4 font-medium">Reviewers</th>
                    <th className="py-2 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : trackers && trackers.length > 0 ? (
                    trackers.map((t) => (
                      <tr
                        key={t._id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-2">{t.name}</td>
                        <td className="px-4 py-2">
                          {t.employee
                            ? `${t.employee.firstName} ${t.employee.lastName}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {(t.reviewers || [])
                            .map(
                              (r: any) =>
                                `${r.firstName} ${r.lastName} (${r.employeeId})`
                            )
                            .join(", ")}
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                              title="Edit"
                            >
                              <FiEdit2 className="text-xs" />
                            </button>

                            <button
                              onClick={() => handleDelete(t._id)}
                              className="p-1.5 rounded-md border border-slate-200 text-rose-500 hover:bg-rose-50"
                              title="Delete"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center">
                        No trackers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-md">
            <h2 className="text-sm font-semibold text-slate-800">
              {editing ? "Edit Tracker" : "Add Tracker"}
            </h2>

            <form onSubmit={submitForm} className="space-y-3 mt-3 text-xs">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">Tracker Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border border-slate-200 rounded-md px-2 py-1"
                />
              </div>

              {/* Employee */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">Employee ID</label>
                <input
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                  required
                  className="border border-slate-200 rounded-md px-2 py-1"
                  placeholder="employee _id"
                />
              </div>

              {/* Reviewers */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">
                  Reviewers (comma separated IDs)
                </label>
                <input
                  name="reviewers"
                  value={form.reviewers}
                  onChange={handleChange}
                  className="border border-slate-200 rounded-md px-2 py-1"
                  placeholder="id1,id2,id3"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
