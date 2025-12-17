import { Router, Request, Response, NextFunction } from "express";
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

const ensureUser = (req: Request): AuthenticatedUser => {
	if (!req.user) {
		throw new HttpError(401, "User context missing");
	}
	return req.user;
};

// Helper function to validate user can access the province and fetch employee
// Throws HttpError if employee not found or access denied
const getEmployeeInProvinceOrThrow = async (
	req: Request<EmployeeParams>,
	provinceId: string
): Promise<EmployeeDocument> => {
	const user = ensureUser(req);

	// Check if user can access this province
	if (!canAccessProvince(user, provinceId)) {
		throw new HttpError(403, "Cannot access employees from another province");
	}

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

// GET /provinces/:provinceId/employees - List employees of a province with pagination
router.get("/", requireAnyRole, async (req: Request<{ provinceId: string }>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const { provinceId } = req.params;

		// Debug logging
		logger.debug("Employee list access check", {
			userRole: user.role,
			userProvinceId: user.provinceId,
			requestedProvinceId: provinceId,
			match: user.provinceId === provinceId
		});

		// Check if user can access this province
		if (!canAccessProvince(user, provinceId)) {
			throw new HttpError(403, "Cannot access employees from another province");
		}

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

// POST /provinces/:provinceId/employees - Create employee in a province
router.post("/", requireAnyRole, async (req: Request<{ provinceId: string }, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const { provinceId } = req.params;

		// Check if user can access this province
		if (!canAccessProvince(user, provinceId)) {
			throw new HttpError(403, "Cannot create employee in another province");
		}

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
router.get("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
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
router.put("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
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
router.delete("/:employeeId", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
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
