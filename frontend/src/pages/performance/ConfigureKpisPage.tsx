// frontend/src/pages/performance/ConfigureKpisPage.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  useGetKpisQuery,
  useCreateKpiMutation,
  useUpdateKpiMutation,
  useDeleteKpiMutation,
  Kpi,
} from "../../features/performance/performanceApi";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

/** Main top bar for Performance module */
const PerformanceTopTabs = () => {
  const base = "/performance";

  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-white text-red-600 shadow-sm`
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

/** Small tabs inside Configure: KPIs / Trackers */
const ConfigureSubTabs = () => {
  const base = "/performance/configure";
  const pill =
    "px-4 py-1.5 text-xs font-medium rounded-full border border-transparent transition-colors";
  const getClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${pill} bg-red-500 text-white shadow-sm`
      : `${pill} text-slate-600 bg-white hover:bg-red-50`;

  return (
    <div className="flex gap-2">
      <NavLink to={`${base}/kpis`} className={getClass} end>
        KPIs
      </NavLink>
      <NavLink to={`${base}/trackers`} className={getClass}>
        Trackers
      </NavLink>
    </div>
  );
};

interface KpiFormState {
  jobTitle: string;
  kpiTitle: string;
  minRate: number;
  maxRate: number;
  isDefault: boolean;
}

const emptyForm: KpiFormState = {
  jobTitle: "",
  kpiTitle: "",
  minRate: 1,
  maxRate: 5,
  isDefault: false,
};

export default function ConfigureKpisPage() {
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const { data: kpis, isLoading } = useGetKpisQuery(
    jobTitleFilter ? { jobTitle: jobTitleFilter } : undefined
  );

  const [createKpi, { isLoading: isCreating }] = useCreateKpiMutation();
  const [updateKpi, { isLoading: isUpdating }] = useUpdateKpiMutation();
  const [deleteKpi, { isLoading: isDeleting }] = useDeleteKpiMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [form, setForm] = useState<KpiFormState>(emptyForm);

  const openCreate = () => {
    setEditingKpi(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (kpi: Kpi) => {
    setEditingKpi(kpi);
    setForm({
      jobTitle: kpi.jobTitle,
      kpiTitle: kpi.kpiTitle,
      minRate: kpi.minRate,
      maxRate: kpi.maxRate,
      isDefault: kpi.isDefault,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const target = e.target;
  const { name, value, type } = target;

  const isCheckbox =
    target instanceof HTMLInputElement && target.type === "checkbox";

  setForm((prev) => ({
    ...prev,
    [name]: isCheckbox
      ? target.checked
      : name === "minRate" || name === "maxRate"
      ? Number(value)
      : value,
  }));
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKpi) {
        await updateKpi({ id: editingKpi._id, ...form }).unwrap();
      } else {
        await createKpi(form).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("KPI save failed", err);
      // you can plug your toast system here
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this KPI?")) return;
    try {
      await deleteKpi(id).unwrap();
    } catch (err) {
      console.error("Delete KPI failed", err);
    }
  };

  const busy = isCreating || isUpdating || isDeleting;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Breadcrumb / Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-slate-800">
                Performance · Configure · KPIs
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Key performance indicators for each job title
              </p>
            </div>
            <PerformanceTopTabs />
          </div>

          {/* Card: Filter + Subtabs + Add button */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ConfigureSubTabs />

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold px-4 py-2 shadow-sm"
              >
                <FiPlus className="text-sm" />
                Add
              </button>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Job Title
                </span>
                <input
                  value={jobTitleFilter}
                  onChange={(e) => setJobTitleFilter(e.target.value)}
                  placeholder="-- Select --"
                  className="w-56 rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </section>

          {/* KPI table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100">
              <span className="text-[13px] font-medium text-slate-700">
                Key Performance Indicators
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-500 border-b bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-4 font-medium">Key Performance Indicator</th>
                    <th className="py-2 px-4 font-medium">Job Title</th>
                    <th className="py-2 px-4 font-medium text-center">Min Rate</th>
                    <th className="py-2 px-4 font-medium text-center">Max Rate</th>
                    <th className="py-2 px-4 font-medium text-center">Is Default</th>
                    <th className="py-2 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 px-4 text-center text-xs text-slate-500"
                      >
                        Loading KPIs...
                      </td>
                    </tr>
                  ) : !kpis || kpis.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 px-4 text-center text-xs text-slate-500"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    kpis.map((kpi) => (
                      <tr
                        key={kpi._id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-2">{kpi.kpiTitle}</td>
                        <td className="px-4 py-2">{kpi.jobTitle}</td>
                        <td className="px-4 py-2 text-center">{kpi.minRate}</td>
                        <td className="px-4 py-2 text-center">{kpi.maxRate}</td>
                        <td className="px-4 py-2 text-center">
                          {kpi.isDefault ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-medium">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(kpi)}
                              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                              title="Edit"
                            >
                              <FiEdit2 className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDelete(kpi._id)}
                              className="p-1.5 rounded-md border border-slate-200 text-rose-500 hover:bg-rose-50"
                              title="Delete"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">
              {editingKpi ? "Edit KPI" : "Add KPI"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 font-medium">
                  Job Title
                </label>
                <input
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Sales Executive"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600 font-medium">
                  Key Performance Indicator
                </label>
                <input
                  name="kpiTitle"
                  value={form.kpiTitle}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Achieves monthly sales target"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 font-medium">
                    Min Rate
                  </label>
                  <input
                    type="number"
                    name="minRate"
                    value={form.minRate}
                    min={0}
                    max={form.maxRate}
                    onChange={handleChange}
                    className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-600 font-medium">
                    Max Rate
                  </label>
                  <input
                    type="number"
                    name="maxRate"
                    value={form.maxRate}
                    min={form.minRate}
                    onChange={handleChange}
                    className="rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="rounded border-slate-300"
                />
                Mark as default KPI for this job title
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-60"
                >
                  {busy ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
