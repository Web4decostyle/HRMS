// frontend/src/pages/admin/general-info/GeneralInfoPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
  useGetGeneralInfoQuery,
  useUpdateGeneralInfoMutation,
} from "../../../features/admin/adminApi";

type GeneralForm = {
  _id?: string;
  companyName: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  fax?: string;
  email?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // optional fallback fields (not required, may not exist)
  numberOfEmployees?: number | null;
};

export default function GeneralInfoPage() {
  const { data, isLoading } = useGetGeneralInfoQuery();
  const [updateInfo, { isLoading: isSaving }] = useUpdateGeneralInfoMutation();

  const [form, setForm] = useState<GeneralForm>({
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
    numberOfEmployees: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Keep a copy of the original data so Cancel can restore it
  const [initialSnapshot, setInitialSnapshot] = useState<GeneralForm | null>(null);

  useEffect(() => {
    if (data) {
      // Map API fields to local form shape (safe defaults)
      const mapped: GeneralForm = {
        _id: (data as any)._id,
        companyName: (data as any).companyName ?? "",
        taxId: (data as any).taxId ?? "",
        registrationNumber: (data as any).registrationNumber ?? "",
        phone: (data as any).phone ?? "",
        fax: (data as any).fax ?? "",
        email: (data as any).email ?? "",
        street1: (data as any).street1 ?? "",
        street2: (data as any).street2 ?? "",
        city: (data as any).city ?? "",
        state: (data as any).state ?? "",
        zip: (data as any).zip ?? "",
        country: (data as any).country ?? "",
        numberOfEmployees:
          (data as any).numberOfEmployees ??
          (data as any).employeeCount ??
          (data as any).numEmployees ??
          null,
      };
      setForm(mapped);
      setInitialSnapshot(mapped);
    }
  }, [data]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleToggleEdit(on: boolean) {
    setIsEditing(on);
    if (on) {
      // ensure we have a fresh snapshot to cancel to
      setInitialSnapshot(form);
    } else {
      // turning edit off cancels any in-progress changes by restoring snapshot
      if (initialSnapshot) setForm(initialSnapshot);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.companyName || !form.companyName.trim()) return;

    // Prepare payload — exclude _id and numberOfEmployees
    const payload: Partial<GeneralForm> = {
      companyName: form.companyName,
      taxId: form.taxId,
      registrationNumber: form.registrationNumber,
      phone: form.phone,
      fax: form.fax,
      email: form.email,
      street1: form.street1,
      street2: form.street2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };

    try {
      await updateInfo(payload).unwrap();
      // After successful save, turn off editing and snapshot the saved state
      setIsEditing(false);
      setInitialSnapshot((prev) => ({ ...(prev ?? {}), ...payload } as GeneralForm));
    } catch (err) {
      // Keep simple: log error. Integrate toast/snackbar if you want.
      console.error("Failed to update general info", err);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin / Organization</h1>
        <p className="text-xs text-slate-500 mt-1">General Information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">General Information</h2>

          {/* Edit toggle + Save button (Save shown when editing) */}
          <div className="flex items-center gap-4">
            {/* Number of Employees display (right of title in screenshot) */}
            <div className="text-xs text-slate-500 mr-2 hidden md:block">
              <div className="text-[11px] text-slate-400">Number of Employees</div>
              <div className="text-slate-700 font-medium">{form.numberOfEmployees ?? "-"}</div>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500">Edit</label>
              <button
                onClick={() => handleToggleEdit(!isEditing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 ${
                  isEditing ? "bg-lime-500" : "bg-slate-200"
                }`}
                aria-pressed={isEditing}
                aria-label="Toggle edit"
                type="button"
              >
                <span
                  className={`transform transition-transform duration-150 inline-block h-4 w-4 rounded-full bg-white ml-1 ${
                    isEditing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Save / Cancel (only visible in editing mode) */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Cancel: restore snapshot and exit edit mode
                    if (initialSnapshot) setForm(initialSnapshot);
                    setIsEditing(false);
                  }}
                  type="button"
                  className="px-4 py-1.5 rounded-full border border-lime-400 text-lime-600 text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  form="general-info-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-1.5 rounded-full bg-lime-500 hover:bg-lime-600 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading && !data ? (
          <div className="px-6 py-6 text-xs text-center">Loading...</div>
        ) : (
          <form
            id="general-info-form"
            onSubmit={handleSubmit}
            className="px-6 py-6 text-xs grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Column 1 */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Organization Name *</label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full rounded-md px-3 py-3 text-sm ${
                      isEditing
                        ? "border border-slate-200 focus:ring-1 focus:ring-red-400 focus:outline-none"
                        : "bg-slate-50/60 text-slate-700 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Number of Employees</label>
                  <div className="w-full rounded-md px-3 py-3 text-sm bg-slate-50/60 text-slate-700 border border-transparent">
                    {form.numberOfEmployees ?? "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Registration Number</label>
                  <input
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Tax ID</label>
                  <input
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Fax</label>
                  <input
                    name="fax"
                    value={form.fax}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-medium text-slate-700 text-xs">Address Street 1</label>
                  <input
                    name="street1"
                    value={form.street1}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Address Street 2</label>
                  <input
                    name="street2"
                    value={form.street2}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">State/Province</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Zip/Postal Code</label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-medium text-slate-700 text-xs">Notes</label>
                  <textarea
                    name="notes"
                    value={(form as any).notes ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full rounded-md px-3 py-2 text-sm min-h-[70px] ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700 text-xs">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isEditing ? "border border-slate-200" : "bg-slate-50/60 border border-transparent"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Right column spacing to match screenshot (empty footer space) */}
            <div className="md:col-span-1" />

            <div className="md:col-span-3 px-2">
              <div className="text-xs text-slate-400 mt-4">* Required</div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
