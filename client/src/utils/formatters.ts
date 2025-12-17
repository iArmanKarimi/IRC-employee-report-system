import type { Employee } from "../api/api";

type BasicName = { firstName?: string; lastName?: string; fullName?: string };

/**
 * Format an employee's name for display
 * Prioritizes fullName, falls back to firstName + lastName, then ID
 */
export function formatEmployeeName(emp: Employee): string {
	const info = emp.basicInfo as BasicName | undefined;
	const full = info?.fullName?.trim();
	if (full) return full;

	const first = info?.firstName?.trim();
	const last = info?.lastName?.trim();
	const nameParts = [first, last].filter(Boolean);
	if (nameParts.length) return nameParts.join(" ");

	return emp._id;
}
