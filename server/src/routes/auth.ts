import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const router = Router();
const userRepo = AppDataSource.getRepository(User);

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await userRepo.findOne({ where: { username }, relations: ["province"] });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, role: user.role, provinceId: user.provinceAdmin?.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, provinceId: user.provinceAdmin?.id });
});

export default router;
