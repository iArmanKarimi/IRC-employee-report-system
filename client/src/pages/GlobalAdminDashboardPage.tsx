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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import WarningIcon from "@mui/icons-material/Warning";
import { ROUTES, API_BASE_URL } from "../const/endpoints";
import NavBar from "../components/NavBar";
import { useProvinces } from "../hooks/useProvinces";
import { provinceApi } from "../api/api";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EmptyState } from "../components/states/EmptyState";
import { useState, useEffect } from "react";

export default function GlobalAdminDashboardPage() {
	const { provinces, loading, error, refetch } = useProvinces();
	const [clearing, setClearing] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [countdown, setCountdown] = useState(5);

	// Countdown timer effect
	useEffect(() => {
		if (confirmDialogOpen && countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [confirmDialogOpen, countdown]);

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

	const handleOpenClearDialog = () => {
		setCountdown(5);
		setConfirmDialogOpen(true);
	};

	const handleCloseClearDialog = () => {
		setConfirmDialogOpen(false);
		setCountdown(5);
	};

	const handleClearAllPerformances = async () => {
		handleCloseClearDialog();
		setClearing(true);
		try {
			const response = await provinceApi.clearAllPerformances();
			alert(
				`Successfully cleared performance data from ${
					response.data?.modifiedCount || 0
				} employee(s)`
			);
		} catch (err) {
			console.error("Clear performances failed:", err);
			alert("Failed to clear employee performances");
		} finally {
			setClearing(false);
		}
	};

	if (loading) {
		return <LoadingView title="Provinces - Global Admin" />;
	}

	if (error) {
		return (
			<ErrorView
				title="Provinces - Global Admin"
				message={error}
				onRetry={refetch}
			/>
		);
	}

	if (!provinces.length) {
		return (
			<>
				<NavBar title="Provinces - Global Admin" />
				<Container sx={{ mt: 4 }}>
					<EmptyState message="No provinces found." />
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="Provinces - Global Admin" />
			<Container sx={{ py: 4 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 3 }}
				>
					<Typography variant="h4" component="h1" gutterBottom sx={{ m: 0 }}>
						Provinces
					</Typography>
					<Stack direction="row" spacing={2}>
						<Button
							onClick={handleOpenClearDialog}
							variant="outlined"
							color="error"
							startIcon={<DeleteSweepIcon />}
							disabled={clearing}
						>
							{clearing ? "Clearing..." : "Clear All Performances"}
						</Button>
						<Button
							onClick={handleExportAllEmployees}
							variant="outlined"
							color="primary"
							startIcon={<FileDownloadIcon />}
						>
							Export All Employees
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
							<Typography>Clear All Employee Performances</Typography>
						</Stack>
					</DialogTitle>
					<DialogContent>
						<DialogContentText>
							<strong>Warning:</strong> You are about to clear all performance
							data from all employees across all provinces. This action cannot
							be undone.
						</DialogContentText>
						<DialogContentText sx={{ mt: 2 }}>
							This will remove all performance records including:
						</DialogContentText>
						<Box component="ul" sx={{ mt: 1, color: "text.secondary" }}>
							<li>Daily performance scores</li>
							<li>Shift information</li>
							<li>Overtime records</li>
							<li>Leave and absence data</li>
							<li>Status and notes</li>
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
							Confirm Clear All
						</Button>
					</DialogActions>
				</Dialog>
			</Container>
		</>
	);
}
