import * as XLSX from "xlsx";
import { Response } from "express";

// Type for the flattened Excel row
export type ExcelEmployeeRow = Record<string, string | number | boolean | undefined>;

/**
 * Formats a date as MM/DD/YYYY or returns '-' if invalid.
 */
export const formatDate = (date: Date | string | undefined): string => {
	if (!date) return "-";
	try {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch {
		return "-";
	}
};

/**
 * Map a single employee document to a flattened Excel row.
 * Intentionally excludes internal identifiers like `_id`.
 */
export const mapEmployeeToExcelRow = (emp: any): ExcelEmployeeRow => ({
	// Basic Info
	"First Name": emp.basicInfo?.firstName || "-",
	"Last Name": emp.basicInfo?.lastName || "-",
	"National ID": emp.basicInfo?.nationalID || "-",
	Gender: emp.basicInfo?.male ? "Male" : "Female",
	Married: emp.basicInfo?.married ? "Yes" : "No",
	"Children Count": emp.basicInfo?.childrenCount ?? "-",

	// Work Place
	Branch: emp.workPlace?.branch || "-",
	Rank: emp.workPlace?.rank || "-",
	"Licensed Workplace": emp.workPlace?.licensedWorkplace || "-",

	// Additional Specifications
	"Educational Degree": emp.additionalSpecifications?.educationalDegree || "-",
	"Date of Birth": formatDate(emp.additionalSpecifications?.dateOfBirth),
	"Contact Number": emp.additionalSpecifications?.contactNumber || "-",
	"Job Start Date": formatDate(emp.additionalSpecifications?.jobStartDate),
	"Job End Date": emp.additionalSpecifications?.jobEndDate
		? formatDate(emp.additionalSpecifications.jobEndDate)
		: "-",

	// Performance
	"Daily Performance": emp.performance?.dailyPerformance ?? "-",
	"Shift Count Per Location": emp.performance?.shiftCountPerLocation ?? "-",
	"Shift Duration": emp.performance?.shiftDuration
		? `${emp.performance.shiftDuration} hours`
		: "-",
	Overtime: emp.performance?.overtime ?? "-",
	"Daily Leave": emp.performance?.dailyLeave ?? "-",
	"Sick Leave": emp.performance?.sickLeave ?? "-",
	Absence: emp.performance?.absence ?? "-",
	"Truck Driver": emp.performance?.truckDriver ? "Yes" : "No",
	"Travel Assignment": emp.performance?.travelAssignment ?? "-",
	Status: emp.performance?.status?.toUpperCase() ?? "-",
	Notes: emp.performance?.notes || "-",
});

/**
 * Prepares a workbook with a single Employees sheet from an array of employees.
 */
export const prepareEmployeesExcel = (employees: any[]): XLSX.WorkBook => {
	const completeData: ExcelEmployeeRow[] = employees.map(mapEmployeeToExcelRow);

	const workbook = XLSX.utils.book_new();
	const completeSheet = XLSX.utils.json_to_sheet(completeData);

	// Set reasonable column widths based on number of columns
	const colCount = Object.keys(completeData[0] || {}).length;
	completeSheet["!cols"] = new Array(colCount).fill(0).map(() => ({ wch: 18 }));

	XLSX.utils.book_append_sheet(workbook, completeSheet, "Employees");
	return workbook;
};

/**
 * Sends an Excel file as a download response
 */
export const sendExcelFile = (res: Response, workbook: XLSX.WorkBook, baseFilename: string): void => {
	const fileName = `${baseFilename}_${new Date().toISOString().split("T")[0]}.xlsx`;
	res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

	const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
	res.end(buffer);
};
