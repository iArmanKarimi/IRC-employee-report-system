import { Router, Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import { Employee } from "../models/Employee";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { logger } from "../middleware/logger";

const router = Router();

// Helper function to format dates consistently
const formatDate = (date: Date | string | undefined): string => {
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

// Helper function to prepare Excel export data
const prepareEmployeesExcel = async (employees: any[]) => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Employees");

	// Create a single complete sheet with all employee data (no _id, no meta fields)
	const completeData = employees.map((emp) => ({
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
	}));

	if (completeData.length === 0) {
		// Return empty workbook if no data
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

// GET /employees/export-all - Export all employees to Excel (Global Admin only)
router.get("/export-all", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Fetch all employees
		const employees = await Employee.find().lean();

		if (employees.length === 0) {
			throw new HttpError(404, "No employees found");
		}

		// Generate Excel workbook
		const workbook = await prepareEmployeesExcel(employees);

		// Send as file
		const fileName = `employees_all_${new Date().toISOString().split("T")[0]}.xlsx`;
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

		await workbook.xlsx.write(res);
		logger.info("All employees exported to Excel", { count: employees.length });
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
