import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { authApi } from "../api/api";
import { ROUTES } from "../const/endpoints";

type NavBarProps = {
	title?: string;
	showLogout?: boolean;
	backTo?: string;
	backLabel?: string;
};

export default function NavBar({
	title = "IRC Staff System",
	showLogout = true,
	backTo,
	backLabel = "Back",
}: NavBarProps) {
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
		<AppBar position="static" color="primary">
			<Toolbar sx={{ minHeight: 64 }}>
				{backTo && (
					<IconButton
						edge="start"
						color="inherit"
						onClick={() => navigate(backTo)}
						sx={{ mr: 2 }}
						aria-label={backLabel}
					>
						<ArrowBackIcon />
					</IconButton>
				)}
				<Typography
					variant={isMobile ? "subtitle1" : "h6"}
					component="h1"
					sx={{
						flexGrow: 1,
						fontWeight: 600,
						letterSpacing: "0.02em",
						color: "white",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{title}
				</Typography>
				{showLogout && (
					<Box>
						{isMobile ? (
							<IconButton
								color="inherit"
								onClick={handleLogout}
								disabled={loading}
								aria-label="Logout"
							>
								<LogoutIcon />
							</IconButton>
						) : (
							<Button
								color="inherit"
								variant="outlined"
								onClick={handleLogout}
								disabled={loading}
								startIcon={<LogoutIcon />}
								sx={{
									borderColor: "rgba(255, 255, 255, 0.3)",
									"&:hover": {
										borderColor: "rgba(255, 255, 255, 0.5)",
										backgroundColor: "rgba(255, 255, 255, 0.1)",
									},
								}}
								aria-label="Logout"
							>
								{loading ? "Logging out..." : "Logout"}
							</Button>
						)}
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
}
