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

// Dashboard types
export type DashboardOverview = {
	totalProvinces: number;
	totalEmployees: number;
	totalAdmins: number;
	employeeStatuses: {
		active: number;
		inactive: number;
		onLeave: number;
	};
};

export type EmployeeAnalytics = {
	totalCount: number;
	avgChildrenCount: number;
	maleCount: number;
	femaleCount: number;
	marriedCount: number;
};

export type ProvinceAnalytic = {
	_id: string;
	name: string;
	employeeCount: number;
};

export type PerformanceAnalytic = {
	_id: string;
	count: number;
	avgDailyPerformance: number;
	avgOvertimeHours: number;
	totalTruckDrivers: number;
};

export type DashboardAnalytics = {
	employees: EmployeeAnalytics;
	provinces: ProvinceAnalytic[];
	performance: PerformanceAnalytic[];
};

export type PerformanceStatus = {
	_id: string;
	count: number;
	avgDailyPerformance: number;
	avgDailyLeave: number;
	avgSickLeave: number;
	avgAbsence: number;
	avgOvertime: number;
	totalShifts: number;
	avgShiftDuration: number;
};

export type RankDistribution = {
	_id: string;
	count: number;
	avgDailyPerformance: number;
};

export type BranchDistribution = {
	_id: string;
	count: number;
	avgPerformance: number;
};

export type PerformanceSummary = {
	byStatus: PerformanceStatus[];
	byRank: RankDistribution[];
	byBranch: BranchDistribution[];
};

export type ProvinceOverview = {
	_id: string;
	name: string;
	employeeCount: number;
	activeEmployeeCount: number;
	avgEmployeePerformance: number;
	admin: {
		_id: string;
		username: string;
	};
};

export type RecentActivityItem = {
	_id: string;
	basicInfo: {
		firstName: string;
		lastName: string;
	};
	createdAt: string;
	updatedAt: string;
	province: {
		_id: string;
		name: string;
	};
};

// Export types from models
export type Province = IProvince;
export type Employee = IEmployee;
export type { UpdateEmployeeInput, CreateEmployeeInput };

export const authApi = {
	login: (payload: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.LOGIN, payload).then(unwrap),
	logout: () => api.post<ApiResponse<null>>(API_ENDPOINTS.LOGOUT).then(unwrap)
};

export const provinceApi = {
	list: () => api.get<ApiResponse<Province[]>>(API_ENDPOINTS.PROVINCES).then(unwrap),
	get: (provinceId: string) => api.get<ApiResponse<Province>>(API_ENDPOINTS.provinceById(provinceId)).then(unwrap),
	listEmployees: (provinceId: string, page?: number, limit?: number) =>
		api
			.get<PaginatedResponse<Employee>>(API_ENDPOINTS.provinceEmployees(provinceId), {
				params: { page, limit }
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
			.then(unwrap)
};

export const dashboardApi = {
	getOverview: () =>
		api.get<ApiResponse<DashboardOverview>>(API_ENDPOINTS.DASHBOARD_OVERVIEW).then(unwrap),
	getAnalytics: () =>
		api.get<ApiResponse<DashboardAnalytics>>(API_ENDPOINTS.DASHBOARD_ANALYTICS).then(unwrap),
	getPerformanceSummary: () =>
		api.get<ApiResponse<PerformanceSummary>>(API_ENDPOINTS.DASHBOARD_PERFORMANCE_SUMMARY).then(unwrap),
	getProvincesOverview: () =>
		api.get<ApiResponse<ProvinceOverview[]>>(API_ENDPOINTS.DASHBOARD_PROVINCES_OVERVIEW).then(unwrap),
	getRecentActivity: (limit: number = 20) =>
		api
			.get<ApiResponse<RecentActivityItem[]>>(API_ENDPOINTS.DASHBOARD_RECENT_ACTIVITY, {
				params: { limit }
			})
			.then(unwrap)
};

const unwrap = <T>(response: { data: T }): T => response.data;

export default api;
