// frontend/src/pages/my-info/TaxExemptionsTab.tsx
import { useEffect, useState } from "react";
import {
  useGetTaxQuery,
  useUpdateTaxMutation,
} from "../../features/myInfo/myInfoApi";

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";
const headCell =
  "px-3 py-2 text-left font-semibold text-[11px] text-slate-500";

export default function TaxExemptionsTab({
  employeeId,
}: {
  employeeId: string;
}) {
  const { data: taxData, isLoading } = useGetTaxQuery(employeeId);
  const [updateTax, { isLoading: saving }] = useUpdateTaxMutation();

  const [form, setForm] = useState({
    federalStatus: "",
    federalExemptions: "",
    state: "",
    stateStatus: "",
    stateExemptions: "",
    unemploymentState: "",
    workState: "",
  });

  // hydrate from API
  useEffect(() => {
    if (!taxData) return;
    setForm({
      federalStatus: taxData.federalStatus || "",
      federalExemptions:
        taxData.federalExemptions !== undefined
          ? String(taxData.federalExemptions)
          : "",
      state: taxData.state || "",
      stateStatus: taxData.stateStatus || "",
      stateExemptions:
        taxData.stateExemptions !== undefined
          ? String(taxData.stateExemptions)
          : "",
      unemploymentState: taxData.unemploymentState || "",
      workState: taxData.workState || "",
    });
  }, [taxData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await updateTax({
      employeeId,
      data: {
        federalStatus: form.federalStatus || null,
        federalExemptions: form.federalExemptions
          ? Number(form.federalExemptions)
          : null,
        state: form.state || null,
        stateStatus: form.stateStatus || null,
        stateExemptions: form.stateExemptions
          ? Number(form.stateExemptions)
          : null,
        unemploymentState: form.unemploymentState || null,
        workState: form.workState || null,
      },
    }).unwrap();
  }

  return (
    <>
      {/* HEADER BAR – “Tax Exemptions” */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Tax Exemptions
        </h2>
      </div>

      {/* FORM BLOCK */}
      <form
        onSubmit={handleSubmit}
        className="px-7 pt-5 pb-6 text-[12px] space-y-6"
      >
        {/* FEDERAL INCOME TAX SECTION */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            Federal Income Tax
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Status</label>
              <select
                name="federalStatus"
                value={form.federalStatus}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="head_of_household">Head of Household</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Exemptions</label>
              <input
                name="federalExemptions"
                value={form.federalExemptions}
                onChange={handleChange}
                type="number"
                className={inputCls}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* SEPARATOR LINE */}
        <div className="border-t border-[#f5f6fb]" />

        {/* STATE INCOME TAX SECTION */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            State Income Tax
          </h3>

          {/* Row 1: State / Status / Exemptions */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>State</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                {/* add more as needed */}
              </select>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                name="stateStatus"
                value={form.stateStatus}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Exemptions</label>
              <input
                name="stateExemptions"
                value={form.stateExemptions}
                onChange={handleChange}
                type="number"
                className={inputCls}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 2: Unemployment State / Work State */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <label className={labelCls}>Unemployment State</label>
              <select
                name="unemploymentState"
                value={form.unemploymentState}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Work State</label>
              <select
                name="workState"
                value={form.workState}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
              </select>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON – BOTTOM RIGHT, LIKE OTHER FORMS */}
        <div className="flex justify-end pt-4 border-t border-[#edf0f7]">
          <button
            type="submit"
            disabled={saving || isLoading}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {/* ==================== ATTACHMENTS SECTION ==================== */}
      <div className="px-7 py-4 border-t border-[#f5f6fb]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Attachments
        </h2>
      </div>

      <div className="px-7 pb-6">
        {/* OrangeHRM-style “No Records Found” text */}
        <p className="text-[11px] text-slate-400 mb-3">No Records Found</p>

        {/* Header-only attachments table */}
        <div className="border-y border-[#e3e5f0] rounded-none">
          <table className="w-full text-[11px] text-slate-700">
            <thead className="bg-[#f5f6fb]">
              <tr>
                <th className={headCell}>File Name</th>
                <th className={headCell}>Description</th>
                <th className={headCell}>Size</th>
                <th className={headCell}>Type</th>
                <th className={headCell}>Date Added</th>
                <th className={headCell}>Added By</th>
                <th className={headCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* keep tbody valid but visually empty to match screenshot */}
              <tr className="hidden" />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
