import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { provinceApi, type UpdateEmployeeInput } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EditEmployeeDialog } from "../components/dialogs/EditEmployeeDialog";
import { PerformanceManager } from "../components/PerformanceManager";
import { ConfirmDialog } from "../components/dialogs/ConfirmDialog";
import { useEmployee } from "../hooks/useEmployee";
import { useApiMutation } from "../hooks/useApiMutation";
import { formatEmployeeName } from "../utils/formatters";
import type { IPerformance } from "../types/models";

export default function EmployeePage() {
	const { provinceId, employeeId } = useParams<{
		provinceId: string;
		employeeId: string;
	}>();
	const navigate = useNavigate();
	const { employee, loading, error, refetch } = useEmployee(
		provinceId,
		employeeId
	);
	const { mutate: deleteEmployee, loading: deleting } = useApiMutation(
		async () => {
			if (!provinceId || !employeeId) throw new Error("Missing identifiers");
			return await provinceApi.deleteEmployee(provinceId, employeeId);
		}
	);

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const handleEditOpen = () => {
		setEditDialogOpen(true);
	};

	const handleDelete = async () => {
		const result = await deleteEmployee();
		if (result) {
			navigate(ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId!), {
				replace: true,
			});
		}
		setDeleteDialogOpen(false);
	};

	const handleSaveEdit = async (data: UpdateEmployeeInput) => {
		if (!provinceId || !employeeId) return;

		setSaving(true);
		setSaveError(null);
		try {
			const res = await provinceApi.updateEmployee(
				provinceId,
				employeeId,
				data
			);
			if (!res.success || !res.data) {
				setSaveError(
					res.error ||
						"Failed to update employee. Please check your input and try again."
				);
				return;
			}
			await refetch();
			setEditDialogOpen(false);
		} catch (err) {
			setSaveError(
				"Failed to update employee. Please check your input and try again."
			);
		} finally {
			setSaving(false);
		}
	};

	// Helper to update performance records
	async function updatePerformanceRecords(
		updatedPerformances: IPerformance[],
		errorMsg: string
	) {
		if (!provinceId || !employeeId) return;
		setSaving(true);
		setSaveError(null);
		try {
			const res = await provinceApi.updateEmployee(provinceId, employeeId, {
				performances: updatedPerformances,
			});
			if (!res.success || !res.data) {
				setSaveError(
					res.error ||
						errorMsg +
							". Please try again or contact support if the issue persists."
				);
				return;
			}
			await refetch();
		} catch (err) {
			setSaveError(
				errorMsg +
					". Please try again or contact support if the issue persists."
			);
		} finally {
			setSaving(false);
		}
	}

	const handleAddPerformance = async (performance: IPerformance) => {
		if (!employee) return;
		const updatedPerformances = [...employee.performances, performance];
		await updatePerformanceRecords(
			updatedPerformances,
			"Failed to add performance record. Please try again or contact support if the issue persists."
		);
	};

	const handleEditPerformance = async (
		index: number,
		performance: IPerformance
	) => {
		if (!employee) return;
		const updatedPerformances = employee.performances.map((perf, i) =>
			i === index ? performance : perf
		);
		await updatePerformanceRecords(
			updatedPerformances,
			"Failed to update performance record. Please try again or contact support if the issue persists."
		);
	};

	const handleDeletePerformance = async (index: number) => {
		if (!employee) return;
		const updatedPerformances = employee.performances.filter(
			(_, i) => i !== index
		);
		await updatePerformanceRecords(
			updatedPerformances,
			"Failed to delete performance record. Please try again or contact support if the issue persists."
		);
	};

	if (loading) {
		return <LoadingView title="Employee Details" />;
	}

	if (error && !employee) {
		return (
			<ErrorView title="Employee Details" message={error} onRetry={refetch} />
		);
	}

	if (!employee) {
		return <ErrorView title="Employee Details" message="Employee not found" />;
	}

	return (
		<>
			<NavBar
				title="Employee Details"
				backTo={
					provinceId
						? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
						: ROUTES.PROVINCES
				}
				backLabel="Back to Employees"
			/>
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				<Breadcrumbs
					provinceName={employee.workPlace?.provinceName}
					employeeName={formatEmployeeName(employee)}
				/>
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
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button
							variant="contained"
							color="primary"
							startIcon={<EditIcon />}
							onClick={handleEditOpen}
							aria-label="Edit Employee"
						>
							Edit Employee
						</Button>
						<Button
							variant="contained"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={() => setDeleteDialogOpen(true)}
							aria-label="Delete Employee"
						>
							Delete Employee
						</Button>
					</Box>
				</Box>

				{saveError && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{saveError}
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
					<PerformanceManager
						performances={employee.performances}
						saving={saving}
						onAdd={handleAddPerformance}
						onEdit={handleEditPerformance}
						onDelete={handleDeletePerformance}
					/>
				</Stack>

				<Box sx={{ mt: 3 }}>
					<Button
						component={Link}
						to={
							provinceId
								? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
								: "/"
						}
						startIcon={<ArrowBackIcon />}
						disabled={!provinceId}
						aria-disabled={!provinceId}
						aria-label={provinceId ? "Back to Employees" : "Back unavailable"}
					>
						Back to Employees
					</Button>
				</Box>

				<EditEmployeeDialog
					open={editDialogOpen}
					employee={employee}
					saving={saving}
					onClose={() => setEditDialogOpen(false)}
					onSave={handleSaveEdit}
				/>

				<ConfirmDialog
					open={deleteDialogOpen}
					title="Confirm Delete"
					message="Are you sure you want to delete this employee? This action cannot be undone."
					loading={deleting}
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleDelete}
				/>
			</Container>
		</>
	);
}

// Helper component for displaying employee info fields
type InfoFieldValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| (string | number)[];
function InfoField({ label, value }: { label: string; value: InfoFieldValue }) {
	const displayValue = () => {
		if (value === null || value === undefined || value === "") {
			return "N/A";
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		if (value instanceof Date) {
			return value.toLocaleDateString();
		}
		if (Array.isArray(value)) {
			return value.join(", ") || "N/A";
		}
		return String(value);
	};

	return (
		<Box sx={{ display: "flex", justifyContent: "space-between" }}>
			<Typography variant="body2" color="text.secondary">
				{label}:
			</Typography>
			<Typography variant="body2">{displayValue()}</Typography>
		</Box>
	);
}
