import { Router, Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import { Employee } from "../models/Employee";
import { auth } from "../middleware/auth";
import { checkPerformanceLocked } from "../middleware/performanceLock";
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
	const worksheet = workbook.addWorksheet("کارمندان");

	// Create a single complete sheet with all employee data (no _id, no meta fields)
	const completeData = employees.map((emp) => ({
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
		"تاریخ تولد": formatDate(emp.additionalSpecifications?.dateOfBirth),
		"شماره تماس": emp.additionalSpecifications?.contactNumber || "-",
		"تاریخ شروع کار": formatDate(emp.additionalSpecifications?.jobStartDate),
		"تاریخ پایان کار": emp.additionalSpecifications?.jobEndDate
			? formatDate(emp.additionalSpecifications.jobEndDate)
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

// DELETE /employees/clear-performances - Reset all employee performance data to defaults (Global Admin only)
router.delete("/clear-performances", auth(USER_ROLE.GLOBAL_ADMIN), checkPerformanceLocked, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Reset all employees' performance fields to default values (excluding status)
		const result = await Employee.updateMany(
			{ performance: { $exists: true } },
			{
				$set: {
					"performance.dailyPerformance": 0,
					"performance.shiftCountPerLocation": 0,
					"performance.shiftDuration": 8,
					"performance.overtime": 0,
					"performance.dailyLeave": 0,
					"performance.sickLeave": 0,
					"performance.absence": 0,
					"performance.travelAssignment": 0,
					"performance.notes": ""
				}
			}
		);

		logger.info("All employee performances reset to defaults", {
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount
		});

		res.json({
			success: true,
			data: {
				matchedCount: result.matchedCount,
				modifiedCount: result.modifiedCount
			},
			message: `Successfully reset performance data for ${result.modifiedCount} employee(s)`
		});
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
