import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { ROUTES, API_BASE_URL } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { useProvinces } from "../hooks/useProvinces";
import {
	useDashboardOverview,
	useDashboardAnalytics,
	usePerformanceSummary,
	useProvincesOverview,
	useRecentActivity,
} from "../hooks/useDashboard";
import { StatCard } from "../components/dashboard/StatCard";
import { ProvincesGrid } from "../components/dashboard/ProvincesGrid";
import { RecentActivityList } from "../components/dashboard/RecentActivityList";
import { EmployeeDistribution } from "../components/dashboard/EmployeeDistribution";
import { PerformanceMetrics } from "../components/dashboard/PerformanceMetrics";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { useState } from "react";

export default function GlobalAdminDashboardPage() {
	const {
		provinces,
		loading: provincesLoading,
		error: provincesError,
		refetch: refetchProvinces,
	} = useProvinces();
	const {
		data: overview,
		loading: overviewLoading,
		error: overviewError,
	} = useDashboardOverview();
	const {
		data: analytics,
		loading: analyticsLoading,
		error: analyticsError,
	} = useDashboardAnalytics();
	const {
		data: performanceSummary,
		loading: performanceLoading,
		error: performanceError,
	} = usePerformanceSummary();
	const { data: provincesOverview, loading: provincesOverviewLoading } =
		useProvincesOverview();
	const { data: recentActivity, loading: recentActivityLoading } =
		useRecentActivity(15);
	const [tabValue, setTabValue] = useState(0);

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

	if (provincesLoading || overviewLoading) {
		return <LoadingView title="Global Admin Dashboard" />;
	}

	const combinedError = provincesError || overviewError;
	if (combinedError) {
		return (
			<ErrorView
				title="Global Admin Dashboard"
				message={combinedError}
				onRetry={refetchProvinces}
			/>
		);
	}

	return (
		<>
			<NavBar title="Global Admin Dashboard" />
			<Container maxWidth="lg" sx={{ py: 4 }}>
				{/* Overview Cards */}
				{overview && (
					<Grid container spacing={2} sx={{ mb: 4 }}>
						<Grid item xs={12} sm={6} md={3}>
							<StatCard
								title="Total Provinces"
								value={overview.totalProvinces}
								icon={<LocationOnIcon />}
								color="primary.main"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatCard
								title="Total Employees"
								value={overview.totalEmployees}
								icon={<PeopleIcon />}
								color="success.main"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatCard
								title="Active Employees"
								value={overview.employeeStatuses.active}
								subtitle={`${(
									(overview.employeeStatuses.active / overview.totalEmployees) *
									100
								).toFixed(1)}% of total`}
								icon={<TrendingUpIcon />}
								color="info.main"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatCard
								title="Admins"
								value={overview.totalAdmins}
								icon={<AssignmentIcon />}
								color="warning.main"
							/>
						</Grid>
					</Grid>
				)}

				{/* Tabs for different views */}
				<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
					<Tabs
						value={tabValue}
						onChange={(_, newValue) => setTabValue(newValue)}
					>
						<Tab label="Employee Distribution" />
						<Tab label="Performance Analysis" />
						<Tab label="All Provinces" />
						<Tab label="Recent Activity" />
					</Tabs>
				</Box>

				{/* Tab 0: Employee Distribution */}
				{tabValue === 0 && analytics && (
					<Grid container spacing={2}>
						<Grid item xs={12} md={8}>
							<EmployeeDistribution
								provinces={analytics.provinces}
								loading={analyticsLoading}
							/>
						</Grid>
						<Grid item xs={12} md={4}>
							{analytics.employees && (
								<Card>
									<CardContent>
										<Typography variant="h6" gutterBottom>
											Employee Demographics
										</Typography>
										<Stack spacing={1.5}>
											<Box>
												<Typography variant="body2" color="textSecondary">
													Total Employees
												</Typography>
												<Typography variant="h6">
													{analytics.employees.totalCount}
												</Typography>
											</Box>
											<Box>
												<Typography variant="body2" color="textSecondary">
													Gender Distribution
												</Typography>
												<Stack direction="row" spacing={2} sx={{ mt: 1 }}>
													<Typography variant="body2">
														👨 {analytics.employees.maleCount}
													</Typography>
													<Typography variant="body2">
														👩 {analytics.employees.femaleCount}
													</Typography>
												</Stack>
											</Box>
											<Box>
												<Typography variant="body2" color="textSecondary">
													Married Employees
												</Typography>
												<Typography variant="body2">
													{analytics.employees.marriedCount}
												</Typography>
											</Box>
											<Box>
												<Typography variant="body2" color="textSecondary">
													Avg Children per Employee
												</Typography>
												<Typography variant="body2">
													{analytics.employees.avgChildrenCount.toFixed(1)}
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							)}
						</Grid>
					</Grid>
				)}

				{/* Tab 1: Performance Analysis */}
				{tabValue === 1 && performanceSummary && (
					<PerformanceMetrics
						byStatus={performanceSummary.byStatus}
						byRank={performanceSummary.byRank}
						byBranch={performanceSummary.byBranch}
						loading={performanceLoading}
					/>
				)}

				{/* Tab 2: All Provinces */}
				{tabValue === 2 && (
					<Box sx={{ mb: 3 }}>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							sx={{ mb: 2 }}
						>
							<Typography variant="h5">Provinces Management</Typography>
							<Button
								onClick={handleExportAllEmployees}
								variant="outlined"
								color="primary"
								startIcon={<FileDownloadIcon />}
							>
								Export All Employees
							</Button>
						</Stack>
						<ProvincesGrid
							provinces={provincesOverview}
							loading={provincesOverviewLoading}
						/>

						{/* Provinces Grid - Province Cards */}
						{provinces.length > 0 && (
							<Box sx={{ mt: 3 }}>
								<Typography variant="h6" sx={{ mb: 2 }}>
									Quick Access to Provinces
								</Typography>
								<Box
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
												<Box
													sx={{
														position: "relative",
														width: "100%",
														pt: "80%",
													}}
												>
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
												<CardContent
													sx={{ flexGrow: 1, width: "100%", py: 1, px: 1 }}
												>
													<Typography variant="body2" component="div" noWrap>
														{province.name ?? "Unnamed"}
													</Typography>
												</CardContent>
											</CardActionArea>
										</Card>
									))}
								</Box>
							</Box>
						)}
					</Box>
				)}

				{/* Tab 3: Recent Activity */}
				{tabValue === 3 && (
					<RecentActivityList
						activities={recentActivity}
						loading={recentActivityLoading}
					/>
				)}
			</Container>
		</>
	);
}
