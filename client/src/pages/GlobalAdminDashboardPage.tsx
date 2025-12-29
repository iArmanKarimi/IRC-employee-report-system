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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import WarningIcon from "@mui/icons-material/Warning";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { useProvinces } from "../hooks/useProvinces";
import { useGlobalSettings } from "../hooks/useGlobalSettings";
import { provinceApi, globalApi } from "../api/api";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { useState, useEffect } from "react";

export default function GlobalAdminDashboardPage() {
	const { provinces, loading, error, refetch } = useProvinces();
	const { settings, togglePerformanceLock } = useGlobalSettings();
	const [clearing, setClearing] = useState(false);
	const [toggling, setToggling] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [countdown, setCountdown] = useState(5);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<
		"success" | "error" | "warning"
	>("success");

	// Countdown timer effect (only for clear dialog)
	useEffect(() => {
		if (confirmDialogOpen && countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [confirmDialogOpen, countdown]);

	// Auto-close toast after 4 seconds
	useEffect(() => {
		if (toastOpen) {
			const timer = setTimeout(() => {
				setToastOpen(false);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [toastOpen]);

	const handleExportAllEmployees = async () => {
		try {
			const blob = await globalApi.exportAllEmployees();
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
			setToastMessage("❌ خروجی کارمندان ناموفق بود");
			setToastSeverity("error");
			setToastOpen(true);
		}
	};

	const handleOpenClearDialog = () => {
		setCountdown(5);
		setConfirmDialogOpen(true);
	};

	const handleCloseClearDialog = () => {
		setConfirmDialogOpen(false);
		setCountdown(5);
	};

	const handleToggleLockClick = async () => {
		setToggling(true);
		setToastOpen(false);
		try {
			const response = await togglePerformanceLock();
			const newStatus = response?.performanceLocked;

			// Force update with new message and severity
			setToastMessage(
				newStatus ? "🔒 ویرایش عملکرد قفل شد" : "🔓 ویرایش عملکرد باز شد"
			);
			setToastSeverity(newStatus ? "warning" : "success");
			setToastOpen(true);
		} catch (err: any) {
			const errorMessage =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"تغییر وضعیت ناموفق بود";
			setToastMessage(`❌ ${errorMessage}`);
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setToggling(false);
		}
	};

	const handleClearAllPerformances = async () => {
		handleCloseClearDialog();
		setClearing(true);
		try {
			const response = await provinceApi.clearAllPerformances();
			setToastMessage(
				`داده‌های عملکرد ${
					response.data?.modifiedCount || 0
				} کارمند با موفقیت بازنشانی شد`
			);
			setToastSeverity("success");
			setToastOpen(true);
		} catch (err: any) {
			console.error("Reset performances failed:", err);
			const errorMessage =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				err?.message ||
				"خطای نامشخص";
			setToastMessage(`بازنشانی عملکرد کارمندان ناموفق بود: ${errorMessage}`);
			setToastSeverity("error");
			setToastOpen(true);
		} finally {
			setClearing(false);
		}
	};

	if (loading) {
		return <LoadingView title="استان‌ها - مدیر کل" />;
	}

	if (error) {
		return (
			<ErrorView title="استان‌ها - مدیر کل" message={error} onRetry={refetch} />
		);
	}

	if (!provinces.length) {
		return (
			<>
				<NavBar title="استان‌ها - مدیر کل" />
				<Container sx={{ mt: 4 }}>
					<EmptyState message="هیچ استانی یافت نشد." />
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="استان‌ها - مدیر کل" />
			<Container sx={{ py: 4 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 3 }}
				>
					<Typography variant="h4" component="h1" gutterBottom sx={{ m: 0 }}>
						استان‌ها
					</Typography>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						sx={{ flexWrap: "wrap" }}
					>
						{/* Performance Lock Toggle */}
						<Stack direction="row" alignItems="center" spacing={1}>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600, minWidth: "fit-content" }}
							>
								عملکرد:
							</Typography>
							<Box
								sx={{
									display: "flex",
									border: "2px solid",
									borderColor: "divider",
									borderRadius: 1,
									overflow: "hidden",
								}}
							>
								<Button
									onClick={handleToggleLockClick}
									disabled={toggling}
									sx={{
										padding: "6px 16px",
										minWidth: "auto",
										color: !settings?.performanceLocked
											? "primary.main"
											: "text.secondary",
										backgroundColor: !settings?.performanceLocked
											? "action.selected"
											: "transparent",
										border: "none",
										borderRadius: 0,
										"&:hover": {
											backgroundColor: !settings?.performanceLocked
												? "action.selected"
												: "action.hover",
										},
										"&:focus": {
											outline: "none",
										},
										"&:focus-visible": {
											outline: "none",
										},
									}}
								>
									<LockOpenIcon sx={{ fontSize: "1.25rem" }} />
								</Button>
								<Box sx={{ width: "1px", backgroundColor: "divider" }} />
								<Button
									onClick={handleToggleLockClick}
									disabled={toggling}
									sx={{
										padding: "6px 16px",
										minWidth: "auto",
										color: settings?.performanceLocked
											? "error.main"
											: "text.secondary",
										backgroundColor: settings?.performanceLocked
											? "action.selected"
											: "transparent",
										border: "none",
										borderRadius: 0,
										"&:hover": {
											backgroundColor: settings?.performanceLocked
												? "action.selected"
												: "action.hover",
										},
										"&:focus": {
											outline: "none",
										},
										"&:focus-visible": {
											outline: "none",
										},
									}}
								>
									<LockIcon sx={{ fontSize: "1.25rem" }} />
								</Button>
							</Box>
						</Stack>

						{/* Action Buttons */}
						<Button
							onClick={handleOpenClearDialog}
							variant="outlined"
							color="error"
							startIcon={<DeleteSweepIcon />}
							disabled={clearing || settings?.performanceLocked}
							size="small"
						>
							{clearing ? "در حال بازنشانی..." : "بازنشانی همه"}
						</Button>
						<Button
							onClick={handleExportAllEmployees}
							variant="contained"
							color="primary"
							startIcon={<FileDownloadIcon />}
							size="small"
						>
							خروجی همه
						</Button>
					</Stack>
				</Stack>

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
								transition: "all 0.3s ease-in-out",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: 4,
								},
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
										{province.name ?? "بدون نام"}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					))}
				</Box>

				{/* Confirm Clear Performances Dialog */}
				<Dialog
					open={confirmDialogOpen}
					onClose={handleCloseClearDialog}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>
						<Stack direction="row" alignItems="center" spacing={1}>
							<WarningIcon color="error" />
							<Typography>بازنشانی عملکرد همه کارمندان</Typography>
						</Stack>
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							<strong>هشدار:</strong> شما در شرف بازنشانی تمام داده‌های عملکرد
							برای همه کارمندان در تمام استان‌ها به مقادیر پیش‌فرض هستید. این
							عمل قابل بازگشت نیست.
						</DialogContentText>
						<DialogContentText sx={{ mt: 2 }}>
							این عمل فیلدهای زیر را به صفر/پیش‌فرض بازنشانی می‌کند:
						</DialogContentText>
						<Box component="ul" sx={{ mt: 1, color: "text.secondary" }}>
							<li>امتیازات عملکرد روزانه (بازنشانی به ۰)</li>
							<li>اطلاعات شیفت (بازنشانی به ۰ شیفت، مدت ۸ ساعت)</li>
							<li>سوابق اضافه‌کاری (بازنشانی به ۰)</li>
							<li>داده‌های مرخصی و غیبت (همه به ۰ بازنشانی می‌شوند)</li>
							<li>وضعیت (بازنشانی به "فعال") و یادداشت‌ها (پاک شده)</li>
						</Box>
						{countdown > 0 && (
							<DialogContentText
								sx={{ mt: 2, fontWeight: "bold", color: "error.main" }}
							>
								Please wait {countdown} second{countdown !== 1 ? "s" : ""}{" "}
								before confirming...
							</DialogContentText>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseClearDialog} color="inherit">
							Cancel
						</Button>
						<Button
							onClick={handleClearAllPerformances}
							color="error"
							variant="contained"
							disabled={countdown > 0}
							startIcon={<DeleteSweepIcon />}
						>
							Confirm Reset All
						</Button>
					</DialogActions>
				</Dialog>

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
