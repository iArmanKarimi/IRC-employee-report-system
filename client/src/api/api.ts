/**
 * API Client Module
 * 
 * Provides centralized HTTP client for all API communications.
 * Uses Axios with automatic credential handling and base URL configuration.
 * All API responses follow a consistent structure with success/error handling.
 */

import axios from "axios";
import { API_ENDPOINTS } from "../const/endpoints";
import type { IEmployee, IProvince, CreateEmployeeInput, UpdateEmployeeInput, UserRoleType } from "../types/models";

/** Axios instance with default configuration */
const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
	withCredentials: true
});

/** Standard API response wrapper */
export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	_links?: Record<string, string>;
};

/** Pagination metadata for list endpoints */
export type Pagination = {
	total: number;
	page: number;
	limit: number;
	pages: number;
};

/** API response for paginated list endpoints */
export type PaginatedResponse<T = unknown> = ApiResponse<T[]> & {
	pagination: Pagination;
};

/** Login request payload */
export type LoginRequest = {
	username: string;
	password: string;
};

/** Login response with user role and optional province assignment */
export type LoginResponse = {
	role: UserRoleType;
	provinceId?: string | null;
};

// Export types from models for external use
export type Province = IProvince;
export type Employee = IEmployee;
export type { UpdateEmployeeInput, CreateEmployeeInput };

/**
 * Helper function to unwrap Axios response data
 * @param response - Axios response object
 * @returns The data property from the response
 */
const unwrap = <T>(response: { data: T }): T => response.data;

/**
 * Authentication API endpoints
 *//**
* Authentication API endpoints
*/
export const authApi = {
	/**
	 * Authenticate user with credentials
	 * @param payload - Username and password
	 * @returns User role and province assignment
	 */
	login: (payload: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.LOGIN, payload).then(unwrap),

	/**
	 * Log out current user and clear session
	 * @returns Success confirmation
	 */
	logout: () => api.post<ApiResponse<null>>(API_ENDPOINTS.LOGOUT).then(unwrap)
};

/**
 * Province and Employee API endpoints
 */
export const provinceApi = {
	/**
	 * Get list of all provinces
	 * @returns Array of province objects
	 */
	list: () => api.get<ApiResponse<Province[]>>(API_ENDPOINTS.PROVINCES).then(unwrap),

	/**
	 * Get a single province by ID
	 * @param provinceId - Province identifier
	 * @returns Province object
	 */
	get: (provinceId: string) => api.get<ApiResponse<Province>>(API_ENDPOINTS.provinceById(provinceId)).then(unwrap),

	/**
	 * List employees for a province with server-side filtering, sorting, and pagination
	 * @param provinceId - Province identifier
	 * @param page - Page number (1-indexed)
	 * @param limit - Number of items per page
	 * @param filters - Optional filters for search, gender, status, etc.
	 * @param filters.search - Search term for name, national ID, etc.
	 * @param filters.gender - Filter by gender ('male' or 'female')
	 * @param filters.maritalStatus - Filter by marital status
	 * @param filters.status - Filter by employment status ('active', 'inactive', 'on_leave')
	 * @param filters.truckDriver - Filter for truck drivers only
	 * @param filters.sortBy - Field to sort by ('fullName', 'nationalID', 'status', 'createdAt')
	 * @param filters.sortOrder - Sort direction ('asc' or 'desc')
	 * @returns Paginated list of employees with metadata
	 */
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
	/**
	 * Create a new employee in a province
	 * @param provinceId - Province identifier
	 * @param payload - Employee data to create
	 * @returns Created employee object
	 */
	createEmployee: (provinceId: string, payload: CreateEmployeeInput) =>
		api
			.post<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployees(provinceId), payload)
			.then(unwrap),
	/**
	 * Get a single employee by ID
	 * @param provinceId - Province identifier
	 * @param employeeId - Employee identifier
	 * @returns Employee object with full details
	 */
	getEmployee: (provinceId: string, employeeId: string) =>
		api
			.get<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId))
			.then(unwrap),
	/**
	 * Update an existing employee
	 * @param provinceId - Province identifier
	 * @param employeeId - Employee identifier
	 * @param payload - Updated employee data (partial update supported)
	 * @returns Updated employee object
	 */
	updateEmployee: (provinceId: string, employeeId: string, payload: UpdateEmployeeInput) =>
		api
			.put<ApiResponse<Employee>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId), payload)
			.then(unwrap),
	/**
	 * Delete an employee
	 * @param provinceId - Province identifier
	 * @param employeeId - Employee identifier
	 * @returns Success message
	 */
	deleteEmployee: (provinceId: string, employeeId: string) =>
		api
			.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId))
			.then(unwrap),
	/**
	 * Export all employees in a province to Excel file
	 * @param provinceId - Province identifier
	 * @returns Excel file blob
	 */
	exportProvinceEmployees: async (provinceId: string) => {
		const response = await api.get(`/provinces/${provinceId}/employees/export-excel`, {
			responseType: 'blob'
		});
		return response.data;
	},
	/**
	 * Clear all performance data for all employees
	 * WARNING: This is a destructive operation
	 * @returns Count of matched and modified documents
	 */
	clearAllPerformances: () =>
		api
			.delete<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(API_ENDPOINTS.CLEAR_ALL_PERFORMANCES)
			.then(unwrap)
};

/**
 * Global admin API endpoints
 */
export const globalApi = {
	/**
	 * Export all employees from all provinces to Excel file
	 * @returns Excel file blob
	 */
	exportAllEmployees: async () => {
		const response = await api.get('/employees/export-all', {
			responseType: 'blob'
		});
		return response.data;
	},
	/**
	 * Get dashboard statistics for global admin view
	 * @returns Dashboard statistics object
	 */
	getDashboardStats: () =>
		api
			.get<ApiResponse<any>>(API_ENDPOINTS.ADMIN_DASHBOARD_STATS)
			.then(unwrap)
};

export default api;

