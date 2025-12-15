# MUI Migration - Remaining Pages

This document contains the complete MUI implementations for the remaining two pages that need to be converted.

## Pages Completed ✅

- ✅ LoginFormPage
- ✅ GlobalAdminDashboardPage
- ✅ ProvinceEmployeesPage
- ✅ NavBar Component

## Pages To Complete

### NewEmployeeFormPage - MUI Version

Replace the entire content of `src/pages/NewEmployeeFormPage.tsx` with:

```typescript
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid2";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { provinceApi } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import type {
	CreateEmployeeInput,
	IBasicInfo,
	IWorkPlace,
	IAdditionalSpecifications,
} from "../types/models";

type EmployeeFormData = {
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
};

export default function NewEmployeeFormPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const navigate = useNavigate();
	const [form, setForm] = useState<EmployeeFormData>({
		basicInfo: {
			firstName: "",
			lastName: "",
			nationalID: "",
			male: true,
			married: false,
			childrenCount: 0,
		},
		workPlace: {
			provinceName: "",
			branch: "",
			rank: "",
			licensedWorkplace: "",
			travelAssignment: false,
		},
		additionalSpecifications: {
			educationalDegree: "",
			dateOfBirth: "",
			contactNumber: "",
			jobStartDate: "",
			jobEndDate: undefined,
			status: "active",
		},
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateBasicInfo = (
		key: keyof IBasicInfo,
		value: string | number | boolean
	) => {
		setForm((prev) => ({
			...prev,
			basicInfo: { ...prev.basicInfo, [key]: value },
		}));
	};

	const updateWorkPlace = (key: keyof IWorkPlace, value: string | boolean) => {
		setForm((prev) => ({
			...prev,
			workPlace: { ...prev.workPlace, [key]: value },
		}));
	};

	const updateAdditionalSpecs = (
		key: keyof IAdditionalSpecifications,
		value: string
	) => {
		setForm((prev) => ({
			...prev,
			additionalSpecifications: {
				...prev.additionalSpecifications,
				[key]: value,
			},
		}));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!provinceId) {
			setError("Province ID is missing");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const payload: CreateEmployeeInput = {
				provinceId,
				basicInfo: form.basicInfo,
				workPlace: form.workPlace,
				additionalSpecifications: form.additionalSpecifications,
				performances: [],
			};
			await provinceApi.createEmployee(provinceId, payload);
			navigate(ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId), {
				replace: true,
			});
		} catch (err) {
			setError("Failed to create employee");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavBar title="New Employee" />
			<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
				<Paper elevation={2} sx={{ p: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						New Employee
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Create a new employee record
					</Typography>

					<form onSubmit={handleSubmit}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
							{/* Basic Info Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									Basic Information
								</Typography>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="First Name"
											required
											fullWidth
											value={form.basicInfo.firstName}
											onChange={(e) =>
												updateBasicInfo("firstName", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Last Name"
											required
											fullWidth
											value={form.basicInfo.lastName}
											onChange={(e) =>
												updateBasicInfo("lastName", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="National ID"
											required
											fullWidth
											value={form.basicInfo.nationalID}
											onChange={(e) =>
												updateBasicInfo("nationalID", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Children Count"
											type="number"
											fullWidth
											inputProps={{ min: 0 }}
											value={form.basicInfo.childrenCount}
											onChange={(e) =>
												updateBasicInfo("childrenCount", Number(e.target.value))
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={form.basicInfo.male}
													onChange={(e) =>
														updateBasicInfo("male", e.target.checked)
													}
												/>
											}
											label="Male"
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={form.basicInfo.married}
													onChange={(e) =>
														updateBasicInfo("married", e.target.checked)
													}
												/>
											}
											label="Married"
										/>
									</Grid>
								</Grid>
							</Box>

							{/* WorkPlace Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									WorkPlace Information
								</Typography>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Province Name"
											required
											fullWidth
											value={form.workPlace.provinceName}
											onChange={(e) =>
												updateWorkPlace("provinceName", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Branch"
											required
											fullWidth
											value={form.workPlace.branch}
											onChange={(e) =>
												updateWorkPlace("branch", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Rank"
											required
											fullWidth
											value={form.workPlace.rank}
											onChange={(e) => updateWorkPlace("rank", e.target.value)}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Licensed Workplace"
											required
											fullWidth
											value={form.workPlace.licensedWorkplace}
											onChange={(e) =>
												updateWorkPlace("licensedWorkplace", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={form.workPlace.travelAssignment}
													onChange={(e) =>
														updateWorkPlace(
															"travelAssignment",
															e.target.checked
														)
													}
												/>
											}
											label="Travel Assignment"
										/>
									</Grid>
								</Grid>
							</Box>

							{/* Additional Specifications Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									Additional Specifications
								</Typography>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Educational Degree"
											required
											fullWidth
											value={form.additionalSpecifications.educationalDegree}
											onChange={(e) =>
												updateAdditionalSpecs(
													"educationalDegree",
													e.target.value
												)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Date of Birth"
											type="date"
											required
											fullWidth
											InputLabelProps={{ shrink: true }}
											value={form.additionalSpecifications.dateOfBirth}
											onChange={(e) =>
												updateAdditionalSpecs("dateOfBirth", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Contact Number"
											required
											fullWidth
											inputProps={{ pattern: "\\d{10}" }}
											helperText="10 digits required"
											value={form.additionalSpecifications.contactNumber}
											onChange={(e) =>
												updateAdditionalSpecs("contactNumber", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Job Start Date"
											type="date"
											required
											fullWidth
											InputLabelProps={{ shrink: true }}
											value={form.additionalSpecifications.jobStartDate}
											onChange={(e) =>
												updateAdditionalSpecs("jobStartDate", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Job End Date"
											type="date"
											fullWidth
											InputLabelProps={{ shrink: true }}
											value={form.additionalSpecifications.jobEndDate || ""}
											onChange={(e) =>
												updateAdditionalSpecs("jobEndDate", e.target.value)
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<FormControl fullWidth required>
											<InputLabel>Status</InputLabel>
											<Select
												value={form.additionalSpecifications.status}
												label="Status"
												onChange={(e) =>
													updateAdditionalSpecs("status", e.target.value)
												}
											>
												<MenuItem value="active">Active</MenuItem>
												<MenuItem value="inactive">Inactive</MenuItem>
												<MenuItem value="on_leave">On Leave</MenuItem>
											</Select>
										</FormControl>
									</Grid>
								</Grid>
							</Box>

							<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
								<Button
									component={Link}
									to={ROUTES.PROVINCE_EMPLOYEES.replace(
										":provinceId",
										provinceId || ""
									)}
									variant="outlined"
									startIcon={<ArrowBackIcon />}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									startIcon={<SaveIcon />}
								>
									{loading ? "Creating..." : "Create Employee"}
								</Button>
							</Box>

							{error && <Alert severity="error">{error}</Alert>}
						</Box>
					</form>
				</Paper>
			</Container>
		</>
	);
}
```

