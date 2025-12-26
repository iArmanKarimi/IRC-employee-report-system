export const ROUTES = {
	ROOT: "/",
	PROVINCES: "/provinces",
	PROVINCE_EMPLOYEES: "/provinces/:provinceId/employees",
	PROVINCE_EMPLOYEE_DETAIL: "/provinces/:provinceId/employees/:employeeId",
	PROVINCE_EMPLOYEE_NEW: "/provinces/:provinceId/employees/new"
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const API_ENDPOINTS = {
	LOGIN: "/auth/login",
	LOGOUT: "/auth/logout",
	PROVINCES: "/provinces",
	provinceById: (provinceId: string) => `/provinces/${provinceId}`,
	provinceEmployees: (provinceId: string) => `/provinces/${provinceId}/employees`,
	provinceEmployeeById: (provinceId: string, employeeId: string) => `/provinces/${provinceId}/employees/${employeeId}`,
	CLEAR_ALL_PERFORMANCES: "/employees/clear-performances"
} as const;

export default { ROUTES, API_ENDPOINTS };
