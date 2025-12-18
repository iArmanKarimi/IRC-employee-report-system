import { useEffect, useState } from "react";
import api from "../api/api";
import { API_ENDPOINTS } from "../const/endpoints";

/**
 * Hook to check if the current user has global admin access
 * Returns true if user can access /provinces endpoint, false otherwise
 */
export function useIsGlobalAdmin() {
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAccess = async () => {
			try {
				await api.get(API_ENDPOINTS.PROVINCES);
				setIsGlobalAdmin(true);
			} catch (err) {
				setIsGlobalAdmin(false);
			} finally {
				setLoading(false);
			}
		};

		checkAccess();
	}, []);

	return { isGlobalAdmin, loading };
}
