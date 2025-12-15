import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import { authApi } from "../api/api";
import { ROUTES } from "../const/endpoints";

type NavBarProps = {
	title?: string;
	showLogout?: boolean;
};

export default function NavBar({
	title = "IRC Staff System",
	showLogout = true,
}: NavBarProps) {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		setLoading(true);
		try {
			await authApi.logout();
			navigate(ROUTES.ROOT, { replace: true });
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
					{title}
				</Typography>
				{showLogout && (
					<Button
						color="error"
						variant="contained"
						onClick={handleLogout}
						disabled={loading}
						startIcon={<LogoutIcon />}
					>
						{loading ? "Logging out..." : "Logout"}
					</Button>
				)}
			</Toolbar>
		</AppBar>
	);
}
