import type { IEmployee } from "../types/models";
import { formatEmployeeName } from "./formatters";

/**
 * Filter employees by search field
 * Applies client-side filtering when a specific search field is selected
 * (server-side search only works for "all" fields)
 * 
 * @param employee - Employee to check
 * @param searchField - Field to search in
 * @param searchTerm - Search term
 * @returns Whether employee matches the search criteria
 */
export function matchesSearchField(
	employee: IEmployee,
	searchField: string,
	searchTerm: string
): boolean {
	if (!searchTerm || searchField === "all") return true;

	const term = searchTerm.toLowerCase();
	const fieldValue = (value?: string | null) =>
		value ? value.toString().toLowerCase() : "";

	switch (searchField) {
		case "name":
			return formatEmployeeName(employee).toLowerCase().includes(term);
		case "nationalId":
			return fieldValue(employee.basicInfo?.nationalID).includes(term);
		case "contactNumber":
			return fieldValue(
				employee.additionalSpecifications?.contactNumber
			).includes(term);
		case "branch":
			return fieldValue(employee.workPlace?.branch).includes(term);
		case "rank":
			return fieldValue(employee.workPlace?.rank).includes(term);
		case "licensedWorkplace":
			return fieldValue(employee.workPlace?.licensedWorkplace).includes(term);
		case "educationalDegree":
			return fieldValue(
				employee.additionalSpecifications?.educationalDegree
			).includes(term);
		case "province": {
			const provinceLabel =
				typeof employee.provinceId === "object"
					? employee.provinceId?.name
					: employee.provinceId;
			return fieldValue(provinceLabel).includes(term);
		}
		default:
			return true;
	}
}

/**
 * Filter employees by performance metric
 * Applies client-side filtering based on performance values
 * 
 * @param employee - Employee to check
 * @param performanceMetric - Performance field to check
 * @param performanceValue - Value to compare against
 * @returns Whether employee matches the performance criteria
 */
export function matchesPerformanceFilter(
	employee: IEmployee,
	performanceMetric: string,
	performanceValue: number | null
): boolean {
	if (!performanceMetric || performanceValue === null) return true;
	if (!employee.performance) return false;

	const perf = employee.performance;
	const value = performanceValue;

	switch (performanceMetric) {
		case "dailyPerformance":
			return perf.dailyPerformance >= value;
		case "shiftDuration":
			return perf.shiftDuration >= value;
		case "overtime":
			return perf.overtime >= value;
		case "dailyLeave":
			return perf.dailyLeave >= value;
		case "sickLeave":
			return perf.sickLeave >= value;
		case "absence":
			return perf.absence <= value;
		case "travelAssignment":
			return perf.travelAssignment >= value;
		case "shiftCountPerLocation":
			return perf.shiftCountPerLocation >= value;
		default:
			return true;
	}
}

/**
 * Apply all client-side filters to an employee list
 * 
 * @param employees - List of employees to filter
 * @param searchField - Search field selection
 * @param searchTerm - Search term
 * @param performanceMetric - Performance metric to filter by
 * @param performanceValue - Performance value threshold
 * @returns Filtered employee list
 */
export function applyClientFilters(
	employees: IEmployee[],
	searchField: string,
	searchTerm: string,
	performanceMetric: string,
	performanceValue: number | null
): IEmployee[] {
	return employees.filter((employee) => {
		// Apply search field filter
		if (!matchesSearchField(employee, searchField, searchTerm)) {
			return false;
		}

		// Apply performance filter
		if (!matchesPerformanceFilter(employee, performanceMetric, performanceValue)) {
			return false;
		}

		return true;
	});
}
