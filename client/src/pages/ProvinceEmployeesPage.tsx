import { useEffect, useState } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	provinceApi,
	type Employee,
	type PaginatedResponse,
	type Pagination as PaginationType,
} from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";

type BasicName = { firstName?: string; lastName?: string; fullName?: string };

type EmployeesState = {
	data: Employee[];
	pagination: PaginationType | null;
	_links?: Record<string, string>;
};

const formatEmployeeName = (emp: Employee): string => {
	const info = emp.basicInfo as BasicName | undefined;
	const full = info?.fullName?.trim();
	if (full) return full;

	const first = info?.firstName?.trim();
	const last = info?.lastName?.trim();
	const nameParts = [first, last].filter(Boolean);
	if (nameParts.length) return nameParts.join(" ");

	return emp._id;
};

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [state, setState] = useState<EmployeesState>({
		data: [],
		pagination: null,
	});
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!provinceId) {
			setError("Province ID is missing");
			setLoading(false);
			return;
		}

		const fetchEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
				const response: PaginatedResponse<Employee> =
					await provinceApi.listEmployees(provinceId, page, limit);
				setState({
					data: response.data ?? [],
					pagination: response.pagination,
					_links: response._links,
				});
			} catch (err) {
				setError("Failed to load employees");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployees();
	}, [provinceId, page, limit]);

	if (loading) {
		return (
			<>
				<NavBar title="Province Employees" />
				<Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
					<CircularProgress />
				</Container>
			</>
		);
	}

	if (error) {
		return (
			<>
				<NavBar title="Province Employees" />
				<Container sx={{ mt: 4 }}>
					<Alert severity="error">{error}</Alert>
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="Province Employees" />
			<Container sx={{ mt: 4 }}>
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
							Province {provinceId ?? "N/A"}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
						{state.pagination && (
							<Chip label={`${state.pagination.total} total`} color="primary" />
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

				{state.data.length === 0 ? (
					<Alert severity="info">No employees found.</Alert>
				) : (
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Province ID</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{state.data.map((emp) => (
									<TableRow
										key={emp._id}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell component="th" scope="row">
											{formatEmployeeName(emp)}
										</TableCell>
										<TableCell>{String(emp.provinceId)}</TableCell>
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

				{state.pagination && state.pagination.pages > 1 && (
					<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
						<Pagination
							count={state.pagination.pages}
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
