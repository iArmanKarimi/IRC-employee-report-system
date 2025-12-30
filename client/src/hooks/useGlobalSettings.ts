import { useState, useEffect } from "react";
import api from "../api/api";
import { API_ENDPOINTS } from "../const/endpoints";
import type { IGlobalSettings } from "../types/models";

/**
 * Custom hook to manage global system settings
 * 
 * Fetches and manages global settings including performance lock status.
 * Provides functionality to toggle the performance lock which prevents
 * users from editing performance data when enabled.
 * 
 * @returns Object containing:
 * - settings: IGlobalSettings | null - Current global settings or null if not loaded
 * - loading: boolean - Whether settings are being fetched
 * - error: string | null - Error message if fetch failed
 * - refetch: () => Promise<void> - Function to manually refetch settings
 * - togglePerformanceLock: () => Promise<IGlobalSettings> - Toggle the performance lock
 * 
 * @example
 * const { settings, loading, togglePerformanceLock } = useGlobalSettings();
 * 
 * const handleToggle = async () => {
 *   try {
 *     await togglePerformanceLock();
 *     toast.success("قفل عملکرد تغییر یافت");
 *   } catch (error) {
 *     toast.error("خطا در تغییر وضعیت قفل");
 *   }
 * };
 */
export function useGlobalSettings() {
	const [settings, setSettings] = useState<IGlobalSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Fetch global settings from the server
	 */
	const fetchSettings = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await api.get(API_ENDPOINTS.GLOBAL_SETTINGS);
			setSettings(response.data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "خطا در بارگذاری تنظیمات عمومی");
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Toggle the performance lock setting
	 * When locked, users cannot edit performance data
	 * @throws Error if the toggle operation fails
	 */
	const togglePerformanceLock = async () => {
		try {
			const response = await api.post(API_ENDPOINTS.TOGGLE_PERFORMANCE_LOCK, {});
			setSettings(response.data.data);
			return response.data.data;
		} catch (err) {
			throw err;
		}
	};

	useEffect(() => {
		fetchSettings();
	}, []);

	return {
		settings,
		loading,
		error,
		refetch: fetchSettings,
		togglePerformanceLock,
	};
}
