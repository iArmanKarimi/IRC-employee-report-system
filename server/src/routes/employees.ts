import { Router, Request, Response } from "express";
import { Employee } from "../models/Employee";
import { auth, requireAnyRole, canAccessProvince, AuthenticatedUser } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import mongoose from "mongoose";
import { Province } from "../models/Province";


const router = Router();

type EmployeeParams = { id: string };
type ProvinceScopedBody = Record<string, unknown> & { provinceId?: string };
type EmployeeDocument = NonNullable<Awaited<ReturnType<typeof Employee.findById>>>;

// Custom error class for HTTP errors
class HttpError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'HttpError';
    }
}

const ensureUser = (req: Request): AuthenticatedUser => {
    if (!req.user) {
        throw new HttpError(401, "User context missing");
    }
    return req.user as AuthenticatedUser;
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
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (_req: Request, res: Response) => {
    try {
        const employees = await Employee.find().populate('provinceId');
        res.json(employees);
    } catch (err: unknown) {
        console.error("Error fetching employees (global admin route):", err);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Province admin only: see their province employees
router.get("/my-province", auth(USER_ROLE.PROVINCE_ADMIN), async (req: Request, res: Response) => {
    try {
        const user = ensureUser(req);
        const employees = await Employee.find({ provinceId: user.provinceId }).populate('provinceId');
        res.json(employees);
    } catch (err: unknown) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Error fetching employees (province admin route):", err);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Get single employee - Global admin can view any employee, province admin can view their province employees
router.get("/:id", requireAnyRole, async (req: Request<EmployeeParams>, res: Response) => {
    try {
        const employee = await getEmployeeOrThrow(req);
        res.json(employee);
    } catch (err: unknown) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Error fetching employee by ID:", err);
        res.status(500).json({ error: "Failed to fetch employee" });
    }
});

// Create employee - Global admin can create for any province, province admin for their own
router.post("/", requireAnyRole, async (req: Request<Record<string, never>, any, ProvinceScopedBody>, res: Response) => {
    try {
        const user = ensureUser(req);
        const { provinceId } = req.body;
        // Province admins can only create in their own province
        if (!canAccessProvince(user, provinceId)) {
            return res.status(403).json({ error: "Can only create employees in your own province" });
        }

        // Validate provinceId
        if (!provinceId || !mongoose.Types.ObjectId.isValid(provinceId)) {
            return res.status(400).json({ error: "Invalid provinceId format" });
        }

        const province = await Province.findById(provinceId);
        if (!province) {
            return res.status(400).json({ error: "Province not found" });
        }

        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (err: unknown) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Error creating employee:", err);
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Update employee - Global admin can update any employee, province admin can update their own province employees
router.put("/:id", requireAnyRole, async (req: Request<EmployeeParams, any, ProvinceScopedBody>, res: Response) => {
    try {
        const user = ensureUser(req);
        await getEmployeeOrThrow(req);

        if (req.body.provinceId !== undefined) {
            const nextProvinceId = req.body.provinceId;
            if (typeof nextProvinceId !== "string") {
                return res.status(400).json({ error: "Invalid provinceId format" });
            }

            if (!mongoose.Types.ObjectId.isValid(nextProvinceId)) {
                return res.status(400).json({ error: "Invalid provinceId format" });
            }

            if (!canAccessProvince(user, nextProvinceId)) {
                return res.status(403).json({ error: "Cannot assign employee to another province" });
            }

            const nextProvince = await Province.findById(nextProvinceId);
            if (!nextProvince) {
                return res.status(400).json({ error: "Province not found" });
            }
        }

        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('provinceId');
        res.json(updated);
    } catch (err: unknown) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Error updating employee:", err);
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Delete employee - Global admin can delete any employee, province admin can delete their own province employees
router.delete("/:id", requireAnyRole, async (req: Request<EmployeeParams>, res: Response) => {
    try {
        ensureUser(req);
        await getEmployeeOrThrow(req);

        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee deleted" });
    } catch (err: unknown) {
        if (err instanceof HttpError) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error("Error deleting employee:", err);
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

export default router;
