import { useEffect, useState } from "react";
import {
	provinceApi,
	type Employee,
	type Pagination,
	type PaginatedResponse,
} from "../api/api";

type UseEmployeesResult = {
	employees: Employee[];
	pagination: Pagination | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

/**
 * Hook to fetch and manage a list of employees for a province
 * @param provinceId - The province ID
 * @param page - Current page number
 * @param limit - Items per page
 * @param filters - Optional filters for search and filtering
 * @returns Employees data, pagination info, loading state, error, and refetch function
 */
export function useEmployees(
	provinceId: string | undefined,
	page: number = 1,
	limit: number = 20,
	filters?: {
		search?: string;
		gender?: string;
		maritalStatus?: string;
		status?: string;
		truckDriver?: boolean;
	}
): UseEmployeesResult {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchEmployees = async () => {
		if (!provinceId) {
			setError("شناسه استان موجود نیست");
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const response: PaginatedResponse<Employee> =
				await provinceApi.listEmployees(provinceId, page, limit, filters);
			setEmployees(response.data ?? []);
			setPagination(response.pagination);
		} catch (err) {
			console.error("Error fetching employees:", err);
			const errorMessage = err instanceof Error ? err.message : "خطا در بارگذاری کارمندان";
			setError(errorMessage);
			setEmployees([]);
			setPagination(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEmployees();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provinceId, page, limit, JSON.stringify(filters)]);

	return { employees, pagination, loading, error, refetch: fetchEmployees };
}
