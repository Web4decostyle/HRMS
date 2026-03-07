import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;

  middleName?: string;
  nickname?: string;
  otherId?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  maritalStatus?: string;
  smoker?: boolean;
  nationality?: string;

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

  email: string;
  jobTitle?: string;
  department?: string;

  subDivision?: string | null;
  division?: string | null;

  phone?: string;
  location?: string;

  status: EmployeeStatus;

  attachments?: Attachment[];
}

export interface SimpleEmployee {
  _id: string;
  fullName: string;
  status?: EmployeeStatus;
}

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

export type ApprovalSubmittedResponse = {
  ok: true;
  message: string;
  changeRequestId: string;
};

export type UpdateEmployeeResponse = Employee | ApprovalSubmittedResponse;

export function isApprovalSubmittedResponse(
  x: any
): x is ApprovalSubmittedResponse {
  return !!x && typeof x === "object" && typeof x.changeRequestId === "string";
}

export interface BulkImportEmployeeRow {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: EmployeeStatus;
  division?: string;
  subDivision?: string;
}

export interface BulkImportEmployeesResponse {
  ok: true;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    employeeId?: string;
    message: string;
  }>;
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Employee", "Attachment"],
  endpoints: (builder) => ({
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

    bulkImportEmployees: builder.mutation<
      BulkImportEmployeesResponse,
      { employees: BulkImportEmployeeRow[] }
    >({
      query: (body) => ({
        url: "employees/bulk-import",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Employee", id }],
    }),

    getMyEmployee: builder.query<Employee, void>({
      query: () => "employees/me",
      providesTags: (result) =>
        result ? [{ type: "Employee", id: result._id }] : [],
    }),

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
        if (isApprovalSubmittedResponse(res)) {
          return [{ type: "Employee" as const, id: "LIST" }];
        }
        return [
          { type: "Employee" as const, id: arg.id },
          { type: "Employee" as const, id: "LIST" },
        ];
      },
    }),

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
  useBulkImportEmployeesMutation,
  useGetEmployeeByIdQuery,
  useGetMyEmployeeQuery,
  useUpdateEmployeeMutation,
  useGetEmployeeAttachmentsQuery,
  useUploadEmployeeAttachmentMutation,
  useDeleteEmployeeAttachmentMutation,
} = employeesApi;