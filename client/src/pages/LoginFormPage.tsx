import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginResponse } from "../api/api";
import { ROUTES } from "../const/endpoints";

export default function LoginFormPage() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await authApi.login({ username, password });
			if (!res.success || !res.data) {
				setError(res.error || "Login failed");
				return;
			}
			navigateAfterLogin(res.data);
		} catch (err) {
			setError("Invalid credentials");
		} finally {
			setLoading(false);
		}
	};

	const navigateAfterLogin = (data: LoginResponse) => {
		if (data.role === "GLOBAL_ADMIN") {
			navigate(ROUTES.PROVINCES, { replace: true });
			return;
		}
		if (data.role === "PROVINCE_ADMIN" && data.provinceId) {
			navigate(
				ROUTES.PROVINCE_EMPLOYEES.replace(
					":provinceId",
					String(data.provinceId)
				),
				{ replace: true }
			);
			return;
		}
		// Fallback to root
		navigate(ROUTES.ROOT, { replace: true });
	};

	return (
		<div style={{ padding: "1rem", maxWidth: 360, margin: "0 auto" }}>
			<h1>Login</h1>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
			>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>Username</span>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</label>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>Password</span>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
				{error && <div style={{ color: "red" }}>{error}</div>}
			</form>
		</div>
	);
}
