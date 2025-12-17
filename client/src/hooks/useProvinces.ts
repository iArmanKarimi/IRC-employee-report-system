import { useEffect, useState } from "react";
import { provinceApi, type Province } from "../api/api";

type UseProvincesResult = {
	provinces: Province[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

/**
 * Hook to fetch and manage the list of all provinces
 * @returns Provinces data, loading state, error, and refetch function
 */
export function useProvinces(): UseProvincesResult {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProvinces = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await provinceApi.list();
			setProvinces(response.data ?? []);
		} catch (err) {
			setError("Failed to load provinces");
			setProvinces([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProvinces();
	}, []);

	return { provinces, loading, error, refetch: fetchProvinces };
}
