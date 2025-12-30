import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { provinceApi, type UpdateEmployeeInput } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { EmployeeInfoCard } from "../components/EmployeeInfoCard";
import { LoadingView } from "../components/states/LoadingView";
import { ErrorView } from "../components/states/ErrorView";
import { EditEmployeeDialog } from "../components/dialogs/EditEmployeeDialog";
import PerformanceDisplay from "../components/PerformanceDisplay";
import { ConfirmDialog } from "../components/dialogs/ConfirmDialog";
import { useEmployee } from "../hooks/useEmployee";
import { usePerformanceManager } from "../hooks/usePerformanceManager";
import { useApiMutation } from "../hooks/useApiMutation";
import { useIsGlobalAdmin } from "../hooks/useAuth";
import { useGlobalSettings } from "../hooks/useGlobalSettings";
import { formatEmployeeName } from "../utils/formatters";

/**
 * EmployeePage Component
 *
 * Detailed view and editing page for a single employee.
 * Features:
 * - Display complete employee information
 * - Edit employee basic info and additional specifications
 * - Manage performance records (view, add, edit, delete)
 * - Delete employee with confirmation
 * - Integration with global performance lock
 * - Automatic initialization of default performance data for new employees
 *
 * URL Parameters:
 * - provinceId: The province identifier
 * - employeeId: The employee identifier
 */
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

	// Extract performance management logic to custom hook
	const {
		localPerformance,
		hasUnsavedChanges,
		saving: performanceSaving,
		saveError: performanceSaveError,
		handleChange: handlePerformanceChange,
		handleSave: handleSavePerformance,
	} = usePerformanceManager(
		provinceId,
		employeeId,
		employee?.performance,
		refetch
	);

	const { mutate: deleteEmployee, loading: deleting } = useApiMutation(
		async () => {
			if (!provinceId || !employeeId) throw new Error("Missing identifiers");
			return await provinceApi.deleteEmployee(provinceId, employeeId);
		}
	);

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editSaving, setEditSaving] = useState(false);

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

		setEditSaving(true);
		try {
			const res = await provinceApi.updateEmployee(
				provinceId,
				employeeId,
				data
			);
			if (!res.success || !res.data) {
				console.error("Failed to update employee:", res.error);
				return;
			}
			await refetch();
			setEditDialogOpen(false);
		} catch (err) {
			console.error("Failed to update employee:", err);
		} finally {
			setEditSaving(false);
		}
	};

	if (loading) {
		return <LoadingView title="جزئیات کارمند" />;
	}

	if (error && !employee) {
		return (
			<ErrorView title="جزئیات کارمند" message={error} onRetry={refetch} />
		);
	}

	if (!employee) {
		return <ErrorView title="جزئیات کارمند" message="کارمند یافت نشد" />;
	}

	return (
		<>
			<NavBar
				title="جزئیات کارمند"
				backTo={
					provinceId
						? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
						: ROUTES.PROVINCES
				}
				backLabel="بازگشت به کارمندان"
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
						aria-label="ویرایش کارمند"
						size="medium"
					>
						ویرایش کارمند
					</Button>
					<Button
						variant="contained"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setDeleteDialogOpen(true)}
						aria-label="حذف کارمند"
						size="medium"
					>
						حذف کارمند
					</Button>
				</Box>

				{performanceSaveError && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{performanceSaveError}
					</Alert>
				)}

				<Stack spacing={3}>
					{/* Employee Information Card */}
					<EmployeeInfoCard employee={employee} />

					{/* Performance Section */}
					<Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 2,
								gap: 2,
								flexWrap: "wrap",
							}}
						>
							<Typography variant="h6">عملکرد ماه جاری</Typography>
							<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
								<FormControl sx={{ minWidth: 150 }} size="small">
									<InputLabel>وضعیت</InputLabel>
									<Select
										value={localPerformance?.status || "active"}
										label="وضعیت"
										onChange={(e) =>
											handlePerformanceChange("status", e.target.value)
										}
										disabled={settings?.performanceLocked}
									>
										<MenuItem value="active">فعال</MenuItem>
										<MenuItem value="inactive">غیرفعال</MenuItem>
										<MenuItem value="on_leave">در مرخصی</MenuItem>
									</Select>
								</FormControl>
								<Button
									variant="contained"
									color="primary"
									onClick={handleSavePerformance}
									disabled={
										performanceSaving ||
										!hasUnsavedChanges ||
										settings?.performanceLocked
									}
									size="small"
								>
									{performanceSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
								</Button>
							</Box>
						</Box>
						{localPerformance ? (
							<PerformanceDisplay
								performance={localPerformance}
								onChange={handlePerformanceChange}
								locked={
									settings?.performanceLocked ||
									localPerformance.status !== "active"
								}
							/>
						) : (
							<Typography color="text.secondary">
								داده عملکردی برای این کارمند در دسترس نیست.
							</Typography>
						)}
					</Box>
				</Stack>

				<Box sx={{ mt: 3 }}>
					<Button
						component={Link}
						to={
							provinceId
								? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
								: "/"
						}
						startIcon={<ArrowBackIcon sx={{ transform: "scaleX(-1)" }} />}
						disabled={!provinceId}
						aria-disabled={!provinceId}
						aria-label={
							provinceId ? "بازگشت به کارمندان" : "بازگشت در دسترس نیست"
						}
					>
						بازگشت به کارمندان
					</Button>
				</Box>

				<EditEmployeeDialog
					open={editDialogOpen}
					employee={employee}
					saving={editSaving}
					onClose={() => setEditDialogOpen(false)}
					onSave={handleSaveEdit}
				/>

				<ConfirmDialog
					open={deleteDialogOpen}
					title="تایید حذف"
					message="آیا مطمئن هستید که می‌خواهید این کارمند را حذف کنید؟ این عمل قابل بازگشت نیست."
					loading={deleting}
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleDelete}
				/>
			</Container>
		</>
	);
}
