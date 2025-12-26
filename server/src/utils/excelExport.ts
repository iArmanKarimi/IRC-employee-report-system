import ExcelJS from "exceljs";
import { Response } from "express";

// Type for the flattened Excel row
export type ExcelEmployeeRow = Record<string, string | number | boolean | undefined>;

/**
 * Map a single employee document to a flattened Excel row.
 * Intentionally excludes internal identifiers like `_id`.
 */
export const mapEmployeeToExcelRow = (emp: any): ExcelEmployeeRow => {
	// Return a clean object with ONLY the fields we explicitly define
	return {
		// Basic Info
		"First Name": emp.basicInfo?.firstName || "-",
		"Last Name": emp.basicInfo?.lastName || "-",
		"National ID": emp.basicInfo?.nationalID || "-",
		"Gender": emp.basicInfo?.male ? "Male" : "Female",
		"Married": emp.basicInfo?.married ? "Yes" : "No",
		"Children Count": emp.basicInfo?.childrenCount ?? "-",

		// Work Place
		"Branch": emp.workPlace?.branch || "-",
		"Rank": emp.workPlace?.rank || "-",
		"Licensed Workplace": emp.workPlace?.licensedWorkplace || "-",

		// Additional Specifications
		"Educational Degree": emp.additionalSpecifications?.educationalDegree || "-",
		"Date of Birth": (emp.additionalSpecifications?.dateOfBirth),
		"Contact Number": emp.additionalSpecifications?.contactNumber || "-",
		"Job Start Date": (emp.additionalSpecifications?.jobStartDate),
		"Job End Date": emp.additionalSpecifications?.jobEndDate
			? (emp.additionalSpecifications.jobEndDate)
			: "-",

		// Performance
		"Daily Performance": emp.performance?.dailyPerformance ?? "-",
		"Shift Count Per Location": emp.performance?.shiftCountPerLocation ?? "-",
		"Shift Duration": emp.performance?.shiftDuration
			? `${emp.performance.shiftDuration} hours`
			: "-",
		"Overtime": emp.performance?.overtime ?? "-",
		"Daily Leave": emp.performance?.dailyLeave ?? "-",
		"Sick Leave": emp.performance?.sickLeave ?? "-",
		"Absence": emp.performance?.absence ?? "-",
		"Truck Driver": emp.performance?.truckDriver ? "Yes" : "No",
		"Travel Assignment": emp.performance?.travelAssignment ?? "-",
		"Status": emp.performance?.status?.toUpperCase() ?? "-",
		"Notes": emp.performance?.notes || "-",
	};
};

/**
 * Prepares a workbook with a single Employees sheet from an array of employees.
 */
export const prepareEmployeesExcel = async (employees: any[]): Promise<ExcelJS.Workbook> => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Employees");

	// Map each employee through our explicit mapping function
	const completeData: ExcelEmployeeRow[] = employees.map(mapEmployeeToExcelRow);

	if (completeData.length === 0) {
		// Add headers even if no data
		worksheet.columns = [];
		return workbook;
	}

	// Add headers from the first employee's keys
	const headers = Object.keys(completeData[0]);
	worksheet.columns = headers.map((header) => ({
		header,
		key: header,
		width: 18,
	}));

	// Add data rows
	completeData.forEach((row) => {
		worksheet.addRow(row);
	});

	// Style header row
	worksheet.getRow(1).font = { bold: true };
	worksheet.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFD3D3D3" },
	};

	return workbook;
};

/**
 * Sends an Excel file as a download response
 */
export const sendExcelFile = async (res: Response, workbook: ExcelJS.Workbook, baseFilename: string): Promise<void> => {
	const fileName = `${baseFilename}_${new Date().toISOString().split("T")[0]}.xlsx`;
	res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

	await workbook.xlsx.write(res);
};

