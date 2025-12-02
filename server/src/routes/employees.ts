import { Router, Request, Response, NextFunction } from "express";
import { Employee } from "../models/Employee";
import { auth, requireAnyRole, canAccessProvince, AuthenticatedUser } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { validateAndResolveProvinceId } from "../utils/provinceValidation";

const router = Router();

type EmployeeParams = { id: string };
type ProvinceScopedBody = Record<string, unknown> & { provinceId?: string };
type EmployeeDocument = NonNullable<Awaited<ReturnType<typeof Employee.findById>>>;

const ensureUser = (req: Request): AuthenticatedUser => {
	if (!req.user) {
		throw new HttpError(401, "User context missing");
	}
	return req.user;
};

// Helper function to fetch employee and check province access
// Throws HttpError if employee not found or access denied
const getEmployeeOrThrow = async (req: Request<EmployeeParams>): Promise<EmployeeDocument> => {
	const user = ensureUser(req);
	const employee = await Employee.findById(req.params.id).populate('provinceId');
	if (!employee) {
		throw new HttpError(404, "Employee not found");
	}

	const employeeProvinceId = employee.provinceId?._id?.toString?.();
	if (!employeeProvinceId) {
		throw new HttpError(400, "Employee has invalid or missing province reference");
	}

	if (!canAccessProvince(user, employeeProvinceId)) {
		throw new HttpError(403, "Cannot access employee from another province");
	}

	return employee;
};

// Global admin only: see all employees
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const employees = await Employee.find().populate('provinceId');
		res.json(employees);
	} catch (err: unknown) {
		next(err);
	}
});

// Province admin only: see their province employees
router.get("/my-province", auth(USER_ROLE.PROVINCE_ADMIN), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const employees = await Employee.find({ provinceId: user.provinceId }).populate('provinceId');
		res.json(employees);
	} catch (err: unknown) {
		next(err);
	}
});

// Get single employee - Global admin can view any employee, province admin can view their province employees
router.get("/:id", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		const employee = await getEmployeeOrThrow(req);
		res.json(employee);
	} catch (err: unknown) {
		next(err);
	}
});

// Create employee - Global admin can create for any province, province admin for their own (server-enforced)
router.post("/", requireAnyRole, async (req: Request<Record<string, never>, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		const requestedProvinceId = typeof req.body.provinceId === "string" ? req.body.provinceId : undefined;
		
		// Validate and resolve provinceId (handles province admin restrictions)
		const provinceId = await validateAndResolveProvinceId(user, requestedProvinceId);

		const employee = new Employee({
			...req.body,
			provinceId
		});
		await employee.save();
		res.status(201).json(employee);
	} catch (err: unknown) {
		next(err);
	}
});

// Update employee - Global admin can update any employee, province admin can update their own province employees
router.put("/:id", requireAnyRole, async (req: Request<EmployeeParams, any, ProvinceScopedBody>, res: Response, next: NextFunction) => {
	try {
		const user = ensureUser(req);
		await getEmployeeOrThrow(req);

		// If provinceId is being updated, validate it
		if (req.body.provinceId !== undefined || user.role === USER_ROLE.PROVINCE_ADMIN) {
			const requestedProvinceId = typeof req.body.provinceId === "string" ? req.body.provinceId : undefined;
			const validatedProvinceId = await validateAndResolveProvinceId(user, requestedProvinceId);
			req.body.provinceId = validatedProvinceId;
		}

		const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('provinceId');
		
		if (!updated) {
			throw new HttpError(404, "Employee not found");
		}
		
		res.json(updated);
	} catch (err: unknown) {
		next(err);
	}
});

// Delete employee - Global admin can delete any employee, province admin can delete their own province employees
router.delete("/:id", requireAnyRole, async (req: Request<EmployeeParams>, res: Response, next: NextFunction) => {
	try {
		ensureUser(req);
		await getEmployeeOrThrow(req);

		const deleted = await Employee.findByIdAndDelete(req.params.id);
		if (!deleted) {
			throw new HttpError(404, "Employee not found");
		}
		res.json({ message: "Employee deleted" });
	} catch (err: unknown) {
		next(err);
	}
});

export default router;
