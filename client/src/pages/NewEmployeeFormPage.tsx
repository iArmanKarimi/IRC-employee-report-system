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
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { provinceApi } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import { PersianDateInput } from "../components/PersianDateInput";
import { useIsGlobalAdmin } from "../hooks/useAuth";
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
	const { isGlobalAdmin } = useIsGlobalAdmin();
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
			branch: "",
			rank: "",
			licensedWorkplace: "",
		},
		additionalSpecifications: {
			educationalDegree: "",
			dateOfBirth: "",
			contactNumber: "",
			jobStartDate: "",
			jobEndDate: undefined,
			truckDriver: false,
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

	const updateWorkPlace = (key: keyof IWorkPlace, value: string) => {
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
			setError("شناسه استان موجود نیست");
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
			};
			await provinceApi.createEmployee(provinceId, payload);
			navigate(ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId), {
				replace: true,
			});
		} catch (err) {
			setError("ایجاد کارمند با خطا مواجه شد");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavBar
				title="کارمند جدید"
				backTo={
					provinceId
						? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
						: undefined
				}
				backLabel="بازگشت به کارکنان"
			/>
			<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
				<Breadcrumbs showProvincesLink={isGlobalAdmin} />
				<Paper elevation={2} sx={{ p: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						کارمند جدید
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						ایجاد سابقه کارمند جدید
					</Typography>

					<form onSubmit={handleSubmit}>
						<Stack spacing={4}>
							{/* Basic Info Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									اطلاعات اولیه
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="نام"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.firstName}
											onChange={(e) =>
												updateBasicInfo("firstName", e.target.value)
											}
										/>
										<TextField
											label="نام خانوادگی"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.lastName}
											onChange={(e) =>
												updateBasicInfo("lastName", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="کد ملی"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.nationalID}
											onChange={(e) =>
												updateBasicInfo("nationalID", e.target.value)
											}
										/>
										<TextField
											label="تعداد فرزندان"
											type="number"
											inputProps={{ min: 0 }}
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.childrenCount}
											onChange={(e) =>
												updateBasicInfo("childrenCount", Number(e.target.value))
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2 }}>
										<FormControlLabel
											control={
												<Checkbox
													checked={form.basicInfo.male}
													onChange={(e) =>
														updateBasicInfo("male", e.target.checked)
													}
												/>
											}
											label="مذکر"
										/>
										<FormControlLabel
											control={
												<Checkbox
													checked={form.basicInfo.married}
													onChange={(e) =>
														updateBasicInfo("married", e.target.checked)
													}
												/>
											}
											label="متاهل"
										/>
									</Box>
								</Stack>
							</Box>

							{/* WorkPlace Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									اطلاعات محل کار
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="شعبه"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.workPlace.branch}
											onChange={(e) =>
												updateWorkPlace("branch", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="رتبه"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.workPlace.rank}
											onChange={(e) => updateWorkPlace("rank", e.target.value)}
										/>
										<TextField
											label="محل کار مجاز"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.workPlace.licensedWorkplace}
											onChange={(e) =>
												updateWorkPlace("licensedWorkplace", e.target.value)
											}
										/>
									</Box>
								</Stack>
							</Box>

							{/* Additional Specifications Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									مشخصات اضافی
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="مدرک تحصیلی"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.educationalDegree}
											onChange={(e) =>
												updateAdditionalSpecs(
													"educationalDegree",
													e.target.value
												)
											}
										/>
										<PersianDateInput
											label="تاریخ تولد"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.dateOfBirth}
											onChange={(e) =>
												updateAdditionalSpecs("dateOfBirth", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="شماره تماس"
											required
											inputProps={{ pattern: "\\d{11}" }}
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.contactNumber}
											onChange={(e) =>
												updateAdditionalSpecs("contactNumber", e.target.value)
											}
										/>
										<PersianDateInput
											label="تاریخ شروع کار"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.jobStartDate}
											onChange={(e) =>
												updateAdditionalSpecs("jobStartDate", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<PersianDateInput
											label="تاریخ پایان کار"
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.jobEndDate || ""}
											onChange={(e) =>
												updateAdditionalSpecs("jobEndDate", e.target.value)
											}
										/>
									</Box>
								</Stack>
							</Box>

							<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
								<Button
									component={Link}
									to={ROUTES.PROVINCE_EMPLOYEES.replace(
										":provinceId",
										provinceId || ""
									)}
									variant="outlined"
									startIcon={<ArrowBackIcon sx={{ transform: "scaleX(-1)" }} />}
								>
									لغو
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									startIcon={<SaveIcon />}
								>
									{loading ? "در حال ایجاد..." : "ایجاد کارمند"}
								</Button>
							</Box>

							{error && <Alert severity="error">{error}</Alert>}
						</Stack>
					</form>
				</Paper>
			</Container>
		</>
	);
}
