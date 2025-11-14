// frontend/src/features/employees/employeesApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "../../app/apiBase";

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  status: "ACTIVE" | "INACTIVE";
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: authorizedBaseQuery,
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    // GET /api/employees
    getEmployees: builder.query<Employee[], void>({
      query: () => "employees",
      providesTags: ["Employee"],
    }),

    // POST /api/employees
    createEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (body) => ({
        url: "employees",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee"],
    }),

    // GET /api/employees/:id
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `employees/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Employee", id } as any,
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useGetEmployeeByIdQuery,
} = employeesApi;
