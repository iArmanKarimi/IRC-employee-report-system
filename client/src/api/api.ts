import axios from "axios";
import { API_ENDPOINTS } from "../const/endpoints";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
	withCredentials: true
});

export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
};

export type LoginRequest = {
	username: string;
	password: string;
};

export type LoginResponse = {
	role: "GLOBAL_ADMIN" | "PROVINCE_ADMIN";
	provinceId?: string | null;
};

// Province and employee shapes are intentionally loose until the UI solidifies
export type Province = {
	_id: string;
	name?: string;
	admin?: unknown;
};

export type Employee = {
	_id: string;
	provinceId: string;
	[name: string]: unknown;
};

const unwrap = <T>(response: { data: T }): T => response.data;

export const authApi = {
	login: (payload: LoginRequest) =>
		api.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.LOGIN, payload).then(unwrap),
	logout: () => api.post<ApiResponse<null>>(API_ENDPOINTS.LOGOUT).then(unwrap)
};

export const provinceApi = {
	list: () => api.get<Province[]>(API_ENDPOINTS.PROVINCES).then(unwrap),
	get: (provinceId: string) => api.get<Province>(API_ENDPOINTS.provinceById(provinceId)).then(unwrap),
	listEmployees: (provinceId: string) =>
		api.get<Employee[]>(API_ENDPOINTS.provinceEmployees(provinceId)).then(unwrap),
	createEmployee: (provinceId: string, payload: Partial<Employee>) =>
		api.post<Employee>(API_ENDPOINTS.provinceEmployees(provinceId), payload).then(unwrap),
	getEmployee: (provinceId: string, employeeId: string) =>
		api.get<Employee>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId)).then(unwrap),
	updateEmployee: (provinceId: string, employeeId: string, payload: Partial<Employee>) =>
		api.put<Employee>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId), payload).then(unwrap),
	deleteEmployee: (provinceId: string, employeeId: string) =>
		api.delete<{ message: string }>(API_ENDPOINTS.provinceEmployeeById(provinceId, employeeId)).then(unwrap)
};

export default api;

