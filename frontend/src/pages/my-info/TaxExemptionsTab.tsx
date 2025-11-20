import { useEffect, useState } from "react";
import {
  useGetTaxQuery,
  useUpdateTaxMutation,
} from "../../features/myInfo/myInfoApi";

const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

export default function TaxExemptionsTab({ employeeId }: { employeeId: string }) {
  const { data: taxData = {}, isLoading } = useGetTaxQuery(employeeId);
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

  // INITIAL DATA LOAD
  useEffect(() => {
    if (taxData) {
      setForm({
        federalStatus: taxData.federalStatus || "",
        federalExemptions: taxData.federalExemptions || "",
        state: taxData.state || "",
        stateStatus: taxData.stateStatus || "",
        stateExemptions: taxData.stateExemptions || "",
        unemploymentState: taxData.unemploymentState || "",
        workState: taxData.workState || "",
      });
    }
  }, [taxData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await updateTax({
      employeeId,
      data: {
        ...form,
        federalExemptions: form.federalExemptions
          ? Number(form.federalExemptions)
          : undefined,
        stateExemptions: form.stateExemptions
          ? Number(form.stateExemptions)
          : undefined,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading Tax Information...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Tax Exemptions
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-7 pt-6 pb-6 text-[12px] space-y-8"
      >

        {/* FEDERAL TAX SECTION */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            Federal Tax
          </h3>

          <div className="grid grid-cols-2 gap-6">

            {/* Federal Status */}
            <div>
              <label className={labelCls}>Status</label>
              <select
                name="federalStatus"
                value={form.federalStatus}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Head of Household">Head of Household</option>
              </select>
            </div>

            {/* Federal Exemptions */}
            <div>
              <label className={labelCls}>Exemptions</label>
              <input
                name="federalExemptions"
                value={form.federalExemptions}
                onChange={handleChange}
                className={inputCls}
                type="number"
                placeholder="0"
              />
            </div>

          </div>
        </div>

        {/* STATE TAX SECTION */}
        <div>
          <h3 className="text-[12px] font-semibold text-slate-700 mb-3">
            State Income Tax
          </h3>

          <div className="grid grid-cols-2 gap-6">

            {/* State */}
            <div>
              <label className={labelCls}>State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. California"
              />
            </div>

            {/* State Status */}
            <div>
              <label className={labelCls}>Status</label>
              <input
                name="stateStatus"
                value={form.stateStatus}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. Single / Married"
              />
            </div>

            {/* State Exemptions */}
            <div>
              <label className={labelCls}>Exemptions</label>
              <input
                name="stateExemptions"
                value={form.stateExemptions}
                onChange={handleChange}
                className={inputCls}
                type="number"
                placeholder="0"
              />
            </div>

            {/* Unemployment State */}
            <div>
              <label className={labelCls}>Unemployment State</label>
              <input
                name="unemploymentState"
                value={form.unemploymentState}
                onChange={handleChange}
                className={inputCls}
                placeholder="State"
              />
            </div>

            {/* Work State */}
            <div>
              <label className={labelCls}>Work State</label>
              <input
                name="workState"
                value={form.workState}
                onChange={handleChange}
                className={inputCls}
                placeholder="State"
              />
            </div>

          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4 border-t border-[#edf0f7]">
          <button
            type="submit"
            disabled={saving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}
