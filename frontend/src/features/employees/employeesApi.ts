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
}

export interface EmployeeFilters {
  name?: string;
  employeeId?: string;
  jobTitle?: string;
  subUnit?: string;
  status?: EmployeeStatus | "";
  include?: "current" | "past" | "all";
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], EmployeeFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters) {
          if (filters.name) params.set("name", filters.name);
          if (filters.employeeId)
            params.set("employeeId", filters.employeeId);
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

    createEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (body) => ({
        url: "employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `employees/${id}`,
      providesTags: (_result, _err, id) => [
        { type: "Employee" as const, id },
      ],
    }),

    // 🔹 My Info – current user's employee record
    getMyEmployee: builder.query<Employee, void>({
      query: () => "employees/me",
      providesTags: (result) =>
        result ? [{ type: "Employee", id: result._id }] : [],
    }),

    // 🔹 Generic update (used by Personal & Contact tabs)
    updateEmployee: builder.mutation<
      Employee,
      { id: string; data: Partial<Employee> }
    >({
      query: ({ id, data }) => ({
        url: `employees/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Employee", id: arg.id },
        { type: "Employee", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useGetEmployeeByIdQuery,
  useGetMyEmployeeQuery,
  useUpdateEmployeeMutation,
} = employeesApi;
