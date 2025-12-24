import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { useEmployees } from "../hooks/useEmployees";
import { useIsGlobalAdmin } from "../hooks/useAuth";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { formatEmployeeName } from "../utils/formatters";
import type { IEmployee } from "../types/models";

function PerformanceSnippet(title: string, value: string | number | boolean) {
	return (
		<Paper
			elevation={1}
			sx={{ display: "flex", alignItems: "center", p: 0.5, m: 0.5 }}
		>
			<Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
				{title}
			</Typography>
			<Chip label={value} size="small" color="primary" />
		</Paper>
	);
}

function EmployeeRow({
	employee,
	provinceId,
}: {
	employee: IEmployee;
	provinceId: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							setOpen(!open);
						}}
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell component="th" scope="row">
					{formatEmployeeName(employee)}
				</TableCell>
				<TableCell>{employee.basicInfo?.nationalID || "-"}</TableCell>
				<TableCell>
					{employee.performance ? (
						<Chip
							label={employee.performance.status
								?.replace("_", " ")
								.toUpperCase()}
							color={
								employee.performance.status === "active"
									? "success"
									: employee.performance.status === "inactive"
									? "error"
									: "warning"
							}
							size="small"
							variant="outlined"
						/>
					) : (
						"-"
					)}
				</TableCell>
				<TableCell align="right">
					<Button
						component={Link}
						to={ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
							":provinceId",
							provinceId
						).replace(":employeeId", employee._id)}
						variant="outlined"
						size="small"
						startIcon={<VisibilityIcon />}
						onClick={(e) => e.stopPropagation()}
					>
						View
					</Button>
				</TableCell>
			</TableRow>
			<TableRow
				sx={{
					"& > *": { backgroundColor: (theme) => theme.palette.action.hover },
				}}
			>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 2 }}>
							<Typography variant="h6" gutterBottom component="div">
								Performance Details
							</Typography>
							{employee.performance ? (
								<Stack
									direction="row"
									useFlexGap
									flexWrap="wrap"
									alignItems="center"
									mt={1}
								>
									{PerformanceSnippet(
										"Daily Performance",
										employee.performance.dailyPerformance
									)}
									{PerformanceSnippet(
										"Shift Count",
										employee.performance.shiftCountPerLocation
									)}
									{PerformanceSnippet(
										"Shift Duration",
										employee.performance.shiftDuration
									)}
									{PerformanceSnippet(
										"Overtime",
										employee.performance.overtime
									)}
									{PerformanceSnippet(
										"Daily Leave",
										employee.performance.dailyLeave
									)}
									{PerformanceSnippet(
										"Sick Leave",
										employee.performance.sickLeave
									)}
									{PerformanceSnippet("Absence", employee.performance.absence)}
									{PerformanceSnippet(
										"Travel Assignment",
										employee.performance.travelAssignment
									)}
								</Stack>
							) : (
								<>No performance has been recorded.</>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [page, setPage] = useState(1);
	const limit = 20;
	const { isGlobalAdmin } = useIsGlobalAdmin();
	const { employees, pagination, loading, error, refetch } = useEmployees(
		provinceId,
		page,
		limit
	);

	// Extract province name from first employee if available
	const provinceName =
		employees.length > 0 &&
		typeof employees[0].provinceId === "object" &&
		employees[0].provinceId?.name
			? employees[0].provinceId.name
			: null;

	if (loading) {
		return <LoadingView title="Province Employees" />;
	}

	if (error) {
		return (
			<ErrorView title="Province Employees" message={error} onRetry={refetch} />
		);
	}

	return (
		<>
			<NavBar
				title="Province Employees"
				backTo={isGlobalAdmin ? ROUTES.PROVINCES : undefined}
				backLabel="Back to Provinces"
			/>
			<Container sx={{ mt: 4 }}>
				<Breadcrumbs
					provinceName={provinceName || undefined}
					showProvincesLink={isGlobalAdmin}
				/>

				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					mb={3}
					gap={2}
				>
					<Box>
						<Typography variant="h4" component="h1" gutterBottom>
							Employees
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{provinceName || "Loading province..."}
						</Typography>
					</Box>
					<Stack direction="row" gap={2} alignItems="center">
						{pagination && (
							<Chip label={`${pagination.total} total`} color="primary" />
						)}
						<Button
							component={Link}
							to={ROUTES.PROVINCE_EMPLOYEE_NEW.replace(
								":provinceId",
								provinceId || ""
							)}
							variant="contained"
							color="secondary"
							startIcon={<AddIcon />}
						>
							New Employee
						</Button>
					</Stack>
				</Stack>

				{employees.length === 0 ? (
					<EmptyState message="No employees found." />
				) : (
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell />
									<TableCell>Full Name</TableCell>
									<TableCell>National ID</TableCell>
									<TableCell>Status</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{employees.map((emp) => (
									<EmployeeRow
										key={emp._id}
										employee={emp}
										provinceId={provinceId || ""}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{pagination && pagination.pages > 1 && (
					<Stack alignItems="center" mt={3} mb={4}>
						<Pagination
							count={pagination.pages}
							page={page}
							onChange={(_, value) => setPage(value)}
							color="primary"
							showFirstButton
							showLastButton
						/>
					</Stack>
				)}
			</Container>
		</>
	);
}
