// src/routes/employees.ts
import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Employee } from "../entities/Employee";
import { auth } from "../middleware/auth";

const router = Router();
const employeeRepo = AppDataSource.getRepository(Employee);

// Global admin: can see all employees
router.get("/", auth("globalAdmin"), async (_, res) => {
    const employees = await employeeRepo.find({ relations: ["province"] });
    res.json(employees);
});

// Province admin: can see only their province employees
router.get("/mine", auth("provinceAdmin"), async (req, res) => {
    const employees = await employeeRepo.find({
        where: { province: { id: req.user.provinceId } },
        relations: ["province"],
    });
    res.json(employees);
});

// Create employee (global or province admin)
router.post("/", auth(), async (req, res) => {
    const employee = employeeRepo.create(req.body);
    await employeeRepo.save(employee);
    res.json(employee);
});

export default router;
