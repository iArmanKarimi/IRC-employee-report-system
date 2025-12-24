import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	DataGrid,
	type GridColDef,
	type GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { useEmployees } from "../hooks/useEmployees";
import { useIsGlobalAdmin } from "../hooks/useAuth";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { formatEmployeeName } from "../utils/formatters";
import type { IEmployee } from "../types/models";

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [page, setPage] = useState(0);
	const limit = 20;
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [performanceMetric, setPerformanceMetric] = useState("");
	const [performanceValue, setPerformanceValue] = useState<number | null>(null);
	const { isGlobalAdmin } = useIsGlobalAdmin();
	const theme = useTheme();
	const { employees, pagination, loading, error, refetch } = useEmployees(
		provinceId,
		page + 1,
		limit
	);

	// Filter employees based on search, status, and performance filters
	const filteredEmployees = employees.filter((employee) => {
		const matchesSearch =
			searchTerm === "" ||
			formatEmployeeName(employee)
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			employee.basicInfo?.nationalID
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "" || employee.performance?.status === statusFilter;

		let matchesPerformance = true;
		if (
			performanceMetric &&
			performanceValue !== null &&
			employee.performance
		) {
			const perfData = employee.performance as Record<string, any>;
			const metricValue = perfData[performanceMetric];
			if (metricValue !== undefined && metricValue !== null) {
				matchesPerformance = Number(metricValue) === performanceValue;
			} else {
				matchesPerformance = false;
			}
		}

		return matchesSearch && matchesStatus && matchesPerformance;
	});

	// Extract province name from first employee if available
	const provinceName =
		employees.length > 0 &&
		typeof employees[0].provinceId === "object" &&
		employees[0].provinceId?.name
			? employees[0].provinceId.name
			: null;

	// DataGrid columns definition
	const columns: GridColDef[] = [
		{
			field: "fullName",
			headerName: "Full Name",
			flex: 1,
			minWidth: 150,
			align: "center",
			headerAlign: "center",
			renderCell: (params: GridRenderCellParams<IEmployee>) => {
				return formatEmployeeName(params.row);
			},
		},
		{
			field: "nationalID",
			headerName: "National ID",
			flex: 0.8,
			minWidth: 120,
			align: "center",
			headerAlign: "center",
			valueGetter: (_, row: IEmployee) => row.basicInfo?.nationalID || "-",
		},
		{
			field: "status",
			headerName: "Status",
			flex: 0.8,
			minWidth: 120,
			align: "center",
			headerAlign: "center",
			renderCell: (params: GridRenderCellParams<IEmployee>) => {
				const employee = params.row;
				return employee.performance ? (
					<Chip
						label={employee.performance.status?.replace("_", " ").toUpperCase()}
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
				);
			},
		},
		{
			field: "actions",
			headerName: "Actions",
			flex: 0.6,
			minWidth: 100,
			align: "center",
			headerAlign: "center",
			sortable: false,
			renderCell: (params) => {
				const viewUrl = ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
					":provinceId",
					provinceId || ""
				).replace(":employeeId", params.row._id);
				return (
					<Button
						variant="outlined"
						size="small"
						startIcon={<VisibilityIcon fontSize="small" />}
						onClick={() => (window.location.href = viewUrl)}
						sx={{ textTransform: "none", borderRadius: 1, padding: 0.25 }}
					>
						View
					</Button>
				);
			},
		},
	];

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
			<Container
				sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}
			>
				<Breadcrumbs
					provinceName={provinceName || undefined}
					showProvincesLink={isGlobalAdmin}
				/>

				<SearchFilterBar
					onSearchChange={setSearchTerm}
					onFilterChange={setStatusFilter}
					onPerformanceFilterChange={(metric, value) => {
						setPerformanceMetric(metric);
						setPerformanceValue(value);
					}}
					searchValue={searchTerm}
					filterValue={statusFilter}
					performanceMetric={performanceMetric}
					performanceValue={performanceValue ?? undefined}
				/>

				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					gap={2}
					sx={{ mb: 0 }}
				>
					<Stack>
						<Typography variant="h5" component="h1" gutterBottom sx={{ m: 0 }}>
							Employees
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: "block" }}
						>
							{loading ? "Loading province..." : provinceName}
						</Typography>
					</Stack>
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

				{!loading && employees.length === 0 ? (
					<EmptyState message="No employees found." />
				) : filteredEmployees.length === 0 && !loading ? (
					<EmptyState message="No employees match your search or filter criteria." />
				) : (
					<Stack spacing={1.5}>
						<DataGrid
							rows={filteredEmployees}
							columns={columns}
							getRowId={(row) => row._id}
							paginationModel={{ pageSize: limit, page }}
							onPaginationModelChange={(newModel) => setPage(newModel.page)}
							rowCount={filteredEmployees.length}
							pageSizeOptions={[20]}
							loading={loading}
							disableColumnMenu
							disableColumnFilter
							disableColumnResize
							disableDensitySelector
							disableRowSelectionOnClick
							paginationMode="client"
							rowHeight={35}
							getRowClassName={() => "custom-row"}
							getCellClassName={() => "custom-cell"}
							hideFooterPagination
							hideFooter={false}
							sx={{
								borderRadius: 1,
								border: "1px solid",
								borderColor: theme.palette.grey[300],
								"& .custom-row": {
									alignItems: "center",
								},
								"& .custom-cell": {
									display: "flex",
									alignItems: "center",
								},
								"& .custom-row:hover": {
									backgroundColor: theme.palette.action.hover,
								},
								"& .MuiDataGrid-footerContainer": {
									display: "none",
								},
								"& .MuiDataGrid-columnHeaders": {
									borderBottom: "1px solid",
									borderColor: theme.palette.grey[300],
								},
							}}
						/>

						<Stack
							direction="row"
							justifyContent="center"
							alignItems="center"
							sx={{ pt: 1 }}
						>
							<Pagination
								count={Math.ceil(filteredEmployees.length / limit)}
								page={page + 1}
								onChange={(_, value) => setPage(value - 1)}
								color="primary"
								size="medium"
								showFirstButton
								showLastButton
							/>
						</Stack>
					</Stack>
				)}
			</Container>
		</>
	);
}
