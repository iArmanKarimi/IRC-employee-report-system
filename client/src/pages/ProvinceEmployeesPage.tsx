import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
import { useGlobalSettings } from "../hooks/useGlobalSettings";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { formatEmployeeName } from "../utils/formatters";
import { getTodayPersian } from "../utils/dateUtils";
import type { IEmployee } from "../types/models";
import { provinceApi } from "../api/api";

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [page, setPage] = useState(0);
	const limit = 20;
	const [searchTerm, setSearchTerm] = useState("");
	const [searchField, setSearchField] = useState("all");
	const [performanceMetric, setPerformanceMetric] = useState("");
	const [performanceValue, setPerformanceValue] = useState<number | null>(null);
	const [toggleFilters, setToggleFilters] = useState({
		maritalStatus: "",
		gender: "",
		status: "",
		truckDriverOnly: false,
	});
	const { isGlobalAdmin } = useIsGlobalAdmin();
	const { settings } = useGlobalSettings();
	const theme = useTheme();
	const [exporting, setExporting] = useState(false);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<
		"success" | "error" | "warning"
	>("success");
	const { employees, pagination, loading, error, refetch } = useEmployees(
		provinceId,
		page + 1,
		limit
	);

	// Auto-close toast after 4 seconds
	useEffect(() => {
		if (toastOpen) {
			const timer = setTimeout(() => {
				setToastOpen(false);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [toastOpen]);

	const searchFieldOptions = [
		{ value: "all", label: "همه فیلدها" },
		{ value: "name", label: "نام" },
		{ value: "nationalId", label: "کد ملی" },
		{ value: "contactNumber", label: "شماره تماس" },
		{ value: "branch", label: "شعبه" },
		{ value: "rank", label: "رتبه" },
		{ value: "licensedWorkplace", label: "محل کار مجاز" },
		{ value: "educationalDegree", label: "مدرک تحصیلی" },
		{ value: "province", label: "استان" },
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
			case "licensedWorkplace":
				return fieldValue(employee.workPlace?.licensedWorkplace).includes(
					normalized
				);
			case "educationalDegree":
				return fieldValue(
					employee.additionalSpecifications?.educationalDegree
				).includes(normalized);
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
					employee.workPlace?.licensedWorkplace,
					employee.additionalSpecifications?.educationalDegree,
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

		// Toggle filters
		const matchesMaritalStatus =
			toggleFilters.maritalStatus === "" ||
			(toggleFilters.maritalStatus === "married" &&
				employee.basicInfo?.married) ||
			(toggleFilters.maritalStatus === "single" &&
				!employee.basicInfo?.married);

		const matchesGender =
			toggleFilters.gender === "" ||
			(toggleFilters.gender === "male" && employee.basicInfo?.male) ||
			(toggleFilters.gender === "female" && !employee.basicInfo?.male);

		const matchesToggleStatus =
			toggleFilters.status === "" ||
			employee.performance?.status === toggleFilters.status;

		const matchesTruckDriver =
			!toggleFilters.truckDriverOnly ||
			!!employee.additionalSpecifications?.truckDriver;

		let matchesMetric = true;
		if (performanceMetric && performanceValue !== null) {
			if (performanceMetric === "childrenCount") {
				const childrenCount = employee.basicInfo?.childrenCount;
				if (childrenCount !== undefined && childrenCount !== null) {
					matchesMetric = Number(childrenCount) === performanceValue;
				} else {
					matchesMetric = false;
				}
			} else if (employee.performance) {
				const perfData = employee.performance as unknown as Record<
					string,
					number
				>;
				const metricValue = perfData[performanceMetric];
				if (metricValue !== undefined && metricValue !== null) {
					matchesMetric = Number(metricValue) === performanceValue;
				} else {
					matchesMetric = false;
				}
			} else {
				matchesMetric = false;
			}
		}

		if (!matchesTruckDriver) {
			return false;
		}

		return (
			matchesSearch &&
			matchesMaritalStatus &&
			matchesGender &&
			matchesToggleStatus &&
			matchesMetric
		);
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
		(e) => e.additionalSpecifications?.truckDriver
	).length;

	const handleExportProvinceEmployees = async () => {
		if (!provinceId) return;
		setExporting(true);
		try {
			const blob = await provinceApi.exportProvinceEmployees(provinceId);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`employees_${provinceName || "province"}_${getTodayPersian(
					"compact"
				)}.xlsx`
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setToastMessage(
				`✅ خروجی ${
					pagination?.total || employees.length
				} کارمند با موفقیت انجام شد`
			);
			setToastSeverity("success");
			setToastOpen(true);
		} catch (err) {
			console.error("Export failed:", err);
			setToastMessage("❌ خروجی کارکنان با خطا مواجه شد");
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setExporting(false);
		}
	};

	// DataGrid columns definition
	const columns: GridColDef[] = [
		{
			field: "index",
			headerName: "#",
			width: 70,
			align: "center",
			headerAlign: "center",
			sortable: false,
			renderCell: (params) => {
				const rowIndex = filteredEmployees.findIndex(
					(emp) => emp._id === params.row._id
				);
				return rowIndex + 1 + page * limit;
			},
		},
		{
			field: "fullName",
			headerName: "نام کامل",
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
			headerName: "کد ملی",
			flex: 0.8,
			minWidth: 120,
			align: "center",
			headerAlign: "center",
			valueGetter: (_, row: IEmployee) => row.basicInfo?.nationalID || "-",
		},
		{
			field: "status",
			headerName: "وضعیت",
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
			headerName: "عملیات",
			flex: 0.6,
			minWidth: 100,
			align: "center",
			headerAlign: "center",
			sortable: false,
			renderCell: (params) => {
				const employee = params.row as IEmployee;
				const viewUrl = ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
					":provinceId",
					provinceId || ""
				).replace(":employeeId", params.row._id);
				const perf = employee.performance;
				const performanceSummary = perf ? (
					<Box sx={{ minWidth: 280 }}>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 600,
								mb: 1.5,
								color: "inherit",
							}}
						>
							خلاصه عملکرد
						</Typography>
						<Divider sx={{ mb: 2, opacity: 0.5 }} />
						<Stack spacing={1.5}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									وضعیت
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.status?.replace("_", " ").toUpperCase()}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									عملکرد روزانه
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.dailyPerformance}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									مدت شیفت
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.shiftDuration}h
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									اضافه کاری
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.overtime}h
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									مرخصی روزانه
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.dailyLeave}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									مرخصی استعلاجی
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.sickLeave}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									غیبت
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.absence}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									ماموریت سفر
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.travelAssignment}d
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									gap: 2,
								}}
							>
								<Typography variant="caption" sx={{ flex: 1 }}>
									تعداد شیفت/مکان
								</Typography>
								<Typography variant="caption" sx={{ fontWeight: 600 }}>
									{perf.shiftCountPerLocation}
								</Typography>
							</Box>
						</Stack>
					</Box>
				) : (
					<Typography variant="caption">بدون داده عملکرد</Typography>
				);
				return (
					<Tooltip
						title={performanceSummary}
						arrow
						placement="left"
						slotProps={{
							tooltip: {
								sx: {
									backgroundColor: theme.palette.background.paper,
									color: theme.palette.text.primary,
									boxShadow: theme.shadows[8],
									border: `1px solid ${theme.palette.divider}`,
									borderRadius: `${theme.shape.borderRadius}px`,
									padding: theme.spacing(2, 1),
									fontSize: theme.typography.caption.fontSize,
								},
							},
							arrow: {
								sx: {
									color: theme.palette.background.paper,
									"&::before": {
										border: `1px solid ${theme.palette.divider}`,
										boxSizing: "border-box",
									},
								},
							},
						}}
					>
						<Button
							variant="outlined"
							size="small"
							startIcon={<VisibilityIcon fontSize="small" />}
							onClick={() => (window.location.href = viewUrl)}
							sx={{ textTransform: "none", borderRadius: 1, padding: 0.25 }}
						>
							مشاهده
						</Button>
					</Tooltip>
				);
			},
		},
	];

	if (loading) {
		return <LoadingView title="کارکنان استان" />;
	}

	if (error) {
		return (
			<ErrorView title="کارکنان استان" message={error} onRetry={refetch} />
		);
	}

	return (
		<>
			<NavBar
				title={`کارکنان ${provinceName}`}
				backTo={isGlobalAdmin ? ROUTES.PROVINCES : undefined}
				backLabel="بازگشت به استان‌ها"
			/>
			<Container
				sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}
			>
				{settings?.performanceLocked && (
					<Alert severity="warning" icon={<LockIcon />}>
						ویرایش عملکرد در حال حاضر قفل شده است. کارمندان نمی‌توانند سوابق
						عملکرد خود را تغییر دهند.
					</Alert>
				)}

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
							کارکنان
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: "block" }}
						>
							{loading ? "در حال بارگذاری استان..." : provinceName}
						</Typography>
					</Stack>
					<Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
						{pagination && (
							<>
								<Chip label={`${pagination.total} کل`} color="primary" />
								<Chip
									label={`فعال: ${activeCount}`}
									color="success"
									variant="outlined"
								/>
								<Chip
									label={`غیرفعال: ${inactiveCount}`}
									color="error"
									variant="outlined"
								/>
								<Chip
									label={`در مرخصی: ${onLeaveCount}`}
									color="warning"
									variant="outlined"
								/>
								<Chip
									label={`رانندگان کامیون: ${truckDriverCount}`}
									color="info"
									variant="outlined"
								/>
							</>
						)}
						<Button
							onClick={handleExportProvinceEmployees}
							disabled={exporting || employees.length === 0}
							variant="outlined"
							startIcon={<FileDownloadIcon />}
						>
							خروجی به اکسل
						</Button>
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
							کارمند جدید
						</Button>
					</Stack>
				</Stack>

				<SearchFilterBar
					onSearchChange={setSearchTerm}
					onSearchFieldChange={setSearchField}
					onPerformanceFilterChange={(metric, value) => {
						setPerformanceMetric(metric);
						setPerformanceValue(value);
					}}
					onToggleFiltersChange={setToggleFilters}
					searchValue={searchTerm}
					searchFieldValue={searchField}
					searchFieldOptions={searchFieldOptions}
					performanceMetric={performanceMetric}
					performanceValue={performanceValue ?? undefined}
					toggleFilters={toggleFilters}
				/>

				{!loading && employees.length === 0 ? (
					<EmptyState message="هیچ کارمندی یافت نشد." />
				) : filteredEmployees.length === 0 && !loading ? (
					<EmptyState message="هیچ کارمندی با معیارهای جستجو یا فیلتر شما مطابقت ندارد." />
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
								count={pagination?.pages || 1}
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

				{/* Toast Notification */}
				{toastOpen && (
					<Box
						sx={{
							position: "fixed",
							bottom: 20,
							right: 20,
							zIndex: 1400,
						}}
					>
						<Alert
							severity={toastSeverity}
							onClose={() => setToastOpen(false)}
							sx={{ boxShadow: 2 }}
						>
							{toastMessage}
						</Alert>
					</Box>
				)}
			</Container>
		</>
	);
}
