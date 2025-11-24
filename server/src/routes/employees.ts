import { Router } from "express";
import { Employee } from "../models/Employee";
import { auth, requireAnyRole, canAccessProvince } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";

const router = Router();

// Global admin only: see all employees
router.get("/", auth(USER_ROLE.GLOBAL_ADMIN), async (_, res) => {
    try {
        const employees = await Employee.find().populate('provinceId');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Province admin only: see their province employees
router.get("/my-province", auth(USER_ROLE.PROVINCE_ADMIN), async (req: any, res) => {
    try {
        const employees = await Employee.find({ provinceId: req.user.provinceId }).populate('provinceId');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Get single employee - Global admin can view any employee, province admin can view their province employees
router.get("/:id", requireAnyRole, async (req: any, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('provinceId');
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only view their own province employees
        if (!canAccessProvince(req.user.role, req.user.provinceId, employee.provinceId._id.toString())) {
            return res.status(403).json({ error: "Cannot view employees from other provinces" });
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employee" });
    }
});

// Create employee - Global admin can create for any province, province admin for their own
router.post("/", requireAnyRole, async (req: any, res) => {
    try {
        // Province admins can only create in their own province
        if (!canAccessProvince(req.user.role, req.user.provinceId, req.body.provinceId)) {
            return res.status(403).json({ error: "Can only create employees in your own province" });
        }

        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Update employee - Global admin can update any employee, province admin can update their own province employees
router.put("/:id", requireAnyRole, async (req: any, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only update their own province employees
        if (!canAccessProvince(req.user.role, req.user.provinceId, employee.provinceId.toString())) {
            return res.status(403).json({ error: "Can only update employees in your own province" });
        }

        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('provinceId');
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: "Invalid employee data" });
    }
});

// Delete employee - Global admin can delete any employee, province admin can delete their own province employees
router.delete("/:id", requireAnyRole, async (req: any, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Province admins can only delete their own province employees
        if (!canAccessProvince(req.user.role, req.user.provinceId, employee.provinceId.toString())) {
            return res.status(403).json({ error: "Can only delete employees in your own province" });
        }

        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

export default router;
