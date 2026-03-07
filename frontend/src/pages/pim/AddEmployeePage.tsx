import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBulkImportEmployeesMutation,
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
} from "../../features/employees/employeesApi";
import { useRegisterMutation } from "../../features/auth/authApi";
import { useGetDivisionsQuery } from "../../features/divisions/divisionsApi";
import * as XLSX from "xlsx";

type LoginStatus = "ENABLED" | "DISABLED";

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  divisionId: string;
  createLogin: boolean;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  loginStatus: LoginStatus;
}

const initialForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  employeeId: "",
  divisionId: "",
  createLogin: true,
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  loginStatus: "ENABLED",
};

type BulkImportPreviewRow = {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: "ACTIVE" | "INACTIVE";
  division?: string;
  subDivision?: string;
};

function normalizeKey(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_-]/g, "");
}

function cleanCell(value: any) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", middleName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function parseEmployeeExcelRows(rows: any[]): BulkImportPreviewRow[] {
  return rows
    .map((raw) => {
      const mapped: Record<string, any> = {};

      Object.keys(raw || {}).forEach((key) => {
        mapped[normalizeKey(key)] = raw[key];
      });

      const employeeId =
        cleanCell(
          mapped.employeeid ||
            mapped.empid ||
            mapped.empcode ||
            mapped.code ||
            mapped.id,
        ) || "";

      let firstName = cleanCell(mapped.firstname || mapped.givenname);
      let middleName = cleanCell(mapped.middlename);
      let lastName = cleanCell(
        mapped.lastname || mapped.surname || mapped.familyname,
      );

      const fullName = cleanCell(
        mapped.fullname || mapped.name || mapped.employeename,
      );
      if ((!firstName || !lastName) && fullName) {
        const split = splitName(fullName);
        firstName = firstName || split.firstName;
        middleName = middleName || split.middleName;
        lastName = lastName || split.lastName;
      }

      const email = cleanCell(
        mapped.email || mapped.workemail || mapped.officialemail,
      );

      const phone = cleanCell(
        mapped.phone ||
          mapped.mobile ||
          mapped.mobilenumber ||
          mapped.phonenumber ||
          mapped.contactnumber,
      );

      const jobTitle = cleanCell(
        mapped.jobtitle || mapped.designation || mapped.title,
      );

      const department = cleanCell(
        mapped.department || mapped.subunit || mapped.subunitname,
      );

      const location = cleanCell(
        mapped.location || mapped.office || mapped.branch,
      );

      const rawStatus = cleanCell(mapped.status).toUpperCase();
      const status: "ACTIVE" | "INACTIVE" =
        rawStatus === "INACTIVE" || rawStatus === "DISABLED"
          ? "INACTIVE"
          : "ACTIVE";

      const division = cleanCell(
        mapped.division || mapped.divisionid || mapped.divisionname,
      );

      const subDivision = cleanCell(
        mapped.subdivision ||
          mapped.subdivisionid ||
          mapped.subdivisionname ||
          mapped.subunitid,
      );

      return {
        employeeId,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        jobTitle,
        department,
        location,
        status,
        division,
        subDivision,
      };
    })
    .filter(
      (row) => row.employeeId || row.firstName || row.lastName || row.email,
    );
}

