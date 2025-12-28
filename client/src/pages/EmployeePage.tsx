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
						"به‌روزرسانی کارمند با خطا مواجه شد. لطفا ورودی خود را بررسی کنید و دوباره تلاش کنید."
				);
				return;
			}
			await refetch();
			setEditDialogOpen(false);
		} catch (err) {
			setSaveError(
				"به‌روزرسانی کارمند با خطا مواجه شد. لطفا ورودی خود را بررسی کنید و دوباره تلاش کنید."
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
			"به‌روزرسانی سابقه عملکرد با خطا مواجه شد"
		);
		setHasUnsavedChanges(false);
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
				backLabel="بازگشت به کارکنان"
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
									اطلاعات اولیه
								</Typography>
								<Divider sx={{ mb: 2.5 }} />
								<Stack spacing={2}>
									<InfoField label="نام" value={employee.basicInfo.firstName} />
									<InfoField
										label="نام خانوادگی"
										value={employee.basicInfo.lastName}
									/>
									<InfoField
										label="کد ملی"
										value={employee.basicInfo.nationalID}
									/>
									<InfoField
										label="جنسیت"
										value={employee.basicInfo.male ? "مذکر" : "مونث"}
									/>
									<InfoField
										label="متاهل"
										value={employee.basicInfo.married ? "بله" : "خیر"}
									/>
									<InfoField
										label="تعداد فرزندان"
										value={employee.basicInfo.childrenCount}
									/>
								</Stack>
							</CardContent>
						</Card>

						<Card sx={{ flex: "1 1 400px" }}>
							<CardContent sx={{ pb: "24px !important" }}>
								<Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
									اطلاعات محل کار
								</Typography>
								<Divider sx={{ mb: 2.5 }} />
								<Stack spacing={2}>
									<InfoField label="شعبه" value={employee.workPlace.branch} />
									<InfoField label="رتبه" value={employee.workPlace.rank} />
									<InfoField
										label="محل کار مجاز"
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
								مشخصات اضافی
							</Typography>
							<Divider sx={{ mb: 2.5 }} />
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
								<InfoField
									label="مدرک تحصیلی"
									value={employee.additionalSpecifications.educationalDegree}
								/>
								<InfoField
									label="تاریخ تولد"
									value={new Date(
										employee.additionalSpecifications.dateOfBirth
									).toLocaleDateString()}
								/>
								<InfoField
									label="شماره تماس"
									value={employee.additionalSpecifications.contactNumber}
								/>
								<InfoField
									label="راننده کامیون"
									value={
										employee.additionalSpecifications.truckDriver
											? "بله"
											: "خیر"
									}
								/>
								<InfoField
									label="تاریخ شروع کار"
									value={new Date(
										employee.additionalSpecifications.jobStartDate
									).toLocaleDateString()}
								/>
								{employee.additionalSpecifications.jobEndDate && (
									<InfoField
										label="تاریخ پایان کار"
										value={new Date(
											employee.additionalSpecifications.jobEndDate
										).toLocaleDateString()}
									/>
								)}
								<Box>
									<Typography variant="caption" color="text.secondary">
										وضعیت
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
								<Typography variant="h6">عملکرد ماه جاری</Typography>
								<Button
									variant="contained"
									color="primary"
									onClick={handleSavePerformance}
									disabled={
										saving || !hasUnsavedChanges || settings?.performanceLocked
									}
									size="small"
								>
									{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
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
									داده عملکردی برای این کارمند در دسترس نیست.
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
						startIcon={<ArrowBackIcon sx={{ transform: "scaleX(-1)" }} />}
						disabled={!provinceId}
						aria-disabled={!provinceId}
						aria-label={
							provinceId ? "بازگشت به کارکنان" : "بازگشت در دسترس نیست"
						}
					>
						بازگشت به کارکنان
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
			return "موجود نیست";
		}
		if (typeof value === "boolean") {
			return value ? "بله" : "خیر";
		}
		if (value instanceof Date) {
			return value.toLocaleDateString();
		}
		if (Array.isArray(value)) {
			return value.join(", ") || "موجود نیست";
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
