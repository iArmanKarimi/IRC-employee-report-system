import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const router = Router();
const UserModel = User;

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username }).populate('provinceAdmin');
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user._id, role: user.role, provinceId: user.provinceAdmin?._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, provinceId: user.provinceAdmin?._id });
});

export default router;
