// frontend/src/pages/my-info/MyInfoPage.tsx
import { useState } from "react";
import {
  useGetMyEmployeeQuery,
  useUpdateEmployeeMutation,
} from "../../features/employees/employeesApi";
import {
  useGetEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  useGetDependentsQuery,
  useCreateDependentMutation,
  useDeleteDependentMutation,
} from "../../features/pim/pimApi";

type TabKey =
  | "personal"
  | "contact"
  | "emergency"
  | "dependents"
  | "immigration";

const tabs: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal Details" },
  { key: "contact", label: "Contact Details" },
  { key: "emergency", label: "Emergency Contacts" },
  { key: "dependents", label: "Dependents" },
  { key: "immigration", label: "Immigration" },
];

export default function MyInfoPage() {
  const [active, setActive] = useState<TabKey>("personal");
  const { data: employee, isLoading } = useGetMyEmployeeQuery();
  const [updateEmployee, { isLoading: isSavingEmployee }] =
    useUpdateEmployeeMutation();

  if (isLoading || !employee) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f5f6fa] text-sm text-slate-500">
        Loading My Info...
      </div>
    );
  }

  const fullName = `${employee.firstName ?? ""}${
    employee.lastName ? " " + employee.lastName : ""
  }`;

  return (
    <div className="flex h-full bg-[#f5f6fa]">
      {/* Left side: profile + nav */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-slate-100">
          <div className="h-24 w-24 rounded-full bg-slate-200 mb-3" />
          <p className="text-[13px] font-semibold text-slate-800 text-center">
            {fullName || "Employee"}
          </p>
        </div>

        <nav className="flex-1 py-3 text-[12px]">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`w-full text-left px-6 py-2.5 ${
                active === t.key
                  ? "bg-[#fef4ea] text-[#f6901e] font-semibold border-l-2 border-[#f7941d]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right side: content */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        <div className="bg-white rounded-[18px] border border-[#e5e7f0] shadow-sm min-h-[76vh] flex flex-col">
          {active === "personal" && (
            <PersonalDetailsTab
              employee={employee}
              onSave={(data) =>
                updateEmployee({ id: employee._id, data }).unwrap()
              }
              isSaving={isSavingEmployee}
            />
          )}

          {active === "contact" && (
            <ContactDetailsTab
              employee={employee}
              onSave={(data) =>
                updateEmployee({ id: employee._id, data }).unwrap()
              }
              isSaving={isSavingEmployee}
            />
          )}

          {active === "emergency" && (
            <EmergencyContactsTab employeeId={employee._id} />
          )}

          {active === "dependents" && (
            <DependentsTab employeeId={employee._id} />
          )}

          {active === "immigration" && (
            <ImmigrationTab employeeId={employee._id} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- Helpers ----------------- */

const labelCls =
  "block text-[11px] font-semibold text-slate-500 mb-1 tracking-wide";
const inputCls =
  "w-full h-9 rounded border border-[#d5d7e5] bg-white px-3 text-[12px] text-slate-800 focus:outline-none focus:border-[#f7941d] focus:ring-1 focus:ring-[#f8b46a]";

/* ----------------- Personal Details ----------------- */

interface PersonalProps {
  employee: any;
  onSave: (data: any) => Promise<any>;
  isSaving: boolean;
}

function PersonalDetailsTab({ employee, onSave, isSaving }: PersonalProps) {
  const [form, setForm] = useState({
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
    smoker: employee.smoker || false,
    militaryService: employee.militaryService || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      ...form,
      dateOfBirth: form.dateOfBirth
        ? new Date(form.dateOfBirth).toISOString()
        : undefined,
      licenseExpiry: form.licenseExpiry
        ? new Date(form.licenseExpiry).toISOString()
        : undefined,
    });
  }

  return (
    <>
      {/* Header */}
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          Personal Details
        </h2>
      </div>

      {/* Form body */}
      <form
        onSubmit={handleSubmit}
        className="px-7 pt-5 pb-4 flex-1 flex flex-col"
      >
        <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-6">
          {/* Left column: label only (to align like OrangeHRM) */}
          <div className="flex flex-col items-center pt-1">
            <div className="h-24 w-24 rounded-full bg-slate-200 mb-2" />
          </div>

          {/* Right column: fields */}
          <div className="space-y-4">
            {/* Employee full name row */}
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

            {/* Nickname */}
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

            {/* Employee Id / Other Id */}
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

            {/* License / Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Driver&apos;s Licence Number</label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>SSN Number</label>
                <input
                  name="ssnNumber"
                  value={form.ssnNumber}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>SIN Number</label>
                <input
                  name="sinNumber"
                  value={form.sinNumber}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Nationality / Marital status */}
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
              <div>
                <label className={labelCls}>Smoker</label>
                <div className="flex items-center h-9">
                  <label className="flex items-center gap-1 text-[12px] text-slate-700">
                    <input
                      type="checkbox"
                      name="smoker"
                      checked={form.smoker}
                      onChange={handleCheckbox}
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Military Service */}
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
          </div>
        </div>

        {/* Required note + Save button */}
        <div className="mt-6 flex items-center justify-between border-t border-[#edf0f7] pt-4">
          <p className="text-[10px] text-slate-400">
            * Required
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Attachments (static UI) */}
        <AttachmentsBlock />
      </form>
    </>
  );
}

/* ----------------- Contact Details ----------------- */

interface ContactProps {
  employee: any;
  onSave: (data: any) => Promise<any>;
  isSaving: boolean;
}

function ContactDetailsTab({ employee, onSave, isSaving }: ContactProps) {
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
        {/* Address */}
        <div className="space-y-4">
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

          {/* Phones */}
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

          {/* Emails */}
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

        {/* Required + Save */}
        <div className="mt-6 flex items-center justify-between border-t border-[#edf0f7] pt-4">
          <p className="text-[10px] text-slate-400">
            * Required
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 h-8 rounded-full bg-[#8bc34a] text-white text-[12px] font-semibold hover:bg-[#7cb342] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Attachments block */}
        <AttachmentsBlock />
      </form>
    </>
  );
}

/* ----------------- Emergency Contacts ----------------- */

function EmergencyContactsTab({ employeeId }: { employeeId: string }) {
  const { data: contacts = [] } = useGetEmergencyContactsQuery(employeeId);
  const [createContact] = useCreateEmergencyContactMutation();
  const [deleteContact] = useDeleteEmergencyContactMutation();

  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Emergency Contacts
          </h2>
          <button
            type="button"
            onClick={() => {
              const name = prompt("Contact name?");
              if (!name) return;
              createContact({ employeeId, data: { name } });
            }}
            className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Contacts table */}
      <div className="px-7 pt-4 pb-2">
        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Relationship
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Home Telephone
                </th>
                <th className="px-3 py-2 text-left font-semibold">Mobile</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Work Telephone
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-[11px] text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                contacts.map((c: any) => (
                  <tr key={c._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">
                      {c.relationship || ""}
                    </td>
                    <td className="px-3 py-2">
                      {c.homeTelephone || ""}
                    </td>
                    <td className="px-3 py-2">{c.mobile || ""}</td>
                    <td className="px-3 py-2">
                      {c.workTelephone || ""}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete?") &&
                          deleteContact({ employeeId, id: c._id })
                        }
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachments block under table */}
      <AttachmentsBlock title="Attachments" />
    </>
  );
}

/* ----------------- Dependents ----------------- */

function DependentsTab({ employeeId }: { employeeId: string }) {
  const { data: dependents = [] } = useGetDependentsQuery(employeeId);
  const [createDep] = useCreateDependentMutation();
  const [deleteDep] = useDeleteDependentMutation();

  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Dependents
          </h2>
          <button
            type="button"
            onClick={() => {
              const name = prompt("Dependent name?");
              if (!name) return;
              createDep({ employeeId, data: { name } });
            }}
            className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Dependents table */}
      <div className="px-7 pt-4 pb-2">
        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Relationship
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Date of Birth
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dependents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-[11px] text-slate-400"
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                dependents.map((d: any) => (
                  <tr key={d._id} className="border-t border-[#f0f1f7]">
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">
                      {d.relationship || ""}
                    </td>
                    <td className="px-3 py-2">
                      {d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : ""}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.confirm("Delete?") &&
                          deleteDep({ employeeId, id: d._id })
                        }
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachments block */}
      <AttachmentsBlock title="Attachments" />
    </>
  );
}

/* ----------------- Immigration (UI skeleton) ----------------- */

function ImmigrationTab({ employeeId }: { employeeId: string }) {
  // currently static, same as OrangeHRM "No Records Found"
  return (
    <>
      <div className="px-7 py-4 border-b border-[#edf0f7]">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Assigned Immigration Records
          </h2>
          <button
            type="button"
            className="px-5 h-8 rounded-full bg-[#8bc34a] text-white text-[11px] font-semibold hover:bg-[#7cb342]"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="px-7 pt-4 pb-2">
        <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-[#f5f6fb] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-6">
                  <input type="checkbox" disabled />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Document</th>
                <th className="px-3 py-2 text-left font-semibold">Number</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Issued By
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Issued Date
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Expiry Date
                </th>
                <th className="px-3 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[11px] text-slate-400"
                >
                  No Records Found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AttachmentsBlock title="Attachments" />
    </>
  );
}

/* ----------------- Attachments (shared) ----------------- */

function AttachmentsBlock({ title = "Attachments" }: { title?: string }) {
  return (
    <div className="mt-6 border-t border-[#edf0f7] pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold text-slate-800">
          {title}
        </h3>
        <button
          type="button"
          className="px-5 h-7 rounded-full bg-[#f5f6fb] text-[11px] font-semibold text-slate-700 hover:bg-[#e9ebf7]"
        >
          + Add
        </button>
      </div>

      <div className="border border-[#e3e5f0] rounded-lg overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-[#f5f6fb] text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-6">
                <input type="checkbox" disabled />
              </th>
              <th className="px-3 py-2 text-left font-semibold">File Name</th>
              <th className="px-3 py-2 text-left font-semibold">
                Description
              </th>
              <th className="px-3 py-2 text-left font-semibold">Size</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Date Added</th>
              <th className="px-3 py-2 text-left font-semibold">Added By</th>
              <th className="px-3 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={8}
                className="px-3 py-6 text-center text-[11px] text-slate-400"
              >
                No Records Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}