import { useNavigate, useLocation } from "react-router-dom";
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
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { authApi } from "../api/api";
import { ROUTES } from "../const/endpoints";
import { useIsGlobalAdmin } from "../hooks/useAuth";

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
	const location = useLocation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const [loading, setLoading] = useState(false);
	const { isGlobalAdmin } = useIsGlobalAdmin();

	const isOnDashboard = location.pathname === ROUTES.ADMIN_DASHBOARD;
	const isOnProvinces = location.pathname === ROUTES.PROVINCES;

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
		<AppBar position="static" color="primary" sx={{ py: 0.25 }}>
			<Toolbar
				sx={{
					minHeight: { xs: 52, sm: 56 },
					px: { xs: 1.5, sm: 2 },
					gap: 1,
				}}
			>
				{backTo && (
					<IconButton
						edge="start"
						color="inherit"
						onClick={() => navigate(backTo)}
						size="small"
						sx={{ mr: 1 }}
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
						ml: backTo ? 0.5 : 0,
					}}
				>
					{title}
				</Typography>
				{isGlobalAdmin && (
					<Box sx={{ ml: 1.5 }}>
						{isOnDashboard ? (
							isMobile ? (
								<IconButton
									color="inherit"
									onClick={() => navigate(ROUTES.PROVINCES)}
									size="small"
									aria-label="Provinces"
									title="Provinces"
								>
									<LocationOnIcon />
								</IconButton>
							) : (
								<Button
									color="inherit"
									variant="outlined"
									onClick={() => navigate(ROUTES.PROVINCES)}
									startIcon={<LocationOnIcon />}
									size="small"
									sx={{
										borderColor: "rgba(255, 255, 255, 0.3)",
										"&:hover": {
											borderColor: "rgba(255, 255, 255, 0.5)",
											backgroundColor: "rgba(255, 255, 255, 0.1)",
										},
									}}
									aria-label="Provinces"
								>
									Provinces
								</Button>
							)
						) : isOnProvinces ? (
							isMobile ? (
								<IconButton
									color="inherit"
									onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
									size="small"
									aria-label="Admin Dashboard"
									title="Admin Dashboard"
								>
									<DashboardIcon />
								</IconButton>
							) : (
								<Button
									color="inherit"
									variant="outlined"
									onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
									startIcon={<DashboardIcon />}
									size="small"
									sx={{
										borderColor: "rgba(255, 255, 255, 0.3)",
										"&:hover": {
											borderColor: "rgba(255, 255, 255, 0.5)",
											backgroundColor: "rgba(255, 255, 255, 0.1)",
										},
									}}
									aria-label="Admin Dashboard"
								>
									Dashboard
								</Button>
							)
						) : null}
					</Box>
				)}
				{showLogout && (
					<Box sx={{ ml: 1.5 }}>
						{isMobile ? (
							<IconButton
								color="inherit"
								onClick={handleLogout}
								disabled={loading}
								size="small"
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
								size="small"
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
