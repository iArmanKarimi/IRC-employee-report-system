import { useState, useEffect } from "react";
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
import PerformanceDisplay from "../components/PerformanceDisplay";
import { ConfirmDialog } from "../components/dialogs/ConfirmDialog";
import { useEmployee } from "../hooks/useEmployee";
import { useApiMutation } from "../hooks/useApiMutation";
import { useIsGlobalAdmin } from "../hooks/useAuth";
import { useGlobalSettings } from "../hooks/useGlobalSettings";
import { formatEmployeeName } from "../utils/formatters";
import type { IPerformance } from "../types/models";

export default function EmployeePage() {
	const { provinceId, employeeId } = useParams<{
		provinceId: string;
		employeeId: string;
	}>();
	const navigate = useNavigate();
	const { isGlobalAdmin } = useIsGlobalAdmin();
	const { settings } = useGlobalSettings();
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
	const [localPerformance, setLocalPerformance] = useState<IPerformance | null>(
		null
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Sync local performance state with employee data
	useEffect(() => {
		if (employee?.performance) {
			setLocalPerformance(employee.performance);
			setHasUnsavedChanges(false);
		}
	}, [employee]);

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

	// Helper to update performance record
	async function updatePerformance(
		updatedPerformance: IPerformance,
		errorMsg: string
	) {
		if (!provinceId || !employeeId) return;
		setSaving(true);
		setSaveError(null);
		try {
			const res = await provinceApi.updateEmployee(provinceId, employeeId, {
				performance: updatedPerformance,
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

	const handlePerformanceChange = (key: keyof IPerformance, value: any) => {
		if (!localPerformance) return;
		setLocalPerformance((prev) => {
			if (!prev) return prev;
			return { ...prev, [key]: value };
		});
		setHasUnsavedChanges(true);
	};

	const handleSavePerformance = async () => {
		if (!localPerformance) return;
		await updatePerformance(
			localPerformance,
			"Failed to update performance record"
		);
		setHasUnsavedChanges(false);
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
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Breadcrumbs
					provinceName={
						typeof employee.provinceId === "object"
							? employee.provinceId.name
							: undefined
					}
					employeeName={formatEmployeeName(employee)}
					showProvincesLink={isGlobalAdmin}
				/>
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
						mb: 3,
						gap: 1.5,
					}}
				>
					<Button
						variant="contained"
						color="primary"
						startIcon={<EditIcon />}
						onClick={handleEditOpen}
						aria-label="Edit Employee"
						size="medium"
					>
						Edit Employee
					</Button>
					<Button
						variant="contained"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setDeleteDialogOpen(true)}
						aria-label="Delete Employee"
						size="medium"
					>
						Delete Employee
					</Button>
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
							<CardContent sx={{ pb: "24px !important" }}>
								<Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
									Basic Information
								</Typography>
								<Divider sx={{ mb: 2.5 }} />
								<Stack spacing={2}>
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
							<CardContent sx={{ pb: "24px !important" }}>
								<Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
									WorkPlace Information
								</Typography>
								<Divider sx={{ mb: 2.5 }} />
								<Stack spacing={2}>
									<InfoField label="Branch" value={employee.workPlace.branch} />
									<InfoField label="Rank" value={employee.workPlace.rank} />
									<InfoField
										label="Licensed Workplace"
										value={employee.workPlace.licensedWorkplace}
									/>
								</Stack>
							</CardContent>
						</Card>
					</Box>

					{/* Additional Specifications */}
					<Card>
						<CardContent sx={{ pb: "24px !important" }}>
							<Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
								Additional Specifications
							</Typography>
							<Divider sx={{ mb: 2.5 }} />
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
									label="Truck Driver"
									value={
										employee.additionalSpecifications.truckDriver ? "Yes" : "No"
									}
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
											label={
												employee.performance?.status
													? employee.performance.status
															.replace("_", " ")
															.toUpperCase()
													: "N/A"
											}
											color={
												employee.performance?.status === "active"
													? "success"
													: employee.performance?.status === "inactive"
													? "error"
													: "warning"
											}
											size="small"
											variant="outlined"
										/>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>

					{/* Performance Record */}
					<Card>
						<CardContent>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2,
								}}
							>
								<Typography variant="h6">Current Month Performance</Typography>
								<Button
									variant="contained"
									color="primary"
									onClick={handleSavePerformance}
									disabled={
										saving || !hasUnsavedChanges || settings?.performanceLocked
									}
									size="small"
								>
									{saving ? "Saving..." : "Save Changes"}
								</Button>
							</Box>
							{localPerformance ? (
								<PerformanceDisplay
									performance={localPerformance}
									onChange={handlePerformanceChange}
									locked={settings?.performanceLocked}
								/>
							) : (
								<Typography color="text.secondary">
									No performance data available for this employee.
								</Typography>
							)}
						</CardContent>
					</Card>
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
