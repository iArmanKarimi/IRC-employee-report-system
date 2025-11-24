import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/auth";
import employeeRoutes from './routes/employees';

dotenv.config();

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ircdb'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/auth', authRoutes)
app.use('/employees', employeeRoutes)
// health check
app.get("/health", (_, res) => res.json({ ok: true }));
