import { useEffect, useState } from "react";
import { provinceApi, type Employee } from "../api/api";

type UseEmployeeResult = {
	employee: Employee | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

/**
 * Hook to fetch and manage a single employee's data
 * @param provinceId - The province ID
 * @param employeeId - The employee ID
 * @returns Employee data, loading state, error, and refetch function
 */
export function useEmployee(
	provinceId: string | undefined,
	employeeId: string | undefined
): UseEmployeeResult {
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchEmployee = async () => {
		if (!provinceId || !employeeId) {
			setError("Missing identifiers");
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const res = await provinceApi.getEmployee(provinceId, employeeId);
			if (!res.success || !res.data) {
				setError(res.error || "Employee not found");
				setEmployee(null);
				return;
			}
			setEmployee(res.data);
		} catch (err) {
			console.error("Error fetching employee:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load employee";
			setError(errorMessage);
			setEmployee(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEmployee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provinceId, employeeId]);

	return { employee, loading, error, refetch: fetchEmployee };
}
