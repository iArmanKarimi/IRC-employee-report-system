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

// GET /employees - List all employees for Global Admin Dashboard (Global Admin only)
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
		const skip = (page - 1) * limit;

		const employees = await Employee.find()
			.populate("provinceId", "_id name")
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await Employee.countDocuments();

		res.json({
			success: true,
			data: employees,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});

		logger.info("Global admin retrieved all employees", { page, limit, count: employees.length });
	} catch (err: unknown) {
		next(err);
	}
});

// GET /employees/dashboard/metrics - Get aggregated metrics for dashboard (Global Admin only)
router.get("/dashboard/metrics", auth(USER_ROLE.GLOBAL_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const employees = await Employee.find()
			.populate("provinceId", "_id name")
			.lean();

		if (employees.length === 0) {
			return res.json({
				success: true,
				data: {
					totalEmployees: 0,
					activeEmployees: 0,
					inactiveEmployees: 0,
					onLeaveEmployees: 0,
					driverCount: 0,
					averagePerformance: 0,
					turnoverRate: 0,
					provinceBreakdown: [],
					branchBreakdown: [],
					rankBreakdown: [],
					workplaceBreakdown: [],
				},
			});
		}

		// Calculate basic metrics
		const totalEmployees = employees.length;
		const activeEmployees = employees.filter((e) => e.performance?.status === "active").length;
		const inactiveEmployees = employees.filter((e) => e.performance?.status === "inactive").length;
		const onLeaveEmployees = employees.filter((e) => e.performance?.status === "on_leave").length;
		const driverCount = employees.filter((e) => e.performance?.truckDriver).length;

		// Calculate average performance
		const performanceScores = employees
			.filter((e) => e.performance?.dailyPerformance !== undefined)
			.map((e) => e.performance?.dailyPerformance ?? 0);
		const averagePerformance = performanceScores.length > 0
			? performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length
			: 0;

		// Calculate turnover rate (employees with job end date in current month)
		const currentMonth = new Date();
		const currentYear = currentMonth.getFullYear();
		const currentMonthNum = currentMonth.getMonth();
		const turnoverEmployees = employees.filter((e) => {
			const jobEndDate = e.additionalSpecifications?.jobEndDate
				? new Date(e.additionalSpecifications.jobEndDate)
				: null;
			if (!jobEndDate) return false;
			return jobEndDate.getFullYear() === currentYear && jobEndDate.getMonth() === currentMonthNum;
		}).length;
		const turnoverRate = totalEmployees > 0 ? (turnoverEmployees / totalEmployees) * 100 : 0;

		// Province breakdown
		const provinceMap = new Map<string, { name: string; count: number }>();
		employees.forEach((emp) => {
			const provinceId = typeof emp.provinceId === "string" ? emp.provinceId : emp.provinceId?._id;
			const provinceName = typeof emp.provinceId === "object" && emp.provinceId?.name ? emp.provinceId.name : "Unknown";
			if (provinceId) {
				if (!provinceMap.has(provinceId)) {
					provinceMap.set(provinceId, { name: provinceName, count: 0 });
				}
				const pData = provinceMap.get(provinceId)!;
				pData.count += 1;
			}
		});

		const provinceBreakdown = Array.from(provinceMap.values()).sort((a, b) => b.count - a.count);

		// Branch breakdown
		const branchMap = new Map<string, number>();
		employees.forEach((emp) => {
			const branch = emp.workPlace?.branch;
			if (branch) {
				branchMap.set(branch, (branchMap.get(branch) ?? 0) + 1);
			}
		});
		const branchBreakdown = Array.from(branchMap.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		// Rank breakdown
		const rankMap = new Map<string, number>();
		employees.forEach((emp) => {
			const rank = emp.workPlace?.rank;
			if (rank) {
				rankMap.set(rank, (rankMap.get(rank) ?? 0) + 1);
			}
		});
		const rankBreakdown = Array.from(rankMap.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		// Workplace breakdown
		const workplaceMap = new Map<string, number>();
		employees.forEach((emp) => {
			const workplace = emp.workPlace?.licensedWorkplace;
			if (workplace) {
				workplaceMap.set(workplace, (workplaceMap.get(workplace) ?? 0) + 1);
			}
		});
		const workplaceBreakdown = Array.from(workplaceMap.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		res.json({
			success: true,
			data: {
				totalEmployees,
				activeEmployees,
				inactiveEmployees,
				onLeaveEmployees,
				driverCount,
				averagePerformance: parseFloat(averagePerformance.toFixed(2)),
				turnoverRate: parseFloat(turnoverRate.toFixed(2)),
				provinceBreakdown,
				branchBreakdown,
				rankBreakdown,
				workplaceBreakdown,
			},
		});

		logger.info("Dashboard metrics calculated", {
			totalEmployees,
			activeEmployees,
			driverCount,
		});
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