### EmployeePage - MUI Version

Replace the entire content of `src/pages/EmployeePage.tsx` with:

```typescript
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
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

				<Grid container spacing={3}>
					{/* Basic Info */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Basic Information
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Box
									sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
								>
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
								</Box>
							</CardContent>
						</Card>
					</Grid>

					{/* WorkPlace Info */}
					<Grid size={{ xs: 12, md: 6 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									WorkPlace Information
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Box
									sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
								>
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
								</Box>
							</CardContent>
						</Card>
					</Grid>

					{/* Additional Specifications */}
					<Grid size={{ xs: 12 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Additional Specifications
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6, md: 4 }}>
										<InfoField
											label="Educational Degree"
											value={
												employee.additionalSpecifications.educationalDegree
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 4 }}>
										<InfoField
											label="Date of Birth"
											value={new Date(
												employee.additionalSpecifications.dateOfBirth
											).toLocaleDateString()}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 4 }}>
										<InfoField
											label="Contact Number"
											value={employee.additionalSpecifications.contactNumber}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 4 }}>
										<InfoField
											label="Job Start Date"
											value={new Date(
												employee.additionalSpecifications.jobStartDate
											).toLocaleDateString()}
										/>
									</Grid>
									{employee.additionalSpecifications.jobEndDate && (
										<Grid size={{ xs: 12, sm: 6, md: 4 }}>
											<InfoField
												label="Job End Date"
												value={new Date(
													employee.additionalSpecifications.jobEndDate
												).toLocaleDateString()}
											/>
										</Grid>
									)}
									<Grid size={{ xs: 12, sm: 6, md: 4 }}>
										<InfoField label="Status" value="">
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
										</InfoField>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>

					{/* Performance Records */}
					<Grid size={{ xs: 12 }}>
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
									<Box
										sx={{ display: "flex", flexDirection: "column", gap: 2 }}
									>
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
													<Grid container spacing={2}>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Daily Performance"
																value={perf.dailyPerformance}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Shift Count/Location"
																value={perf.shiftCountPerLocation}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Shift Duration"
																value={`${perf.shiftDuration} hours`}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Overtime"
																value={perf.overtime}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Daily Leave"
																value={perf.dailyLeave}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Sick Leave"
																value={perf.sickLeave}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField label="Absence" value={perf.absence} />
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Volunteer Shifts"
																value={perf.volunteerShiftCount}
															/>
														</Grid>
														<Grid size={{ xs: 6, sm: 4, md: 3 }}>
															<InfoField
																label="Truck Driver"
																value={perf.truckDriver ? "Yes" : "No"}
															/>
														</Grid>
													</Grid>
													{perf.notes && (
														<Box sx={{ mt: 2 }}>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																<strong>Notes:</strong> {perf.notes}
															</Typography>
														</Box>
													)}
												</CardContent>
											</Card>
										))}
									</Box>
								)}
							</CardContent>
						</Card>
					</Grid>

					{/* Metadata */}
					<Grid size={{ xs: 12 }}>
						<Card>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Metadata
								</Typography>
								<Divider sx={{ mb: 2 }} />
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6, md: 3 }}>
										<InfoField label="Employee ID" value={employee._id} />
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 3 }}>
										<InfoField
											label="Province ID"
											value={
												typeof employee.provinceId === "string"
													? employee.provinceId
													: employee.provinceId._id
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 3 }}>
										<InfoField
											label="Created At"
											value={new Date(employee.createdAt).toLocaleString()}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6, md: 3 }}>
										<InfoField
											label="Updated At"
											value={new Date(employee.updatedAt).toLocaleString()}
										/>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

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
	children,
}: {
	label: string;
	value?: string | number;
	children?: React.ReactNode;
}) {
	return (
		<Box>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			{children ? (
				<Box sx={{ mt: 0.5 }}>{children}</Box>
			) : (
				<Typography variant="body1" fontWeight="500">
					{value}
				</Typography>
			)}
		</Box>
	);
}
```

## Steps to Complete Migration

1. Copy the NewEmployeeFormPage code above and replace the entire file
2. Copy the EmployeePage code above and replace the entire file
3. Delete the CSS module file: `src/pages/ProvinceEmployeesPage.module.css`
4. Test all pages to ensure they work correctly

## MUI Components Used

- AppBar & Toolbar - Navigation
- Container - Page layout
- Card & Paper - Content sections
- TextField - Input fields
- Button - Actions
- Table components - Data display
- Pagination - Page navigation
- Dialog - Confirmation modals
- Alert - Error messages
- CircularProgress - Loading states
- Chip - Status badges
- Grid2 - Responsive layouts
- Select & FormControl - Dropdowns
- Checkbox & FormControlLabel - Boolean inputs

## Benefits of MUI Migration

- ✅ Consistent, professional design
- ✅ Responsive out of the box
- ✅ Accessible components
- ✅ Theme customization
- ✅ Less custom CSS to maintain
- ✅ Built-in animations
- ✅ Better TypeScript support
