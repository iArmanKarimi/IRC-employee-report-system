import { useEffect, useState } from "react";
import {
	dashboardApi,
	type DashboardOverview,
	type DashboardAnalytics,
	type PerformanceSummary,
	type ProvinceOverview,
	type RecentActivityItem,
} from "../api/api";

type UseDashboardOverviewResult = {
	data: DashboardOverview | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function useDashboardOverview(): UseDashboardOverviewResult {
	const [data, setData] = useState<DashboardOverview | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dashboardApi.getOverview();
			setData(response.data ?? null);
		} catch (err) {
			console.error("Error fetching dashboard overview:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard overview";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { data, loading, error, refetch: fetchData };
}

type UseDashboardAnalyticsResult = {
	data: DashboardAnalytics | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function useDashboardAnalytics(): UseDashboardAnalyticsResult {
	const [data, setData] = useState<DashboardAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dashboardApi.getAnalytics();
			setData(response.data ?? null);
		} catch (err) {
			console.error("Error fetching dashboard analytics:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard analytics";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { data, loading, error, refetch: fetchData };
}

type UsePerformanceSummaryResult = {
	data: PerformanceSummary | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function usePerformanceSummary(): UsePerformanceSummaryResult {
	const [data, setData] = useState<PerformanceSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dashboardApi.getPerformanceSummary();
			setData(response.data ?? null);
		} catch (err) {
			console.error("Error fetching performance summary:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load performance summary";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { data, loading, error, refetch: fetchData };
}

type UseProvincesOverviewResult = {
	data: ProvinceOverview[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function useProvincesOverview(): UseProvincesOverviewResult {
	const [data, setData] = useState<ProvinceOverview[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dashboardApi.getProvincesOverview();
			setData(response.data ?? []);
		} catch (err) {
			console.error("Error fetching provinces overview:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load provinces overview";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return { data, loading, error, refetch: fetchData };
}

type UseRecentActivityResult = {
	data: RecentActivityItem[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function useRecentActivity(limit: number = 20): UseRecentActivityResult {
	const [data, setData] = useState<RecentActivityItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dashboardApi.getRecentActivity(limit);
			setData(response.data ?? []);
		} catch (err) {
			console.error("Error fetching recent activity:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to load recent activity";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [limit]);

	return { data, loading, error, refetch: fetchData };
}
