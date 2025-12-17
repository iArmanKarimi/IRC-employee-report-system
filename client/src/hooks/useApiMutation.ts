import { useState } from "react";

type MutationState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
};

type MutationResult<TData, TVariables extends any[]> = MutationState<TData> & {
	mutate: (...args: TVariables) => Promise<TData | null>;
	reset: () => void;
};

/**
 * Generic hook for API mutations (create, update, delete operations)
 * Handles loading state, error handling, and provides a mutate function
 * 
 * @param mutationFn - The async function to execute
 * @returns Mutation state and mutate function
 * 
 * @example
 * const deleteEmployee = useApiMutation(
 *   (provinceId: string, employeeId: string) => 
 *     provinceApi.deleteEmployee(provinceId, employeeId)
 * );
 * 
 * await deleteEmployee.mutate(provinceId, employeeId);
 */
export function useApiMutation<TData, TVariables extends any[]>(
	mutationFn: (...args: TVariables) => Promise<{ success: boolean; data?: TData; error?: string }>
): MutationResult<TData, TVariables> {
	const [data, setData] = useState<TData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutate = async (...args: TVariables): Promise<TData | null> => {
		setLoading(true);
		setError(null);
		setData(null);

		try {
			const result = await mutationFn(...args);

			if (!result.success) {
				setError(result.error || "Operation failed");
				return null;
			}

			const resultData = result.data ?? null;
			setData(resultData);
			return resultData;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Operation failed";
			setError(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setData(null);
		setError(null);
		setLoading(false);
	};

	return { data, loading, error, mutate, reset };
}
