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
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { useEmployees } from "../hooks/useEmployees";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { formatEmployeeName } from "../utils/formatters";

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [page, setPage] = useState(1);
	const limit = 20;
	const { employees, pagination, loading, error, refetch } = useEmployees(
		provinceId,
		page,
		limit
	);

	// Extract province name from first employee if available
	const provinceName =
		employees.length > 0
			? typeof employees[0].provinceId === "object" &&
			  employees[0].provinceId?.name
				? employees[0].provinceId.name
				: employees[0].workPlace?.provinceName
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
				backTo={ROUTES.PROVINCES}
				backLabel="Back to Provinces"
			/>
			<Container sx={{ mt: 4 }}>
				<Breadcrumbs provinceName={provinceName || undefined} />

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
									<TableCell>Name</TableCell>

									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{employees.map((emp) => (
									<TableRow
										key={emp._id}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell component="th" scope="row">
											{formatEmployeeName(emp)}
										</TableCell>

										<TableCell align="right">
											<Button
												component={Link}
												to={ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
													":provinceId",
													provinceId ?? ""
												).replace(":employeeId", emp._id)}
												variant="outlined"
												size="small"
												startIcon={<VisibilityIcon />}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{pagination && pagination.pages > 1 && (
					<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
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
