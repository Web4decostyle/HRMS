import { FormEvent, useState, useEffect } from "react";
import {
  useGetGeneralInfoQuery,
  useUpdateGeneralInfoMutation,
} from "../../../features/admin/adminApi";

export default function GeneralInfoPage() {
  const { data, isLoading } = useGetGeneralInfoQuery();
  const [updateInfo, { isLoading: isSaving }] = useUpdateGeneralInfoMutation();

  const [form, setForm] = useState({
    companyName: "",
    taxId: "",
    registrationNumber: "",
    phone: "",
    fax: "",
    email: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    if (data) {
      setForm((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [data]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.companyName.trim()) return;
    await updateInfo(form).unwrap();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Admin / Organization
        </h1>
        <p className="text-xs text-slate-500 mt-1">General Information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            General Information
          </h2>
          <button
            form="general-info-form"
            type="submit"
            disabled={isSaving}
            className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
          >
            Save
          </button>
        </div>

        {isLoading && !data ? (
          <div className="px-6 py-6 text-xs text-center">Loading...</div>
        ) : (
          <form
            id="general-info-form"
            onSubmit={handleSubmit}
            className="px-6 py-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">
                Organization Name *
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Tax ID</label>
              <input
                name="taxId"
                value={form.taxId}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">
                Registration Number
              </label>
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Fax</label>
              <input
                name="fax"
                value={form.fax}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium text-slate-700">Street 1</label>
              <input
                name="street1"
                value={form.street1}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium text-slate-700">Street 2</label>
              <input
                name="street2"
                value={form.street2}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">State/Province</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Zip/Postal Code</label>
              <input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-slate-700">Country</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="border border-slate-200 rounded-md px-2 py-1"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
