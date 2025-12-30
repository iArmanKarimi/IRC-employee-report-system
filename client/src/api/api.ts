import axios from "axios";
import { API_ENDPOINTS } from "../const/endpoints";
import type { IEmployee, IProvince, CreateEmployeeInput, UpdateEmployeeInput, UserRoleType } from "../types/models";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
	withCredentials: true
});

export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	_links?: Record<string, string>;
};

export type Pagination = {
	total: number;
	page: number;
	limit: number;
	pages: number;
};

export type PaginatedResponse<T = unknown> = ApiResponse<T[]> & {
	pagination: Pagination;
};

export type LoginRequest = {
	username: string;
	password: string;
};

export type LoginResponse = {
	role: UserRoleType;
	provinceId?: string | null;
};

// Export types from models
export type Province = IProvince;
export type Employee = IEmployee;
export type { UpdateEmployeeInput, CreateEmployeeInput };

const unwrap = <T>(response: { data: T }): T => response.data;

export const authApi = {
	login: (payload: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.LOGIN, payload).then(unwrap),
	logout: () => api.post<ApiResponse<null>>(API_ENDPOINTS.LOGOUT).then(unwrap)
};

export const provinceApi = {
	list: () => api.get<ApiResponse<Province[]>>(API_ENDPOINTS.PROVINCES).then(unwrap),
	get: (provinceId: string) => api.get<ApiResponse<Province>>(API_ENDPOINTS.provinceById(provinceId)).then(unwrap),
	listEmployees: (provinceId: string, page?: number, limit?: number, filters?: {
		search?: string;
		gender?: string;
		maritalStatus?: string;
		status?: string;
		truckDriver?: boolean;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}) =>
		api
			.get<PaginatedResponse<Employee>>(API_ENDPOINTS.provinceEmployees(provinceId), {
				params: {
					page,
					limit,
					...(filters?.search && { search: filters.search }),
					...(filters?.gender && { gender: filters.gender }),
					...(filters?.maritalStatus && { maritalStatus: filters.maritalStatus }),
					...(filters?.status && { status: filters.status }),
					...(filters?.truckDriver && { truckDriver: 'true' }),
					...(filters?.sortBy && { sortBy: filters.sortBy }),
					...(filters?.sortOrder && { sortOrder: filters.sortOrder })
				}
			})
			.then(unwrap),
	createEmployee: (provinceId: string, payload: CreateEmployeeInput) =>
		api
			.post<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployees(provinceId), payload)
			.then(unwrap),
	getEmployee: (provinceId: string, employeeId: string) =>
		api
			.get<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId))
			.then(unwrap),
	updateEmployee: (provinceId: string, employeeId: string, payload: UpdateEmployeeInput) =>
		api
			.put<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId), payload)
			.then(unwrap),
	deleteEmployee: (provinceId: string, employeeId: string) =>
		api
			.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId))
			.then(unwrap),
	exportProvinceEmployees: async (provinceId: string) => {
		const response = await api.get(`/provinces/${provinceId}/employees/export-excel`, {
			responseType: 'blob'
		});
		return response.data;
	},
	clearAllPerformances: () =>
		api
			.delete<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(API_ENDPOINTS.CLEAR_ALL_PERFORMANCES)
			.then(unwrap)
};

export const globalApi = {
	exportAllEmployees: async () => {
		const response = await api.get('/employees/export-all', {
			responseType: 'blob'
		});
		return response.data;
	},
	getDashboardStats: () =>
		api
			.get<ApiResponse<any>>(API_ENDPOINTS.ADMIN_DASHBOARD_STATS)
			.then(unwrap)
};

export default api;

