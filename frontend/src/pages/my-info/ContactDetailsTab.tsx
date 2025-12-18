import { useState } from "react";
import AttachmentsBlock from "./AttachmentsBlock";
import { labelCls, inputCls } from "./myInfoStyles";

interface ContactProps {
  employee: any;
  onSave: (data: any) => Promise<any>;
  isSaving: boolean;
}

export default function ContactDetailsTab({
  employee,
  onSave,
  isSaving,
}: ContactProps) {
  const [form, setForm] = useState({
    addressStreet1: employee.addressStreet1 || "",
    addressStreet2: employee.addressStreet2 || "",
    city: employee.city || "",
    state: employee.state || "",
    zipCode: employee.zipCode || "",
    country: employee.country || "",
    phoneHome: employee.phoneHome || "",
    phoneMobile: employee.phoneMobile || "",
    phoneWork: employee.phoneWork || "",
    workEmail: employee.workEmail || employee.email || "",
    otherEmail: employee.otherEmail || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Contact Details
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-7 pt-5 pb-4 flex-1 flex flex-col space-y-4"
      >
        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="addressStreet1"
                value={form.addressStreet1}
                onChange={handleChange}
                className={inputCls}
                placeholder="Street 1"
              />
              <input
                name="addressStreet2"
                value={form.addressStreet2}
                onChange={handleChange}
                className={inputCls}
                placeholder="Street 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>State/Province</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Zip/Postal Code</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select --</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Home Telephone</label>
              <input
                name="phoneHome"
                value={form.phoneHome}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Mobile</label>
              <input
                name="phoneMobile"
                value={form.phoneMobile}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Work</label>
              <input
                name="phoneWork"
                value={form.phoneWork}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Work Email</label>
              <input
                name="workEmail"
                value={form.workEmail}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Other Email</label>
              <input
                name="otherEmail"
                value={form.otherEmail}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-[#edf0f7] pt-4">
          <p className="text-[10px] text-slate-400">* Required</p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <AttachmentsBlock employeeId={employee._id} />
      </form>
    </>
  );
}