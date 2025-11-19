import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import employeeRoutes from './routes/employees';

dotenv.config();

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use('/auth', authRoutes)
app.use('/employees', employeeRoutes)
// health check
app.get("/health", (_, res) => res.json({ ok: true }));
