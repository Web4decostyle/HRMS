// frontend/src/pages/admin/job/JobTitlesPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import {
  useGetJobTitlesQuery,
  useDeleteJobTitleMutation,
} from "../../../features/admin/adminApi";

type JobTitleRow = {
  _id: string;
  name: string;
  code?: string;
  description?: string;
};

const pageWrap = "space-y-4";
const card =
  "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden";
const topBar =
  "flex items-center justify-between px-6 py-4 border-b border-slate-100";
const title = "text-sm font-semibold text-slate-800";
const subLine = "text-xs text-slate-500";
const pillBtn =
  "inline-flex items-center gap-2 px-4 h-9 rounded-full text-xs font-semibold border transition";
const greenBtn =
  "bg-lime-500 hover:bg-lime-600 text-white border-lime-500 disabled:opacity-60 disabled:cursor-not-allowed";
const softBtn =
  "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed";
const dangerBtn =
  "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 disabled:opacity-60 disabled:cursor-not-allowed";

const tableWrap = "px-6 pb-6";
const tableBox = "mt-3 border border-slate-100 rounded-xl overflow-hidden";
const th =
  "text-left px-4 py-3 text-[11px] font-semibold text-slate-500 bg-slate-50";
const td = "px-4 py-3 text-xs";
const rowCls =
  "bg-white hover:bg-slate-50/60 transition border-t border-slate-100";
const checkboxCls = "h-4 w-4 accent-lime-500";

const actionPill =
  "inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition";

export default function JobTitlesPage() {
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useGetJobTitlesQuery();
  const titles: JobTitleRow[] = (data as any) ?? [];

  const [deleteJobTitle, { isLoading: isDeleting }] =
    useDeleteJobTitleMutation();

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allIds = useMemo(() => titles.map((t) => t._id), [titles]);

  const selectedIds = useMemo(
    () => allIds.filter((id) => selected[id]),
    [allIds, selected]
  );

  const isAllSelected = useMemo(() => {
    if (!allIds.length) return false;
    return allIds.every((id) => selected[id]);
  }, [allIds, selected]);

  const recordCountText = useMemo(() => {
    const n = titles?.length ?? 0;
    return `(${n}) Record${n === 1 ? "" : "s"} Found`;
  }, [titles]);

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const id of allIds) next[id] = true;
    setSelected(next);
  }

  function deselectAll() {
    setSelected({});
  }

  function toggleAllCheckbox() {
    if (isAllSelected) deselectAll();
    else selectAll();
  }

  async function handleDelete(id: string) {
    const row = titles.find((t) => t._id === id);
    const ok = window.confirm(
      `Delete job title "${row?.name ?? "this item"}"?`
    );
    if (!ok) return;

    try {
      await deleteJobTitle(id).unwrap();
      setSelected((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch {
      // optionally toast
    }
  }

  async function handleDeleteSelected() {
    if (!selectedIds.length) return;

    const label =
      selectedIds.length === titles.length
        ? "ALL job titles"
        : `${selectedIds.length} selected job title(s)`;

    const ok = window.confirm(`Delete ${label}? This cannot be undone.`);
    if (!ok) return;

    // delete sequentially to keep it simple + safe
    try {
      for (const id of selectedIds) {
        // eslint-disable-next-line no-await-in-loop
        await deleteJobTitle(id).unwrap();
      }
      deselectAll();
    } catch {
      // optionally toast
    }
  }

  function handleEdit(id: string) {
    navigate(`/admin/job/job-titles/${id}/edit`);
  }

  const busy = isLoading || isFetching;
  const hasSelection = selectedIds.length > 0;

  return (
    <div className={pageWrap}>
      {/* Header like screenshot */}
      <div className="px-1">
        <div className="text-lg font-semibold text-slate-900">Admin / Job</div>
      </div>

      <div className={card}>
        {/* Card header */}
        <div className={topBar}>
          <div>
            <div className={title}>Job Titles</div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/job/job-titles/add")}
            className={`${pillBtn} ${greenBtn}`}
          >
            + Add
          </button>
        </div>

        {/* Record count + selection controls */}
        <div className="px-6 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className={subLine}>{recordCountText}</div>

          <div className="flex items-center gap-2">
            {hasSelection && (
              <>
                <div className="text-[11px] text-slate-500 pr-2">
                  {selectedIds.length} selected
                </div>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className={`${pillBtn} ${dangerBtn}`}
                  title="Delete all selected"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={tableWrap}>
          <div className={tableBox}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={`${th} w-12`}>
                    <input
                      type="checkbox"
                      className={checkboxCls}
                      checked={isAllSelected}
                      onChange={toggleAllCheckbox}
                      aria-label="Select all"
                    />
                  </th>

                  <th className={th}>
                    <div className="flex items-center gap-2">
                      <span>Job Titles</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        ⬍
                      </span>
                    </div>
                  </th>

                  <th className={th}>Job Description</th>

                  <th className={`${th} w-32 text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {busy ? (
                  <tr className={rowCls}>
                    <td
                      colSpan={4}
                      className={`${td} text-center py-8 text-slate-500`}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : !titles || titles.length === 0 ? (
                  <tr className={rowCls}>
                    <td
                      colSpan={4}
                      className={`${td} text-center py-10 text-slate-400`}
                    >
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  titles.map((t) => (
                    <tr key={t._id} className={rowCls}>
                      <td className={td}>
                        <input
                          type="checkbox"
                          className={checkboxCls}
                          checked={!!selected[t._id]}
                          onChange={() => toggleOne(t._id)}
                          aria-label={`Select ${t.name}`}
                        />
                      </td>

                      <td className={`${td} text-slate-800 font-medium`}>
                        {t.name}
                        {t.code ? (
                          <span className="ml-2 text-[11px] font-semibold text-slate-400">
                            ({t.code})
                          </span>
                        ) : null}
                      </td>

                      <td className={`${td} text-slate-500`}>
                        {t.description?.trim() ? t.description : "—"}
                      </td>

                      <td className={`${td} text-right`}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className={actionPill}
                            onClick={() => handleDelete(t._id)}
                            disabled={isDeleting}
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-slate-500" />
                          </button>

                          <button
                            type="button"
                            className={actionPill}
                            onClick={() => handleEdit(t._id)}
                            title="Edit"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[11px] text-slate-400">
            Tip: Select the header checkbox to select all rows, then use “Delete
            Selected”.
          </div>
        </div>
      </div>
    </div>
  );
}
