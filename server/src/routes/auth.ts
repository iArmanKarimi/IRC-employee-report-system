import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";

const router = Router();
const UserModel = User;

router.post("/login", async (req: any, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const user = await UserModel.findOne({ username }).populate('provinceAdmin');
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        // Set session data
        req.session.userId = user._id.toString();
        req.session.role = user.role;
        req.session.provinceId = user.provinceAdmin?._id.toString();

        res.json({
            message: "Logged in successfully",
            role: user.role,
            provinceId: user.provinceAdmin?._id
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

router.post("/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

export default router;
