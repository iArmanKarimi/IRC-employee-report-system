import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LoginIcon from "@mui/icons-material/Login";
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
				setError(res.error || "ورود ناموفق بود");
				return;
			}
			navigateAfterLogin(res.data);
		} catch (err) {
			setError("اطلاعات ورود نامعتبر است");
		} finally {
			setLoading(false);
		}
	};

	const navigateAfterLogin = (data: LoginResponse) => {
		if (data.role === "globalAdmin") {
			navigate(ROUTES.PROVINCES, { replace: true });
			return;
		}
		if (data.role === "provinceAdmin" && data.provinceId) {
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
		<Box
			sx={{
				backgroundImage: "url(/login-bg.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				minHeight: "100vh",
				width: "100vw",
				marginLeft: "calc(-50vw + 50%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				py: 4,
			}}
		>
			<Card sx={{ width: "100%", maxWidth: 400 }}>
				<CardContent sx={{ p: 3 }}>
					<Typography
						variant="h4"
						component="h1"
						gutterBottom
						align="center"
						sx={{ mb: 1 }}
					>
						ورود
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						align="center"
						sx={{ mb: 3 }}
					>
						سیستم مدیریت کارکنان جمعیت هلال احمر ایران
					</Typography>

					<form onSubmit={handleSubmit}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
							<TextField
								label="نام کاربری"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								fullWidth
								autoFocus
							/>
							<TextField
								label="رمز عبور"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								fullWidth
							/>
							<Button
								type="submit"
								variant="contained"
								size="large"
								fullWidth
								disabled={loading}
								startIcon={<LoginIcon />}
								sx={{ mt: 2 }}
							>
								{loading ? "در حال ورود..." : "ورود"}
							</Button>
							{error && (
								<Alert severity="error" sx={{ mt: 1 }}>
									{error}
								</Alert>
							)}
						</Box>
					</form>
				</CardContent>
			</Card>
		</Box>
	);
}
