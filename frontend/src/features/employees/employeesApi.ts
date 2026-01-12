// frontend/src/features/employees/employeesApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;

  // Optional extra fields for My Info:
  middleName?: string;
  nickname?: string;
  otherId?: string;
  dateOfBirth?: string; // ISO string
  gender?: "MALE" | "FEMALE" | "OTHER";
  maritalStatus?: string;
  smoker?: boolean;
  nationality?: string;

  // Contact:
  addressStreet1?: string;
  addressStreet2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneHome?: string;
  phoneMobile?: string;
  phoneWork?: string;
  workEmail?: string;
  otherEmail?: string;

  email: string; // primary
  jobTitle?: string;
  department?: string; // used as Sub Unit
  status: EmployeeStatus;

  attachments?: Attachment[];
}

/** Tiny shape for dropdowns, etc. */
export interface SimpleEmployee {
  _id: string;
  fullName: string;
  status?: EmployeeStatus;
}

/** Attachment type returned by backend */
export interface Attachment {
  _id: string;
  filename: string;
  path?: string;
  description?: string;
  size?: number;
  mimeType?: string;
  addedBy?: { _id?: string; name?: string } | string;
  dateAdded?: string;
}

export interface EmployeeFilters {
  name?: string;
  employeeId?: string;
  jobTitle?: string;
  subUnit?: string;
  status?: EmployeeStatus | "";
  include?: "current" | "past" | "all";
}

/** ✅ When HR submits change, backend returns 202 response */
export type ApprovalSubmittedResponse = {
  ok: true;
  message: string;
  changeRequestId: string;
};

/** ✅ Update can return Employee (Admin) OR ApprovalSubmittedResponse (HR) */
export type UpdateEmployeeResponse = Employee | ApprovalSubmittedResponse;

export function isApprovalSubmittedResponse(
  x: any
): x is ApprovalSubmittedResponse {
  return !!x && typeof x === "object" && typeof x.changeRequestId === "string";
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Employee", "Attachment"],
  endpoints: (builder) => ({
    // Full list with filters (Employee List, etc.)
    getEmployees: builder.query<Employee[], EmployeeFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters) {
          if (filters.name) params.set("name", filters.name);
          if (filters.employeeId) params.set("employeeId", filters.employeeId);
          if (filters.jobTitle) params.set("jobTitle", filters.jobTitle);
          if (filters.subUnit) params.set("subUnit", filters.subUnit);
          if (filters.status) params.set("status", filters.status);
          if (filters.include) params.set("include", filters.include);
        }

        const qs = params.toString();
        return {
          url: `employees${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Employee" as const, id: e._id })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    // Lightweight list for dropdowns
    getEmployeesSimple: builder.query<SimpleEmployee[], void>({
      query: () => ({
        url: "employees",
        method: "GET",
      }),
      transformResponse: (employees: Employee[]): SimpleEmployee[] =>
        employees.map((e) => ({
          _id: e._id,
          fullName:
            `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || e.employeeId,
          status: e.status,
        })),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Employee" as const, id: e._id })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    createEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (body) => ({
        url: "employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Employee", id }],
    }),

    // My Info – current user's employee record
    getMyEmployee: builder.query<Employee, void>({
      query: () => "employees/me",
      providesTags: (result) =>
        result ? [{ type: "Employee", id: result._id }] : [],
    }),

    /**
     * ✅ IMPORTANT CHANGE:
     * HR updates return 202 { ok, message, changeRequestId }
     * Admin updates return Employee
     */
    updateEmployee: builder.mutation<
      UpdateEmployeeResponse,
      { id: string; data: Partial<Employee> }
    >({
      query: ({ id, data }) => ({
        url: `employees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (res, _err, arg) => {
        // If HR submitted approval request: employee didn't change yet
        if (isApprovalSubmittedResponse(res)) {
          return [{ type: "Employee" as const, id: "LIST" }];
        }
        // Admin update: invalidate employee + list
        return [
          { type: "Employee" as const, id: arg.id },
          { type: "Employee" as const, id: "LIST" },
        ];
      },
    }),

    /* ------------------ Attachments endpoints ------------------ */

    getEmployeeAttachments: builder.query<Attachment[], string>({
      query: (employeeId) => `employees/${employeeId}/attachments`,
      providesTags: (result, _error, employeeId) =>
        result
          ? [
              ...result.map((att) => ({
                type: "Attachment" as const,
                id: att._id,
              })),
              { type: "Employee" as const, id: employeeId },
            ]
          : [{ type: "Employee" as const, id: employeeId }],
    }),

    uploadEmployeeAttachment: builder.mutation<
      { success: boolean; attachment: Attachment },
      { employeeId: string; formData: FormData }
    >({
      query: ({ employeeId, formData }) => ({
        url: `employees/${employeeId}/attachments`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, _err, { employeeId }) => [
        { type: "Employee", id: employeeId },
      ],
    }),

    deleteEmployeeAttachment: builder.mutation<
      { success: boolean },
      { employeeId: string; id: string }
    >({
      query: ({ employeeId, id }) => ({
        url: `employees/${employeeId}/attachments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { employeeId }) => [
        { type: "Employee", id: employeeId },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeesSimpleQuery,
  useCreateEmployeeMutation,
  useGetEmployeeByIdQuery,
  useGetMyEmployeeQuery,
  useUpdateEmployeeMutation,
  useGetEmployeeAttachmentsQuery,
  useUploadEmployeeAttachmentMutation,
  useDeleteEmployeeAttachmentMutation,
} = employeesApi;
