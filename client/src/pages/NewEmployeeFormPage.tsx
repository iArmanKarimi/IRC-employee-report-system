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
import Stack from "@mui/material/Stack";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { provinceApi } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";
import Breadcrumbs from "../components/Breadcrumbs";
import PerformanceAccordion from "../components/PerformanceAccordion";
import { useIsGlobalAdmin } from "../hooks/useAuth";
import type {
	CreateEmployeeInput,
	IBasicInfo,
	IWorkPlace,
	IAdditionalSpecifications,
	IPerformance,
} from "../types/models";

type EmployeeFormData = {
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
	performance: IPerformance;
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
			status: "active",
		},
		performance: {
			dailyPerformance: 0,
			shiftCountPerLocation: 0,
			shiftDuration: 8,
			overtime: 0,
			dailyLeave: 0,
			sickLeave: 0,
			absence: 0,
			volunteerShiftCount: 0,
			truckDriver: false,
			travelAssignment: 0,
			month: new Date().toISOString().slice(0, 7),
			notes: "",
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

	const updatePerformance = (key: keyof IPerformance, value: any) => {
		setForm((prev) => ({
			...prev,
			performance: {
				...prev.performance,
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
				performances: [form.performance],
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
			<NavBar
				title="New Employee"
				backTo={
					provinceId
						? ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId)
						: undefined
				}
				backLabel="Back to Employees"
			/>
			<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
				<Breadcrumbs showProvincesLink={isGlobalAdmin} />
				<Paper elevation={2} sx={{ p: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						New Employee
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Create a new employee record
					</Typography>

					<form onSubmit={handleSubmit}>
						<Stack spacing={4}>
							{/* Basic Info Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									Basic Information
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="First Name"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.firstName}
											onChange={(e) =>
												updateBasicInfo("firstName", e.target.value)
											}
										/>
										<TextField
											label="Last Name"
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
											label="National ID"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.basicInfo.nationalID}
											onChange={(e) =>
												updateBasicInfo("nationalID", e.target.value)
											}
										/>
										<TextField
											label="Children Count"
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
											label="Male"
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
											label="Married"
										/>
									</Box>
								</Stack>
							</Box>

							{/* WorkPlace Section */}
							<Box>
								<Typography variant="h6" gutterBottom>
									WorkPlace Information
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="Branch"
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
											label="Rank"
											required
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.workPlace.rank}
											onChange={(e) => updateWorkPlace("rank", e.target.value)}
										/>
										<TextField
											label="Licensed Workplace"
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
									Additional Specifications
								</Typography>
								<Stack spacing={2}>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="Educational Degree"
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
										<TextField
											label="Date of Birth"
											type="date"
											required
											InputLabelProps={{ shrink: true }}
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.dateOfBirth}
											onChange={(e) =>
												updateAdditionalSpecs("dateOfBirth", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="Contact Number"
											required
											inputProps={{ pattern: "\\d{11}" }}
											helperText="11 digits required"
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.contactNumber}
											onChange={(e) =>
												updateAdditionalSpecs("contactNumber", e.target.value)
											}
										/>
										<TextField
											label="Job Start Date"
											type="date"
											required
											InputLabelProps={{ shrink: true }}
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.jobStartDate}
											onChange={(e) =>
												updateAdditionalSpecs("jobStartDate", e.target.value)
											}
										/>
									</Box>
									<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
										<TextField
											label="Job End Date"
											type="date"
											InputLabelProps={{ shrink: true }}
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											value={form.additionalSpecifications.jobEndDate || ""}
											onChange={(e) =>
												updateAdditionalSpecs("jobEndDate", e.target.value)
											}
										/>
										<FormControl
											sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
											required
										>
											<InputLabel htmlFor="status-select">Status</InputLabel>
											<Select
												id="status-select"
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
									</Box>
								</Stack>
							</Box>

							{/* Performance Section */}
							<PerformanceAccordion
								performance={form.performance}
								index={0}
								onChange={updatePerformance}
							/>

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
						</Stack>
					</form>
				</Paper>
			</Container>
		</>
	);
}
