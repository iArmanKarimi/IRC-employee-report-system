import { Router } from "express";
import { Employee } from "../models/Employee";
import { auth } from "../middleware/auth";

const router = Router();
const EmployeeModel = Employee;

// Global admin: can see all employees
router.get("/", auth("globalAdmin"), async (_, res) => {
    const employees = await EmployeeModel.find().populate('province');
    res.json(employees);
});

// Province admin: can see only their province employees
router.get("/mine", auth("provinceAdmin"), async (req: any, res) => {
    const employees = await EmployeeModel.find({ province: req.user.provinceId }).populate('province');
    res.json(employees);
});

// Create employee (global or province admin)
router.post("/", auth(), async (req, res) => {
    const employee = new EmployeeModel(req.body);
    await employee.save();
    res.json(employee);
});

export default router;
