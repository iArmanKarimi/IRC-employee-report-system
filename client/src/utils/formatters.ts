import type { Employee } from "../api/api";

type BasicName = { firstName?: string; lastName?: string; fullName?: string };

/**
 * Format an employee's name for display
 * 
 * Priority order:
 * 1. fullName field if present
 * 2. firstName + lastName combination
 * 3. Employee ID as fallback
 * 
 * @param emp - Employee object
 * @returns Formatted name string
 */
export function formatEmployeeName(emp: Employee): string {
	const info = emp.basicInfo as BasicName | undefined;
	const full = info?.fullName?.trim();
	if (full) return full;

	// Combine first and last name if available
	const first = info?.firstName?.trim();
	const last = info?.lastName?.trim();
	const nameParts = [first, last].filter(Boolean);
	if (nameParts.length) return nameParts.join(" ");

	// Fallback to ID if no name is available
	return emp._id;
}

/**
 * Translate employment status from English to Persian
 * 
 * Maps the following statuses:
 * - "active" → "فعال"
 * - "inactive" → "غیرفعال"
 * - "on_leave" → "در مرخصی"
 * 
 * @param status - Employee status in English
 * @returns Translated status in Persian, or original value if not found
 */
export function translateStatus(status: string | undefined): string {
	if (!status) return "-";

	const statusMap: Record<string, string> = {
		"active": "فعال",
		"inactive": "غیرفعال",
		"on_leave": "در مرخصی"
	};

	return statusMap[status] || status;
}
