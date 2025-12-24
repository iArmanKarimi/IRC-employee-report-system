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
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
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
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 2 }}>
							<Typography variant="h6" gutterBottom component="div">
								Performance Details
							</Typography>
							{employee.performance ? (
								<></>
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

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Box>
						<Typography variant="h4" component="h1" gutterBottom>
							Employees
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{provinceName || "Loading province..."}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
					</Box>
				</Box>

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
					<Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "center" }}>
						<Pagination
							count={pagination.pages}
							page={page}
							onChange={(_, value) => setPage(value)}
							color="primary"
							showFirstButton
							showLastButton
						/>
					</Box>
				)}
			</Container>
		</>
	);
}
