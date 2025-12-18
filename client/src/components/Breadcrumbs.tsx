import { Link, useParams, useLocation } from "react-router-dom";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import { ROUTES } from "../const/endpoints";

type BreadcrumbsProps = {
	provinceName?: string;
	employeeName?: string;
};

export default function Breadcrumbs({
	provinceName,
	employeeName,
}: BreadcrumbsProps) {
	const { provinceId, employeeId } = useParams<{
		provinceId: string;
		employeeId: string;
	}>();
	const location = useLocation();

	const breadcrumbItems = [];

	// Home/Provinces
	if (location.pathname !== ROUTES.PROVINCES) {
		breadcrumbItems.push({
			label: "Provinces",
			icon: <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />,
			path: ROUTES.PROVINCES,
		});
	}

	// Province Employees
	if (provinceId) {
		const isOnEmployeesPage =
			location.pathname ===
			ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId);

		breadcrumbItems.push({
			label: provinceName || "Employees",
			path: isOnEmployeesPage
				? null
				: ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId),
		});
	}

	// New Employee
	if (location.pathname.includes("/new")) {
		breadcrumbItems.push({
			label: "New Employee",
			path: null,
		});
	}

	// Employee Detail
	if (employeeId && employeeName) {
		breadcrumbItems.push({
			label: employeeName,
			path: null,
		});
	}

	if (breadcrumbItems.length === 0) {
		return null;
	}

	return (
		<Box sx={{ mb: 2 }}>
			<MuiBreadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				aria-label="breadcrumb"
				sx={{
					"& .MuiBreadcrumbs-li": {
						display: "flex",
						alignItems: "center",
					},
				}}
			>
				{breadcrumbItems.map((item, index) => {
					const isLast = index === breadcrumbItems.length - 1;

					if (isLast || !item.path) {
						return (
							<Typography
								key={index}
								color="text.primary"
								sx={{
									display: "flex",
									alignItems: "center",
									fontWeight: 500,
								}}
							>
								{item.icon}
								{item.label}
							</Typography>
						);
					}

					return (
						<Link
							key={index}
							to={item.path}
							style={{
								textDecoration: "none",
								color: "inherit",
								display: "flex",
								alignItems: "center",
							}}
						>
							<Typography
								color="text.secondary"
								sx={{
									display: "flex",
									alignItems: "center",
									"&:hover": {
										textDecoration: "underline",
										color: "primary.main",
									},
								}}
							>
								{item.icon}
								{item.label}
							</Typography>
						</Link>
					);
				})}
			</MuiBreadcrumbs>
		</Box>
	);
}
