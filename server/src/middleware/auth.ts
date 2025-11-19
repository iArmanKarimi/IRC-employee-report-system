// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function auth(requiredRole?: "globalAdmin" | "provinceAdmin") {
	return (req: Request, res: Response, next: NextFunction) => {
		const header = req.headers.authorization;
		if (!header) return res.status(401).json({ error: "No token" });

		const token = header.split(" ")[1];
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
			req.user = payload;

			if (requiredRole && payload.role !== requiredRole) {
				return res.status(403).json({ error: "Forbidden" });
			}

			next();
		} catch {
			res.status(401).json({ error: "Invalid token" });
		}
	};
}
