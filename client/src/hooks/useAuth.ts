import { useEffect, useState } from "react";
import api from "../api/api";
import { API_ENDPOINTS } from "../const/endpoints";

/**
 * Custom hook to check if the current user has global admin access
 * 
 * Attempts to access the /provinces endpoint to determine admin privileges.
 * This is used to control access to global administration features.
 * 
 * @returns Object containing:
 * - isGlobalAdmin: boolean - Whether the user has global admin access
 * - loading: boolean - Whether the access check is in progress
 * 
 * @example
 * const { isGlobalAdmin, loading } = useIsGlobalAdmin();
 * if (loading) return <LoadingView />;
 * if (!isGlobalAdmin) return <Navigate to="/login" />;
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
