import { useState, useEffect } from "react";
import { provinceApi } from "../api/api";
import type { IPerformance } from "../types/models";

/**
 * Custom hook to manage employee performance data and operations
 * 
 * Handles:
 * - Local performance state management
 * - Unsaved changes tracking
 * - Performance field updates
 * - Save operation with error handling
 * - Automatic initialization of default performance for new employees
 * 
 * @param provinceId - Province identifier
 * @param employeeId - Employee identifier
 * @param initialPerformance - Initial performance data from employee
 * @param onRefetch - Callback to refetch employee data after updates
 * @returns Performance state and handlers
 * 
 * @example
 * const {
 *   localPerformance,
 *   hasUnsavedChanges,
 *   saving,
 *   saveError,
 *   handleChange,
 *   handleSave,
 *   setSaveError
 * } = usePerformanceManager(provinceId, employeeId, employee?.performance, refetch);
 */
export function usePerformanceManager(
	provinceId: string | undefined,
	employeeId: string | undefined,
	initialPerformance: IPerformance | undefined,
	onRefetch: () => Promise<void>
) {
	const [localPerformance, setLocalPerformance] = useState<IPerformance | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	// Sync local performance state with employee data
	// Initialize default performance for new employees without performance records
	useEffect(() => {
		if (initialPerformance) {
			setLocalPerformance(initialPerformance);
			setHasUnsavedChanges(false);
		} else {
			// Initialize default performance if employee exists but has no performance data
			setLocalPerformance({
				status: "active",
				dailyPerformance: 0,
				shiftDuration: 8,
				overtime: 0,
				dailyLeave: 0,
				sickLeave: 0,
				absence: 0,
				travelAssignment: 0,
				shiftCountPerLocation: 0,
				notes: "",
			});
			setHasUnsavedChanges(false);
		}
	}, [initialPerformance]);

	/**
	 * Update a single performance field
	 */
	const handleChange = (key: keyof IPerformance, value: any) => {
		if (!localPerformance) return;

		setLocalPerformance((prev) => {
			if (!prev) return prev;
			return { ...prev, [key]: value };
		});
		setHasUnsavedChanges(true);
	};

	/**
	 * Save performance data to server
	 */
	const handleSave = async () => {
		if (!localPerformance || !provinceId || !employeeId) return;

		setSaving(true);
		setSaveError(null);

		try {
			const res = await provinceApi.updateEmployee(provinceId, employeeId, {
				performance: localPerformance,
			});

			if (!res.success || !res.data) {
				setSaveError(
					res.error ||
					"به‌روزرسانی عملکرد با خطا مواجه شد. لطفا دوباره تلاش کنید یا در صورت ادامه مشکل با پشتیبانی تماس بگیرید."
				);
				return;
			}

			await onRefetch();
			setHasUnsavedChanges(false);
		} catch (err) {
			setSaveError(
				"به‌روزرسانی عملکرد با خطا مواجه شد. لطفا دوباره تلاش کنید یا در صورت ادامه مشکل با پشتیبانی تماس بگیرید."
			);
		} finally {
			setSaving(false);
		}
	};

	return {
		localPerformance,
		hasUnsavedChanges,
		saving,
		saveError,
		handleChange,
		handleSave,
		setSaveError,
	};
}
