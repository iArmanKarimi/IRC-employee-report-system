import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { provinceApi, type Employee } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";

export default function EmployeePage() {
	const { provinceId, employeeId } = useParams<{
		provinceId: string;
		employeeId: string;
	}>();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!provinceId || !employeeId) {
			setError("Missing identifiers");
			setLoading(false);
			return;
		}

		const fetchEmployee = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await provinceApi.getEmployee(provinceId, employeeId);
				if (!res.success || !res.data) {
					setError(res.error || "Employee not found");
					return;
				}
				setEmployee(res.data);
			} catch (err) {
				setError("Failed to load employee");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployee();
	}, [provinceId, employeeId]);

	const handleDelete = async () => {
		if (!provinceId || !employeeId) return;

		setDeleting(true);
		setError(null);
		try {
			await provinceApi.deleteEmployee(provinceId, employeeId);
			navigate(ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId), {
				replace: true,
			});
		} catch (err) {
			setError("Failed to delete employee");
			setDeleteDialogOpen(false);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<>
				<NavBar title="Employee Details" />
				<Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
					<CircularProgress />
				</Container>
			</>
		);
	}

	if (error && !employee) {
		return (
			<>
				<NavBar title="Employee Details" />
				<Container sx={{ mt: 4 }}>
					<Alert severity="error">{error}</Alert>
					<Button
						component={Link}
						to={ROUTES.PROVINCE_EMPLOYEES.replace(
							":provinceId",
							provinceId || ""
						)}
						startIcon={<ArrowBackIcon />}
						sx={{ mt: 2 }}
					>
						Back to Employees
					</Button>
				</Container>
			</>
		);
	}

	if (!employee) {
		return (
			<>
				<NavBar title="Employee Details" />
				<Container sx={{ mt: 4 }}>
					<Alert severity="info">Employee not found.</Alert>
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="Employee Details" />
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Typography variant="h4" component="h1">
						Employee Details
					</Typography>
					<Button
						variant="contained"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setDeleteDialogOpen(true)}
					>
						Delete Employee
					</Button>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<Stack spacing={3}>
					{/* Basic Info & WorkPlace - Side by side on desktop */}
					<Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
						<Card sx={{ flex: "1 1 400px" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Basic Information
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Stack spacing={1.5}>
									<InfoField
										label="First Name"
										value={employee.basicInfo.firstName}
									/>
									<InfoField
										label="Last Name"
										value={employee.basicInfo.lastName}
									/>
									<InfoField
										label="National ID"
										value={employee.basicInfo.nationalID}
									/>
									<InfoField
										label="Gender"
										value={employee.basicInfo.male ? "Male" : "Female"}
									/>
									<InfoField
										label="Married"
										value={employee.basicInfo.married ? "Yes" : "No"}
									/>
									<InfoField
										label="Children Count"
										value={employee.basicInfo.childrenCount}
									/>
								</Stack>
							</CardContent>
						</Card>

						<Card sx={{ flex: "1 1 400px" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									WorkPlace Information
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Stack spacing={1.5}>
									<InfoField
										label="Province Name"
										value={employee.workPlace.provinceName}
									/>
									<InfoField label="Branch" value={employee.workPlace.branch} />
									<InfoField label="Rank" value={employee.workPlace.rank} />
									<InfoField
										label="Licensed Workplace"
										value={employee.workPlace.licensedWorkplace}
									/>
									<InfoField
										label="Travel Assignment"
										value={employee.workPlace.travelAssignment ? "Yes" : "No"}
									/>
								</Stack>
							</CardContent>
						</Card>
					</Box>

					{/* Additional Specifications */}
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Additional Specifications
							</Typography>
							<Divider sx={{ mb: 2 }} />
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
								<InfoField
									label="Educational Degree"
									value={employee.additionalSpecifications.educationalDegree}
								/>
								<InfoField
									label="Date of Birth"
									value={new Date(
										employee.additionalSpecifications.dateOfBirth
									).toLocaleDateString()}
								/>
								<InfoField
									label="Contact Number"
									value={employee.additionalSpecifications.contactNumber}
								/>
								<InfoField
									label="Job Start Date"
									value={new Date(
										employee.additionalSpecifications.jobStartDate
									).toLocaleDateString()}
								/>
								{employee.additionalSpecifications.jobEndDate && (
									<InfoField
										label="Job End Date"
										value={new Date(
											employee.additionalSpecifications.jobEndDate
										).toLocaleDateString()}
									/>
								)}
								<Box>
									<Typography variant="caption" color="text.secondary">
										Status
									</Typography>
									<Box sx={{ mt: 0.5 }}>
										<Chip
											label={employee.additionalSpecifications.status
												.replace("_", " ")
												.toUpperCase()}
											color={
												employee.additionalSpecifications.status === "active"
													? "success"
													: employee.additionalSpecifications.status ===
													  "inactive"
													? "error"
													: "warning"
											}
											size="small"
										/>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>

					{/* Performance Records */}
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Performance Records ({employee.performances.length})
							</Typography>
							<Divider sx={{ mb: 2 }} />
							{employee.performances.length === 0 ? (
								<Typography color="text.secondary">
									No performance records yet.
								</Typography>
							) : (
								<Stack spacing={2}>
									{employee.performances.map((perf, index) => (
										<Card key={index} variant="outlined">
											<CardContent>
												<Typography
													variant="subtitle1"
													fontWeight="bold"
													gutterBottom
												>
													{perf.month}
												</Typography>
												<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
													<InfoField
														label="Daily Performance"
														value={perf.dailyPerformance}
													/>
													<InfoField
														label="Shift Count/Location"
														value={perf.shiftCountPerLocation}
													/>
													<InfoField
														label="Shift Duration"
														value={`${perf.shiftDuration} hours`}
													/>
													<InfoField label="Overtime" value={perf.overtime} />
													<InfoField
														label="Daily Leave"
														value={perf.dailyLeave}
													/>
													<InfoField
														label="Sick Leave"
														value={perf.sickLeave}
													/>
													<InfoField label="Absence" value={perf.absence} />
													<InfoField
														label="Volunteer Shifts"
														value={perf.volunteerShiftCount}
													/>
													<InfoField
														label="Truck Driver"
														value={perf.truckDriver ? "Yes" : "No"}
													/>
												</Box>
												{perf.notes && (
													<Box sx={{ mt: 2 }}>
														<Typography variant="body2" color="text.secondary">
															<strong>Notes:</strong> {perf.notes}
														</Typography>
													</Box>
												)}
											</CardContent>
										</Card>
									))}
								</Stack>
							)}
						</CardContent>
					</Card>

					{/* Metadata */}
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Metadata
							</Typography>
							<Divider sx={{ mb: 2 }} />
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
								<InfoField label="Employee ID" value={employee._id} />
								<InfoField
									label="Province ID"
									value={
										typeof employee.provinceId === "string"
											? employee.provinceId
											: employee.provinceId._id
									}
								/>
								<InfoField
									label="Created At"
									value={new Date(employee.createdAt).toLocaleString()}
								/>
								<InfoField
									label="Updated At"
									value={new Date(employee.updatedAt).toLocaleString()}
								/>
							</Box>
						</CardContent>
					</Card>
				</Stack>

				<Box sx={{ mt: 3 }}>
					<Button
						component={Link}
						to={ROUTES.PROVINCE_EMPLOYEES.replace(
							":provinceId",
							provinceId || ""
						)}
						startIcon={<ArrowBackIcon />}
					>
						Back to Employees
					</Button>
				</Box>

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={deleteDialogOpen}
					onClose={() => !deleting && setDeleteDialogOpen(false)}
				>
					<DialogTitle>Confirm Delete</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Are you sure you want to delete this employee? This action cannot
							be undone.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => setDeleteDialogOpen(false)}
							disabled={deleting}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDelete}
							color="error"
							variant="contained"
							disabled={deleting}
						>
							{deleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogActions>
				</Dialog>
			</Container>
		</>
	);
}

function InfoField({
	label,
	value,
}: {
	label: string;
	value?: string | number;
}) {
	return (
		<Box sx={{ minWidth: 150 }}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body1" fontWeight="500">
				{value}
			</Typography>
		</Box>
	);
}
