import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { GridSortModel } from "@mui/x-data-grid";

/**
 * Toggle filters for employee list
 */
export type EmployeeToggleFilters = {
	maritalStatus: string;
	gender: string;
	status: string;
	truckDriverOnly: boolean;
};

/**
 * Server-side filters for employee API
 */
export type EmployeeServerFilters = {
	search?: string;
	gender?: string;
	maritalStatus?: string;
	status?: string;
	truckDriver?: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};

/**
 * Custom hook to manage employee list filters, search, sorting, and pagination
 * 
 * Handles:
 * - URL-based pagination with query parameters
 * - Search term and field selection
 * - Toggle filters (gender, marital status, employment status, truck driver)
 * - DataGrid sorting with server-side support
 * - Performance metric filtering (client-side)
 * - Automatic page reset on filter changes
 * 
 * @param limit - Items per page (default: 20)
 * @returns Filter state and handlers
 * 
 * @example
 * const {
 *   page,
 *   searchTerm,
 *   toggleFilters,
 *   serverFilters,
 *   updatePage,
 *   setSearchTerm,
 *   setToggleFilters,
 *   setSortModel
 * } = useEmployeeFilters();
 */
export function useEmployeeFilters(limit: number = 20) {
	const [searchParams, setSearchParams] = useSearchParams();
	const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

	// State
	const [page, setPage] = useState(pageFromUrl - 1);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchField, setSearchField] = useState("all");
	const [performanceMetric, setPerformanceMetric] = useState("");
	const [performanceValue, setPerformanceValue] = useState<number | null>(null);
	const [sortModel, setSortModel] = useState<GridSortModel>([]);
	const [toggleFilters, setToggleFilters] = useState<EmployeeToggleFilters>({
		maritalStatus: "",
		gender: "",
		status: "",
		truckDriverOnly: false,
	});

	/**
	 * Update page number in both state and URL query parameters
	 * Keeps URL in sync with pagination state for shareable links
	 */
	const updatePage = (newPage: number) => {
		setPage(newPage);
		setSearchParams({ page: (newPage + 1).toString() });
	};

	// Sync page state with URL on mount
	useEffect(() => {
		const urlPage = pageFromUrl - 1;
		if (urlPage !== page) {
			setPage(urlPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageFromUrl]);

	// Reset to page 0 when filters or search changes
	useEffect(() => {
		updatePage(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		searchTerm,
		searchField,
		performanceMetric,
		performanceValue,
		toggleFilters.maritalStatus,
		toggleFilters.gender,
		toggleFilters.status,
		toggleFilters.truckDriverOnly,
		sortModel.length > 0 ? JSON.stringify(sortModel[0]) : "",
	]);

	// Build server-side filters from current state
	const currentSort = sortModel[0];
	const sortByFromGrid =
		currentSort?.field === "fullName"
			? "fullName"
			: currentSort?.field === "nationalID"
				? "nationalID"
				: currentSort?.field === "status"
					? "status"
					: undefined;
	const sortOrderFromGrid =
		currentSort?.sort === "asc" || currentSort?.sort === "desc"
			? currentSort.sort
			: undefined;

	const serverFilters: EmployeeServerFilters = {
		search: searchTerm || undefined,
		gender: toggleFilters.gender || undefined,
		maritalStatus: toggleFilters.maritalStatus || undefined,
		status: toggleFilters.status || undefined,
		truckDriver: toggleFilters.truckDriverOnly || undefined,
		sortBy: sortByFromGrid,
		sortOrder: sortOrderFromGrid,
	};

	return {
		// Pagination
		page,
		limit,
		updatePage,

		// Search
		searchTerm,
		setSearchTerm,
		searchField,
		setSearchField,

		// Performance filtering (client-side)
		performanceMetric,
		setPerformanceMetric,
		performanceValue,
		setPerformanceValue,

		// Sorting
		sortModel,
		setSortModel,

		// Toggle filters
		toggleFilters,
		setToggleFilters,

		// Computed
		serverFilters,
	};
}