export default function AddEmployeePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [configOpen, setConfigOpen] = useState(false);

  const { data: employees = [] } = useGetEmployeesQuery(undefined);
  const { data: divisions = [], isLoading: divLoading } =
    useGetDivisionsQuery();

  const [createEmployee, { isLoading: isCreatingEmployee }] =
    useCreateEmployeeMutation();
  const [registerUser, { isLoading: isCreatingUser }] = useRegisterMutation();
  const [bulkImportEmployees, { isLoading: isBulkImporting }] =
    useBulkImportEmployeesMutation();

  const isSaving = isCreatingEmployee || isCreatingUser;

  const [bulkRows, setBulkRows] = useState<BulkImportPreviewRow[]>([]);
  const [bulkFileName, setBulkFileName] = useState("");
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState<string | null>(
    null,
  );
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!form.employeeId && employees.length > 0) {
      let maxNum = 0;
      for (const emp of employees) {
        const n = parseInt(emp.employeeId, 10);
        if (!Number.isNaN(n) && n > maxNum) maxNum = n;
      }
      const next = String(maxNum + 1 || 1).padStart(4, "0");
      setForm((prev) => ({ ...prev, employeeId: next }));
    }
  }, [employees, form.employeeId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      const checked = e.target.checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleBulkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkImportError(null);
    setBulkImportSuccess(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        setBulkImportError("No sheet found in the uploaded file.");
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      }) as any[];

      const parsed = parseEmployeeExcelRows(rawRows);

      if (!parsed.length) {
        setBulkImportError("No valid employee rows found in the Excel file.");
        return;
      }

      setBulkRows(parsed);
      setBulkFileName(file.name);
    } catch (err) {
      console.error(err);
      setBulkImportError("Failed to read Excel file.");
    }
  }

  async function handleBulkImport() {
    setBulkImportError(null);
    setBulkImportSuccess(null);

    if (!bulkRows.length) {
      setBulkImportError("Please upload an Excel file first.");
      return;
    }

    try {
      const res = await bulkImportEmployees({ employees: bulkRows }).unwrap();

      setBulkImportSuccess(
        `Import completed. Created: ${res.created}, Updated: ${res.updated}, Skipped: ${res.skipped}`,
      );

      setBulkRows([]);
      setBulkFileName("");
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      setBulkImportError(
        err?.data?.message || err?.error || "Bulk import failed.",
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }
    if (!form.employeeId.trim()) {
      setError("Employee Id is required.");
      return;
    }

    if (form.createLogin) {
      if (!form.username.trim()) {
        setError("Username is required when creating login details.");
        return;
      }
      if (!form.email.trim()) {
        setError("Email is required when creating login details.");
        return;
      }
      if (!form.password) {
        setError("Password is required when creating login details.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Password and Confirm Password must match.");
        return;
      }
    }

    try {
      let userEmail: string | undefined = undefined;
      if (form.createLogin) {
        const registerRes = await registerUser({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        }).unwrap();

        userEmail = registerRes.user.email;
      }

      const status = form.loginStatus === "DISABLED" ? "INACTIVE" : "ACTIVE";

      await createEmployee({
        employeeId: form.employeeId.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: userEmail || form.email.trim() || "no-email@example.com",
        status,
        division: form.divisionId || null,
      }).unwrap();

      setSuccess("Employee created successfully.");
      setTimeout(() => {
        navigate("/employees");
      }, 800);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Failed to save employee. Please try again.";
      setError(msg);
    }
  }

  const tabBase =
    "px-5 py-2 text-xs md:text-sm rounded-full transition-colors whitespace-nowrap";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">PIM</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" onMouseLeave={() => setConfigOpen(false)}>
            <button
              type="button"
              onClick={() => setConfigOpen((o) => !o)}
              className={`${tabBase} ${
                configOpen
                  ? "bg-green-100 text-green-600 border border-green-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>Configuration</span>
              <span className="ml-1 text-[10px] align-middle">▾</span>
            </button>

            {configOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 text-xs text-slate-600 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/optional-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50"
                >
                  Optional Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/custom-fields");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50"
                >
                  Custom Fields
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/data-import");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50"
                >
                  Data Import
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/reporting-methods");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50"
                >
                  Reporting Methods
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfigOpen(false);
                    navigate("/pim/config/termination-reasons");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 rounded-b-xl"
                >
                  Termination Reasons
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim")}
          >
            Employee List
          </button>

          <button
            type="button"
            className={`${tabBase} bg-green-500 text-white shadow-sm`}
          >
            Add Employee
          </button>

          <button
            type="button"
            className={`${tabBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`}
            onClick={() => navigate("/pim/reports")}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Bulk Import */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Bulk Import Old Employees
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload Excel file (.xlsx / .xls). Existing employees with same
              Employee ID will be updated.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bulkFileInputRef.current?.click()}
              className="px-4 py-2 rounded-full border border-slate-300 text-xs md:text-sm text-slate-700 hover:bg-slate-50"
            >
              Upload Excel
            </button>

            <button
              type="button"
              onClick={handleBulkImport}
              disabled={isBulkImporting || bulkRows.length === 0}
              className="px-5 py-2 rounded-full bg-lime-500 text-xs md:text-sm text-white font-semibold shadow-sm hover:bg-lime-600 disabled:opacity-60"
            >
              {isBulkImporting ? "Importing..." : "Import Employees"}
            </button>
          </div>
        </div>

        <input
          ref={bulkFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleBulkFileChange}
        />

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
          <div className="font-semibold text-slate-700 mb-2">
            Supported columns
          </div>
          <div className="leading-6">
            employeeId, firstName, middleName, lastName, fullName, email, phone,
            mobileNumber, jobTitle, department, location, status, division,
            divisionId, subDivision, subDivisionId
          </div>
        </div>

        {bulkImportError && (
          <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
            {bulkImportError}
          </div>
        )}

        {bulkImportSuccess && (
          <div className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            {bulkImportSuccess}
          </div>
        )}

        {bulkFileName && (
          <div className="mt-4 text-xs text-slate-600">
            <span className="font-semibold">Selected file:</span> {bulkFileName}
          </div>
        )}

        {bulkRows.length > 0 && (
          <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Employee ID</th>
                  <th className="px-3 py-2 text-left">First Name</th>
                  <th className="px-3 py-2 text-left">Last Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bulkRows.slice(0, 10).map((row, idx) => (
                  <tr
                    key={`${row.employeeId}-${idx}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2">{row.employeeId || "-"}</td>
                    <td className="px-3 py-2">{row.firstName || "-"}</td>
                    <td className="px-3 py-2">{row.lastName || "-"}</td>
                    <td className="px-3 py-2">{row.email || "-"}</td>
                    <td className="px-3 py-2">{row.phone || "-"}</td>
                    <td className="px-3 py-2">{row.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bulkRows.length > 10 && (
              <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-100 bg-white">
                Showing first 10 rows out of {bulkRows.length} parsed employees.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Add Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Add Employee
        </h2>

        {error && (
          <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div
                className="relative h-40 w-40 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 cursor-pointer"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 text-xs gap-1">
                    <div className="h-16 w-16 rounded-full bg-slate-200" />
                    <span>Upload Photo</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-md"
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center lg:text-left max-w-[220px]">
                Accepts .jpg, .png, .gif up to 1MB. Recommended dimensions:
                200px x 200px
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Employee Full Name<span className="text-green-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Employee Id
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full md:w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Division
                </label>

                <select
                  name="divisionId"
                  value={form.divisionId}
                  onChange={handleChange}
                  className="w-full md:w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">
                    {divLoading ? "Loading..." : "-- Select Division --"}
                  </option>

                  {divisions
                    .filter((d) => d.isActive !== false)
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Create Login Details
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="relative">
                        <input
                          type="checkbox"
                          name="createLogin"
                          checked={form.createLogin}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-500">Status</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="loginStatus"
                        value="ENABLED"
                        checked={form.loginStatus === "ENABLED"}
                        onChange={handleChange}
                        className="text-green-500"
                      />
                      <span>Enabled</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="loginStatus"
                        value="DISABLED"
                        checked={form.loginStatus === "DISABLED"}
                        onChange={handleChange}
                        className="text-green-500"
                      />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>

                {form.createLogin && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Username<span className="text-green-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Email<span className="text-green-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Password<span className="text-green-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Confirm Password
                          <span className="text-green-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      For a strong password, use a hard-to-guess combination of
                      upper and lower case letters, numbers, and symbols.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-5 py-2 rounded-full border border-slate-300 text-xs md:text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-full bg-lime-500 text-xs md:text-sm text-white font-semibold shadow-sm hover:bg-lime-600 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            <span className="text-green-500">*</span> Required
          </p>
        </form>
      </div>
    </div>
  );
}
