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
	const [searchField, setSearchField] = useState("all");
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

	const searchFieldOptions = [
		{ value: "all", label: "All fields" },
		{ value: "name", label: "Name" },
		{ value: "nationalId", label: "National ID" },
		{ value: "contactNumber", label: "Contact number" },
		{ value: "branch", label: "Branch" },
		{ value: "rank", label: "Rank" },
		{ value: "province", label: "Province" },
	];

	const matchesSearchField = (
		employee: IEmployee,
		term: string,
		field: string
	) => {
		if (!term) return true;
		const normalized = term.toLowerCase();

		const fieldValue = (value?: string | null) =>
			value ? value.toString().toLowerCase() : "";

		switch (field) {
			case "name":
				return formatEmployeeName(employee).toLowerCase().includes(normalized);
			case "nationalId":
				return fieldValue(employee.basicInfo?.nationalID).includes(normalized);
			case "contactNumber":
				return fieldValue(
					employee.additionalSpecifications?.contactNumber
				).includes(normalized);
			case "branch":
				return fieldValue(employee.workPlace?.branch).includes(normalized);
			case "rank":
				return fieldValue(employee.workPlace?.rank).includes(normalized);
			case "province": {
				const provinceLabel =
					typeof employee.provinceId === "object"
						? employee.provinceId?.name
						: employee.provinceId;
				return fieldValue(provinceLabel).includes(normalized);
			}
			default: {
				const searchable = [
					formatEmployeeName(employee),
					employee.basicInfo?.nationalID,
					employee.additionalSpecifications?.contactNumber,
					employee.workPlace?.branch,
					employee.workPlace?.rank,
					typeof employee.provinceId === "object"
						? employee.provinceId?.name
						: employee.provinceId,
				]
					.filter(Boolean)
					.map((v) => v!.toString().toLowerCase());
				return searchable.some((value) => value.includes(normalized));
			}
		}
	};

	// Filter employees based on search, status, and performance filters
	const filteredEmployees = employees.filter((employee) => {
		const matchesSearch = matchesSearchField(
			employee,
			searchTerm.trim(),
			searchField
		);

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

	// Employee stats
	const activeCount = employees.filter(
		(e) => e.performance?.status === "active"
	).length;
	const inactiveCount = employees.filter(
		(e) => e.performance?.status === "inactive"
	).length;
	const onLeaveCount = employees.filter(
		(e) => e.performance?.status === "on_leave"
	).length;
	const truckDriverCount = employees.filter(
		(e) => e.performance?.truckDriver
	).length;

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
				title={`${provinceName} Employees`}
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
					<Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
						{pagination && (
							<>
								<Chip label={`${pagination.total} total`} color="primary" />
								<Chip
									label={`Active: ${activeCount}`}
									color="success"
									variant="outlined"
								/>
								<Chip
									label={`Inactive: ${inactiveCount}`}
									color="error"
									variant="outlined"
								/>
								<Chip
									label={`On Leave: ${onLeaveCount}`}
									color="warning"
									variant="outlined"
								/>
								<Chip
									label={`Truck Drivers: ${truckDriverCount}`}
									color="info"
									variant="outlined"
								/>
							</>
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

				<SearchFilterBar
					onSearchChange={setSearchTerm}
					onSearchFieldChange={setSearchField}
					onFilterChange={setStatusFilter}
					onPerformanceFilterChange={(metric, value) => {
						setPerformanceMetric(metric);
						setPerformanceValue(value);
					}}
					searchValue={searchTerm}
					searchFieldValue={searchField}
					searchFieldOptions={searchFieldOptions}
					filterValue={statusFilter}
					performanceMetric={performanceMetric}
					performanceValue={performanceValue ?? undefined}
				/>

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
