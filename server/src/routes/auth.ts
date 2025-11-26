import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { USER_ROLE } from "../types/roles";

const router = Router();

type LoginBody = {
		username: string;
		password: string;
};

router.post("/login", async (req: Request<Record<string, never>, any, LoginBody>, res: Response) => {
		try {
				const { username, password } = req.body;

				if (!username || !password) {
						return res.status(400).json({ error: "Username and password required" });
				}

				const user = await User.findOne({ username }).populate('provinceId');
				if (!user) return res.status(401).json({ error: "Invalid credentials" });

				const valid = await bcrypt.compare(password, user.passwordHash);
				if (!valid) return res.status(401).json({ error: "Invalid credentials" });

				// Set session data
				req.session.userId = user._id.toString();
				req.session.role = user.role;
				req.session.provinceId = user.provinceId?._id.toString();

				res.json({
						message: "Logged in successfully",
						role: user.role,
						provinceId: user.provinceId?._id
				});
		} catch (err: unknown) {
				console.error("Error during login:", err);
				res.status(500).json({ error: "Login failed" });
		}
});

router.post("/logout", (req: Request, res: Response) => {
		req.session.destroy((err: Error | null) => {
				if (err) {
						console.error("Error during logout:", err);
						return res.status(500).json({ error: "Logout failed" });
				}
				res.clearCookie("connect.sid");
				res.json({ message: "Logged out successfully" });
		});
});

export default router;
