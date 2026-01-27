// frontend/src/pages/my-info/PersonalDetailsTab.tsx
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import AttachmentsBlock from "./AttachmentsBlock";
import { labelCls, inputCls } from "./myInfoStyles";
import {
  useGetOptionalFieldsQuery,
  useGetCustomFieldsQuery,
  PimCustomField,
} from "../../features/pim/pimConfigApi";

interface PersonalProps {
  employee: any;
  onSave: (data: any) => Promise<any>;
  isSaving: boolean;
}

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  nickname: string;
  employeeId: string;
  otherId: string;
  driversLicense: string;
  licenseExpiry: string;
  ssnNumber: string;
  sinNumber: string;
  nationality: string;
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  smoker: boolean;
  militaryService: string;
  customValues: Record<string, string>;
}

const emptyForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickname: "",
  employeeId: "",
  otherId: "",
  driversLicense: "",
  licenseExpiry: "",
  ssnNumber: "",
  sinNumber: "",
  nationality: "",
  maritalStatus: "",
  dateOfBirth: "",
  gender: "",
  smoker: false,
  militaryService: "",
  customValues: {},
};

export default function PersonalDetailsTab({
  employee,
  onSave,
  isSaving,
}: PersonalProps) {
  // ------------- Load config -------------
  const { data: optResp } = useGetOptionalFieldsQuery();
  const { data: customResp } = useGetCustomFieldsQuery();

  const optional = optResp?.data ?? {
    showNickname: true,
    showSmoker: true,
    showMilitaryService: true,
    showSSN: false,
    showSIN: false,
    showUSTaxExemptions: false,
  };

  // All custom fields for "personal" screen and active
  const personalCustomFields: PimCustomField[] = useMemo(
    () =>
      (customResp?.data || []).filter(
        (f) => f.screen === "personal" && f.active
      ),
    [customResp]
  );

  // ✅ IMPORTANT: don't initialize from employee directly (stale state bug)
  const [form, setForm] = useState<FormState>(emptyForm);

  // ✅ CRITICAL FIX: whenever employee changes (new login), sync form
  useEffect(() => {
    if (!employee?._id) return;

    setForm({
      firstName: employee.firstName || "",
      middleName: employee.middleName || "",
      lastName: employee.lastName || "",
      nickname: employee.nickname || "",
      employeeId: employee.employeeId || "",
      otherId: employee.otherId || "",
      driversLicense: employee.driversLicense || "",
      licenseExpiry: employee.licenseExpiry?.slice(0, 10) || "",
      ssnNumber: employee.ssnNumber || "",
      sinNumber: employee.sinNumber || "",
      nationality: employee.nationality || "",
      maritalStatus: employee.maritalStatus || "",
      dateOfBirth: employee.dateOfBirth?.slice(0, 10) || "",
      gender: employee.gender || "",
      smoker: !!employee.smoker,
      militaryService: employee.militaryService || "",
      customValues: employee.customValues || {},
    });
  }, [employee?._id]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCheckbox(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  function handleCustomChange(fieldId: string, value: string) {
    setForm((prev) => ({
      ...prev,
      customValues: {
        ...prev.customValues,
        [fieldId]: value,
      },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await onSave({
      ...form,
      dateOfBirth: form.dateOfBirth
        ? new Date(form.dateOfBirth).toISOString()
        : undefined,
      licenseExpiry: form.licenseExpiry
        ? new Date(form.licenseExpiry).toISOString()
        : undefined,
      customValues: form.customValues,
    });
  }

  // Optional: while employee loads, avoid rendering broken inputs
  if (!employee?._id) return null;

  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Personal Details
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-7 pt-5 pb-4 flex-1 flex flex-col"
      >
        <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-6">
          {/* Left avatar area */}
          <div className="flex flex-col items-center pt-1">
            <div className="h-24 w-24 rounded-full bg-slate-200 mb-2" />
          </div>

          {/* Right fields */}
          <div className="space-y-4">
            {/* Name row */}
            <div>
              <span className={labelCls}>Employee Full Name*</span>
              <div className="grid grid-cols-3 gap-3">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="First Name"
                />
                <input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Middle Name"
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Nickname (optional field) */}
            {optional.showNickname && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nickname</label>
                  <input
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* IDs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Employee Id</label>
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Other Id</label>
                <input
                  name="otherId"
                  value={form.otherId}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* License */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Driver&apos;s License Number</label>
                <input
                  name="driversLicense"
                  value={form.driversLicense}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>License Expiry Date</label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={form.licenseExpiry}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* SSN / SIN */}
            {(optional.showSSN || optional.showSIN) && (
              <div className="grid grid-cols-2 gap-4">
                {optional.showSSN && (
                  <div>
                    <label className={labelCls}>SSN Number</label>
                    <input
                      name="ssnNumber"
                      value={form.ssnNumber}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                )}
                {optional.showSIN && (
                  <div>
                    <label className={labelCls}>SIN Number</label>
                    <input
                      name="sinNumber"
                      value={form.sinNumber}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Nationality / Marital */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nationality</label>
                <select
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">-- Select --</option>
                  <option value="Indian">Indian</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">-- Select --</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            </div>

            {/* DOB / Gender / Smoker */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Gender</label>
                <div className="flex items-center h-9">
                  <label className="mr-4 flex items-center gap-1 text-[12px] text-slate-700">
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={form.gender === "MALE"}
                      onChange={handleChange}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-1 text-[12px] text-slate-700">
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={form.gender === "FEMALE"}
                      onChange={handleChange}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {optional.showSmoker && (
                <div>
                  <label className={labelCls}>Smoker</label>

                  <div className="flex items-center gap-4 h-9">
                    {/* YES */}
                    <label className="flex items-center gap-2 text-[12px] text-slate-700">
                      <input
                        type="radio"
                        name="smoker_choice"
                        checked={form.smoker === true}
                        onChange={() =>
                          setForm((p) => ({ ...p, smoker: true }))
                        }
                      />
                      <span>Yes</span>
                    </label>

                    {/* NO */}
                    <label className="flex items-center gap-2 text-[12px] text-slate-700">
                      <input
                        type="radio"
                        name="smoker_choice"
                        checked={form.smoker === false}
                        onChange={() =>
                          setForm((p) => ({ ...p, smoker: false }))
                        }
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Military */}
            {optional.showMilitaryService && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Military Service</label>
                  <input
                    name="militaryService"
                    value={form.militaryService}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Dynamic Custom Fields */}
            {personalCustomFields.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {personalCustomFields.map((field) => (
                  <div key={field._id}>
                    <label className={labelCls}>
                      {field.fieldName}
                      {field.required && (
                        <span className="text-green-500">*</span>
                      )}
                    </label>

                    {field.type === "dropdown" && field.dropdownOptions && (
                      <select
                        value={form.customValues[field._id] || ""}
                        onChange={(e) =>
                          handleCustomChange(field._id, e.target.value)
                        }
                        className={inputCls}
                      >
                        <option value="">-- Select --</option>
                        {field.dropdownOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "text" && (
                      <input
                        value={form.customValues[field._id] || ""}
                        onChange={(e) =>
                          handleCustomChange(field._id, e.target.value)
                        }
                        className={inputCls}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
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

        {/* ✅ guard attachments */}
        {employee?._id && <AttachmentsBlock employeeId={employee._id} />}
      </form>
    </>
  );
}