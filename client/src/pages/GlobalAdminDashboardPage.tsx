import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTheme } from "@mui/material/styles";
import { ROUTES, API_BASE_URL } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { KPICard } from "../components/KPICard";
import { StatusBreakdownPanel } from "../components/StatusBreakdownPanel";
import { DashboardFilters } from "../components/DashboardFilters";
import { ProvinceDistributionPanel } from "../components/ProvinceDistributionPanel";
import { AttendanceCharts } from "../components/AttendanceCharts";
import { WorkplacePerformanceChart } from "../components/WorkplacePerformanceChart";
import { DriverSegmentationPanel } from "../components/DriverSegmentationPanel";
import { useEmployees } from "../hooks/useEmployees";
import { useProvinces } from "../hooks/useProvinces";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { useMilestone2Metrics } from "../hooks/useMilestone2Metrics";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";

export default function GlobalAdminDashboardPage() {
	const theme = useTheme();

	// Get all employees for dashboard analytics
	const { employees: allEmployees, loading, error, refetch } = useEmployees(
		undefined,
		1,
		1000
	);
	const { provinces } = useProvinces();

	// Dashboard filters state
	const [selectedMonth, setSelectedMonth] = useState(
		new Date().toISOString().substring(0, 7)
	);
	const [selectedProvince, setSelectedProvince] = useState("");
	const [selectedBranch, setSelectedBranch] = useState("");
	const [selectedRank, setSelectedRank] = useState("");
	const [selectedWorkplace, setSelectedWorkplace] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [isDriver, setIsDriver] = useState("");

	// Extract unique values for filter dropdowns
	const branches = Array.from(
		new Set(allEmployees.map((e) => e.workPlace?.branch).filter(Boolean))
	)
		.sort()
		.map((b) => ({ value: b!, label: b! }));

	const ranks = Array.from(
		new Set(allEmployees.map((e) => e.workPlace?.rank).filter(Boolean))
	)
		.sort()
		.map((r) => ({ value: r!, label: r! }));

	const workplaces = Array.from(
		new Set(
			allEmployees
				.map((e) => e.workPlace?.licensedWorkplace)
				.filter(Boolean)
		)
	)
		.sort()
		.map((w) => ({ value: w!, label: w! }));

	const provinceOptions = provinces.map((p) => ({
		value: p._id,
		label: p.name,
	}));

	// Generate month options (current month + 11 previous months)
	const generateMonthOptions = () => {
		const months = [];
		const now = new Date();
		for (let i = 0; i < 12; i++) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const value = date.toISOString().substring(0, 7);
			const label = date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
			});
			months.push({ value, label });
		}
		return months;
	};

	const monthOptions = generateMonthOptions();

	// Apply filters for metrics calculation
	const metrics = useDashboardMetrics(allEmployees, {
		province: selectedProvince,
		branch: selectedBranch,
		rank: selectedRank,
		workplace: selectedWorkplace,
		status: selectedStatus,
		isDriver: isDriver === "yes" ? true : isDriver === "no" ? false : undefined,
	});

	// Milestone 2: Calculate province distribution, attendance, and workplace metrics
	const milestone2Metrics = useMilestone2Metrics(allEmployees);

	const handleResetFilters = useCallback(() => {
		setSelectedProvince("");
		setSelectedBranch("");
		setSelectedRank("");
		setSelectedWorkplace("");
		setSelectedStatus("");
		setIsDriver("");
	}, []);

	const handleExportAllEmployees = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/employees/export-all`, {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to export employees");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`employees_all_${new Date().toISOString().split("T")[0]}.xlsx`
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Export failed:", err);
			alert("Failed to export employees");
		}
	};

	if (loading) {
		return <LoadingView title="Global Admin Dashboard" />;
	}

	if (error) {
		return (
			<ErrorView
				title="Global Admin Dashboard"
				message={error}
				onRetry={refetch}
			/>
		);
	}

	return (
		<>
			<NavBar title="Global Admin Dashboard" />
			<Container maxWidth="lg" sx={{ py: 3 }} component="main">
				{/* Header */}
				<Stack
					direction={{ xs: "column", sm: "row" }}
					justifyContent="space-between"
					alignItems="flex-start"
					gap={2}
					sx={{ mb: 3 }}
					role="region"
					aria-label="Dashboard header with title and export button"
				>
					<Stack>
						<Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
							Analytics Dashboard
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Current month snapshot across all provinces
						</Typography>
					</Stack>
					<Button
						onClick={handleExportAllEmployees}
						variant="outlined"
						color="primary"
						startIcon={<FileDownloadIcon />}
						sx={{ width: { xs: "100%", sm: "auto" } }}
					>
						Export All Employees
					</Button>
				</Stack>

				{/* Filters */}
				<DashboardFilters
					months={monthOptions}
					provinces={provinceOptions}
					branches={branches}
					ranks={ranks}
					workplaces={workplaces}
					statusOptions={[
						{ value: "active", label: "Active" },
						{ value: "inactive", label: "Inactive" },
						{ value: "on_leave", label: "On Leave" },
					]}
					selectedMonth={selectedMonth}
					selectedProvince={selectedProvince}
					selectedBranch={selectedBranch}
					selectedRank={selectedRank}
					selectedWorkplace={selectedWorkplace}
					selectedStatus={selectedStatus}
					isDriver={isDriver}
					onMonthChange={setSelectedMonth}
					onProvinceChange={setSelectedProvince}
					onBranchChange={setSelectedBranch}
					onRankChange={setSelectedRank}
					onWorkplaceChange={setSelectedWorkplace}
					onStatusChange={setSelectedStatus}
					onDriverChange={setIsDriver}
					onResetFilters={handleResetFilters}
				/>

				{/* KPI Cards */}
				<Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
					<Grid item xs={12} sm={6} md={3}>
						<KPICard
							title="Total Employees"
							value={metrics.totalEmployees}
							color="primary"
							tooltip="Total number of employees matching current filters"
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<KPICard
							title="Average Performance"
							value={metrics.averagePerformance.toFixed(2)}
							unit="/ 100"
							color="success"
							tooltip="Average daily performance score for current month"
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<KPICard
							title="Turnover Rate"
							value={metrics.turnoverRate.toFixed(2)}
							unit="%"
							color="warning"
							tooltip="Employees with job end date in current month"
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<KPICard
							title="Driver Count"
							value={metrics.driverCount}
							color="info"
							tooltip="Total truck drivers in workforce"
						/>
					</Grid>
				</Grid>

				{/* Status Breakdown */}
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12} md={6}>
						<StatusBreakdownPanel
							active={metrics.activeCount}
							inactive={metrics.inactiveCount}
							onLeave={metrics.onLeaveCount}
							loading={loading}
						/>
					</Grid>
				</Grid>

				{/* Milestone 2: Province Distribution */}
				<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
					Province Distribution
				</Typography>
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12}>
						<ProvinceDistributionPanel
							data={milestone2Metrics.provinceData}
							loading={loading}
						/>
					</Grid>
				</Grid>

				{/* Milestone 2: Attendance Charts */}
				<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
					Attendance Analysis
				</Typography>
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12}>
						<AttendanceCharts
							branchData={milestone2Metrics.branchAttendanceData}
							rankData={milestone2Metrics.rankAttendanceData}
							loading={loading}
						/>
					</Grid>
				</Grid>

				{/* Milestone 2: Workplace Performance */}
				<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
					Performance Metrics
				</Typography>
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12}>
						<WorkplacePerformanceChart
							data={milestone2Metrics.workplacePerformanceData}
							loading={loading}
						/>
					</Grid>
				</Grid>

				{/* Milestone 3: Driver Segmentation */}
				<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
					Workforce Composition
				</Typography>
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={12} md={6}>
						<DriverSegmentationPanel
							driverCount={metrics.driverCount}
							nonDriverCount={
								metrics.totalEmployees - metrics.driverCount
							}
							loading={loading}
						/>
					</Grid>
				</Grid>

				{/* Navigation Links */}
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					sx={{ mt: 4 }}
				>
					<Button
						component={Link}
						to={ROUTES.PROVINCES}
						variant="contained"
						color="primary"
					>
						View Provinces
					</Button>
				</Stack>
			</Container>
		</>
	);
}
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "repeat(4, minmax(0, 1fr))",
							sm: "repeat(5, minmax(0, 1fr))",
							md: "repeat(6, minmax(0, 1fr))",
							lg: "repeat(8, minmax(0, 1fr))",
						},
						gap: 1,
					}}
				>
					{provinces.map((province) => (
						<Card
							key={province._id}
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<CardActionArea
								component={Link}
								to={ROUTES.PROVINCE_EMPLOYEES.replace(
									":provinceId",
									province._id
								)}
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "stretch",
									flexGrow: 1,
								}}
							>
								<Box sx={{ position: "relative", width: "100%", pt: "80%" }}>
									{province.imageUrl ? (
										<CardMedia
											component="img"
											image={province.imageUrl}
											alt={province.name ?? "Province image"}
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									) : (
										<Stack
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "100%",
												bgcolor: "grey.100",
											}}
											alignItems="center"
											justifyContent="center"
										>
											<Avatar
												sx={{
													width: 40,
													height: 40,
													bgcolor: "primary.main",
												}}
											>
												{province.name?.charAt(0) ?? "?"}
											</Avatar>
										</Stack>
									)}
								</Box>
								<CardContent sx={{ flexGrow: 1, width: "100%", py: 1, px: 1 }}>
									<Typography variant="body2" component="div" noWrap>
										{province.name ?? "Unnamed"}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					))}
				</Box>
			</Container>
		</>
	);
}
