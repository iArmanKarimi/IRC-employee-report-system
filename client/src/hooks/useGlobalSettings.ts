import { useState, useEffect } from "react";
import api from "../api/api";
import { API_ENDPOINTS } from "../const/endpoints";
import type { IGlobalSettings } from "../types/models";

export function useGlobalSettings() {
	const [settings, setSettings] = useState<IGlobalSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await api.get(API_ENDPOINTS.GLOBAL_SETTINGS);
			setSettings(response.data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch global settings");
		} finally {
			setLoading(false);
		}
	};

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
