import ExcelJS from "exceljs";
import { Response } from "express";

// Type for the flattened Excel row
export type ExcelEmployeeRow = Record<string, string | number | boolean | undefined>;

/**
 * Map a single employee document to a flattened Excel row with Persian headers.
 * Intentionally excludes internal identifiers like `_id`.
 */
export const mapEmployeeToExcelRow = (emp: any): ExcelEmployeeRow => {
	// Return a clean object with ONLY the fields we explicitly define (Persian headers)
	return {
		// Basic Info - اطلاعات پایه
		"نام": emp.basicInfo?.firstName || "-",
		"نام خانوادگی": emp.basicInfo?.lastName || "-",
		"کد ملی": emp.basicInfo?.nationalID || "-",
		"جنسیت": emp.basicInfo?.male ? "مرد" : "زن",
		"متأهل": emp.basicInfo?.married ? "بله" : "خیر",
		"تعداد فرزندان": emp.basicInfo?.childrenCount ?? "-",

		// Work Place - اطلاعات محل کار
		"شعبه": emp.workPlace?.branch || "-",
		"رتبه / سمت": emp.workPlace?.rank || "-",
		"محل کار مجاز": emp.workPlace?.licensedWorkplace || "-",

		// Additional Specifications - مشخصات اضافی
		"مدرک تحصیلی": emp.additionalSpecifications?.educationalDegree || "-",
		"تاریخ تولد": (emp.additionalSpecifications?.dateOfBirth),
		"شماره تماس": emp.additionalSpecifications?.contactNumber || "-",
		"تاریخ شروع کار": (emp.additionalSpecifications?.jobStartDate),
		"تاریخ پایان کار": emp.additionalSpecifications?.jobEndDate
			? (emp.additionalSpecifications.jobEndDate)
			: "-",
		"راننده کامیون": emp.additionalSpecifications?.truckDriver ? "بله" : "خیر",
		// Performance - عملکرد
		"عملکرد روزانه": emp.performance?.dailyPerformance ?? "-",
		"تعداد شیفت در هر محل": emp.performance?.shiftCountPerLocation ?? "-",
		"مدت شیفت": emp.performance?.shiftDuration
			? `${emp.performance.shiftDuration} ساعت`
			: "-",
		"اضافه‌کاری": emp.performance?.overtime ?? "-",
		"مرخصی روزانه": emp.performance?.dailyLeave ?? "-",
		"مرخصی استعلاجی": emp.performance?.sickLeave ?? "-",
		"غیبت": emp.performance?.absence ?? "-",
		"ماموریت سفر": emp.performance?.travelAssignment ?? "-",
		"وضعیت": emp.performance?.status === "active" ? "فعال" : emp.performance?.status === "inactive" ? "غیرفعال" : emp.performance?.status === "on_leave" ? "در مرخصی" : emp.performance?.status?.toUpperCase() ?? "-",
		"یادداشت‌ها": emp.performance?.notes || "-",
	};
};

/**
 * Prepares a workbook with a single Employees sheet from an array of employees.
 */
export const prepareEmployeesExcel = async (employees: any[]): Promise<ExcelJS.Workbook> => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("کارمندان");

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

