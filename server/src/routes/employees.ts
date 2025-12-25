import { Router, Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import * as XLSX from "xlsx";
import { Employee } from "../models/Employee";
import { requireAnyRole, canAccessProvince, AuthenticatedUser } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { validateAndResolveProvinceId } from "../utils/provinceValidation";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { getPaginationParams, buildPaginationLinks } from "../utils/pagination";
import { logger } from "../middleware/logger";

const router = Router({ mergeParams: true });

type EmployeeParams = { provinceId: string; employeeId: string };
type ProvinceScopedBody = Record<string, unknown> & { provinceId?: string };
type EmployeeDocument = NonNullable<Awaited<ReturnType<typeof Employee.findById>>>;

// Middleware to validate provinceId parameter
const validateProvinceId = (req: Request, res: Response, next: NextFunction) => {
	const { provinceId } = req.params;
	if (!isValidObjectId(provinceId)) {
		return res.status(400).json({ success: false, error: "Invalid province ID format" });
	}
	next();
};

// Middleware to validate employeeId parameter
const validateEmployeeId = (req: Request, res: Response, next: NextFunction) => {
	const { employeeId } = req.params;
	if (!isValidObjectId(employeeId)) {
		return res.status(400).json({ success: false, error: "Invalid employee ID format" });
	}
	next();
};

// Apply provinceId validation to all routes
router.use(validateProvinceId);

const ensureUser = (req: Request): AuthenticatedUser => {
	if (!req.user) {
		throw new HttpError(401, "User context missing");
	}
	return req.user;
};

/**
 * Validates that the authenticated user can access the specified province.
 * Throws HttpError(403) if access is denied.
 */
const validateProvinceAccess = (req: Request, provinceId: string): AuthenticatedUser => {
	const user = ensureUser(req);
	if (!canAccessProvince(user, provinceId)) {
		throw new HttpError(403, "Cannot access employees from another province");
	}
	return user;
};

/**
 * Fetches an employee by ID, validates it belongs to the specified province,
 * and ensures user has access. Throws HttpError if validation fails.
 */
const getEmployeeInProvinceOrThrow = async (
	req: Request<EmployeeParams>,
	provinceId: string
): Promise<EmployeeDocument> => {
	validateProvinceAccess(req, provinceId);

	const employee = await Employee.findById(req.params.employeeId).populate('provinceId');
	if (!employee) {
		throw new HttpError(404, "Employee not found");
	}

	const employeeProvinceId = employee.provinceId?._id?.toString?.();
	if (employeeProvinceId !== provinceId) {
		throw new HttpError(400, "Employee does not belong to the specified province");
	}

	return employee;
};

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

// Type for the flattened Excel row
type ExcelEmployeeRow = Record<string, string | number | boolean | undefined>;

/**
 * Map a single employee document to a flattened Excel row.
 * Intentionally excludes internal identifiers like `_id`.
 */
const mapEmployeeToExcelRow = (emp: any): ExcelEmployeeRow => ({
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

	// Meta
	Province: typeof emp.provinceId === "string" ? emp.provinceId : emp.provinceId?.name || "-",
	"Created At": formatDate(emp.createdAt),
	"Updated At": formatDate(emp.updatedAt),
});

// Helper function to prepare Excel export data
const prepareEmployeesExcel = (employees: any[]) => {
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
const sendExcelFile = (res: Response, workbook: XLSX.WorkBook, baseFilename: string): void => {
	const fileName = `${baseFilename}_${new Date().toISOString().split("T")[0]}.xlsx`;
	res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

	const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
	res.end(buffer);
};

// GET /provinces/:provinceId/employees - List employees of a province with pagination
router.get("/", requireAnyRole, async (req: Request<{ provinceId: string }>, res: Response, next: NextFunction) => {
	try {
		const { provinceId } = req.params;
		validateProvinceAccess(req, provinceId);

		// Get pagination parameters from query
		const { page, limit, skip } = getPaginationParams(req, 20, 100);

		// Get total count for pagination
		const total = await Employee.countDocuments({ provinceId });

		// Get paginated results
		const employees = await Employee.find({ provinceId })
			.populate('provinceId')
			.skip(skip)
			.limit(limit)
			.lean();

		const pages = Math.ceil(total / limit);
		const links = buildPaginationLinks(`/provinces/${provinceId}/employees`, page, limit, pages);

		logger.debug("Employees listed", { provinceId, page, limit, count: employees.length, total });

		return res.status(200).json({
			success: true,
			data: employees,
			pagination: {
				total,
				page,
				limit,
				pages
			},
			_links: links
		});
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId/employees/export-excel - Export all employees to Excel
router.get("/export-excel", requireAnyRole, async (req: Request<{ provinceId: string }>, res: Response, next: NextFunction) => {
	try {
		const { provinceId } = req.params;
		validateProvinceAccess(req, provinceId);

		// Fetch all employees for the province
		const employees = await Employee.find({ provinceId }).lean();

		if (employees.length === 0) {
			throw new HttpError(404, "No employees found for this province");
		}

		// Generate and send Excel workbook
		const workbook = prepareEmployeesExcel(employees);
		logger.info("Employees exported to Excel", { provinceId, count: employees.length });
		sendExcelFile(res, workbook, "employees");
	} catch (err: unknown) {
		next(err);
	}
});

// POST /provinces/:provinceId/employees - Create employee in a province
router.post("/", requireAnyRole, async (req: Request<{ provinceId: string }, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const { provinceId } = req.params;
		validateProvinceAccess(req, provinceId);

		const employee = new Employee({
			...req.body,
			provinceId
		});
		await employee.save();
		logger.info("Employee created", { provinceId, employeeId: employee._id });
		sendSuccess(res, employee, 201, "Employee created successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// GET /provinces/:provinceId/employees/:employeeId - Get single employee
router.get("/:employeeId", validateEmployeeId, requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		const { provinceId, employeeId } = req.params;
		const employee = await getEmployeeInProvinceOrThrow(req, provinceId);
		logger.debug("Employee retrieved", { provinceId, employeeId });
		sendSuccess(res, employee, 200, "Employee retrieved successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// PUT /provinces/:provinceId/employees/:employeeId - Update employee
router.put("/:employeeId", validateEmployeeId, requireAnyRole, async (req: Request<EmployeeParams, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const { provinceId, employeeId } = req.params;

		// Verify employee exists and belongs to province
		await getEmployeeInProvinceOrThrow(req, provinceId);

		// Prevent provinceId from being changed via PUT
		const updateData = { ...req.body };
		if (updateData.provinceId && updateData.provinceId !== provinceId) {
			throw new HttpError(400, "Cannot move employee to a different province");
		}
		delete updateData.provinceId;

		const updated = await Employee.findByIdAndUpdate(employeeId, updateData, { new: true }).populate('provinceId');

		if (!updated) {
			throw new HttpError(404, "Employee not found");
		}

		logger.info("Employee updated", { provinceId, employeeId });
		sendSuccess(res, updated, 200, "Employee updated successfully");
	} catch (err: unknown) {
		next(err);
	}
});

// DELETE /provinces/:provinceId/employees/:employeeId - Delete employee
router.delete("/:employeeId", validateEmployeeId, requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		const { provinceId, employeeId } = req.params;

		// Verify employee exists and belongs to province
		await getEmployeeInProvinceOrThrow(req, provinceId);

		const deleted = await Employee.findByIdAndDelete(employeeId);
		if (!deleted) {
			throw new HttpError(404, "Employee not found");
		}
		logger.info("Employee deleted", { provinceId, employeeId });
		sendSuccess(res, { message: "Employee deleted" }, 200, "Employee deleted successfully");
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
