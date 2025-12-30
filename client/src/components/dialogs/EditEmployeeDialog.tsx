import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FormDialog } from "./FormDialog";
import { PersianDateInput } from "../PersianDateInput";
import { toPersianDate, toGregorianDate } from "../../utils/dateUtils";
import Box from "@mui/material/Box";
import type { IEmployee, UpdateEmployeeInput } from "../../types/models";

/**
 * Safely format a date value for the date input field (Persian format)
 * Returns empty string if the date is invalid
 */
function formatDateForInput(dateValue: any): string {
	if (!dateValue) return "";
	try {
		const date = new Date(dateValue);
		// Check if date is valid
		if (isNaN(date.getTime())) return "";
		// Convert Gregorian to Persian date
		return toPersianDate(date, "compact");
	} catch {
		return "";
	}
}

interface EditEmployeeDialogProps {
	open: boolean;
	employee: IEmployee;
	saving: boolean;
	onClose: () => void;
	onSave: (data: UpdateEmployeeInput) => void;
}

export function EditEmployeeDialog({
	open,
	employee,
	saving,
	onClose,
	onSave,
}: EditEmployeeDialogProps) {
	const [formData, setFormData] = useState<UpdateEmployeeInput>({});

	useEffect(() => {
		if (employee && open) {
			setFormData({
				basicInfo: { ...employee.basicInfo },
				workPlace: { ...employee.workPlace },
				additionalSpecifications: {
					...employee.additionalSpecifications,
					truckDriver: employee.additionalSpecifications?.truckDriver ?? false,
				},
			});
		}
	}, [employee, open]);

	const handleFieldChange = (path: string, value: any) => {
		setFormData((prev) => {
			const newData = { ...prev };
			const keys = path.split(".");
			let current: any = newData;

			for (let i = 0; i < keys.length - 1; i++) {
				const key = keys[i];
				if (!current[key]) {
					current[key] = {};
				}
				current = current[key];
			}

			current[keys[keys.length - 1]] = value;
			return newData;
		});
	};

	const handleSubmit = () => {
		// Convert Persian dates to Gregorian for backend
		const submissionData = { ...formData };
		if (submissionData.additionalSpecifications) {
			const additionalSpecs = { ...submissionData.additionalSpecifications };
			if (additionalSpecs.dateOfBirth) {
				const gregorianDate = toGregorianDate(
					additionalSpecs.dateOfBirth as string
				);
				if (gregorianDate) additionalSpecs.dateOfBirth = gregorianDate;
			}
			if (additionalSpecs.jobStartDate) {
				const gregorianDate = toGregorianDate(
					additionalSpecs.jobStartDate as string
				);
				if (gregorianDate) additionalSpecs.jobStartDate = gregorianDate;
			}
			if (additionalSpecs.jobEndDate) {
				const gregorianDate = toGregorianDate(
					additionalSpecs.jobEndDate as string
				);
				if (gregorianDate) additionalSpecs.jobEndDate = gregorianDate;
			}
			submissionData.additionalSpecifications = additionalSpecs;
		}
		onSave(submissionData);
	};

	return (
		<FormDialog
			open={open}
			title="ویرایش کارمند"
			loading={saving}
			onClose={onClose}
			onSave={handleSubmit}
		>
			<Stack spacing={3}>
				{/* Add margin to top of dialog content to prevent label collision */}
				<Box sx={{ mt: 2 }} />
				{/* Basic Information */}
				<Stack spacing={2}>
					<TextField
						label="نام"
						value={formData.basicInfo?.firstName || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.firstName", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="نام خانوادگی"
						value={formData.basicInfo?.lastName || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.lastName", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="کد ملی"
						value={formData.basicInfo?.nationalID || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.nationalID", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="جنسیت"
						select
						value={formData.basicInfo?.male ? "male" : "female"}
						onChange={(e) =>
							handleFieldChange("basicInfo.male", e.target.value === "male")
						}
						fullWidth
						required
					>
						<MenuItem value="male">مذکر</MenuItem>
						<MenuItem value="female">مونث</MenuItem>
					</TextField>
					<FormControlLabel
						control={
							<Checkbox
								checked={formData.basicInfo?.married || false}
								onChange={(e) =>
									handleFieldChange("basicInfo.married", e.target.checked)
								}
							/>
						}
						label="متاهل"
					/>
					<TextField
						label="تعداد فرزندان"
						type="number"
						value={formData.basicInfo?.childrenCount || 0}
						onChange={(e) =>
							handleFieldChange(
								"basicInfo.childrenCount",
								parseInt(e.target.value) || 0
							)
						}
						fullWidth
						disabled={!formData.basicInfo?.married}
					/>
				</Stack>

				{/* Work Place Information */}
				<Stack spacing={2}>
					<TextField
						label="شعبه"
						value={formData.workPlace?.branch || ""}
						onChange={(e) =>
							handleFieldChange("workPlace.branch", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="رتبه"
						value={formData.workPlace?.rank || ""}
						onChange={(e) =>
							handleFieldChange("workPlace.rank", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="محل کار مجاز"
						value={formData.workPlace?.licensedWorkplace || ""}
						onChange={(e) =>
							handleFieldChange("workPlace.licensedWorkplace", e.target.value)
						}
						fullWidth
						required
					/>
				</Stack>

				{/* Additional Specifications */}
				<Stack spacing={2}>
					<TextField
						label="مدرک تحصیلی"
						value={formData.additionalSpecifications?.educationalDegree || ""}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.educationalDegree",
								e.target.value
							)
						}
						fullWidth
						required
					/>
					<PersianDateInput
						label="تاریخ تولد"
						value={formatDateForInput(
							formData.additionalSpecifications?.dateOfBirth
						)}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.dateOfBirth",
								e.target.value
							)
						}
						sx={{ width: "100%" }}
						required
					/>
					<TextField
						label="شماره تماس"
						value={formData.additionalSpecifications?.contactNumber || ""}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.contactNumber",
								e.target.value
							)
						}
						fullWidth
						required
						inputProps={{ pattern: "\\d{11}" }}
						helperText="باید 11 رقم باشد"
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={
									formData.additionalSpecifications?.truckDriver || false
								}
								onChange={(e) =>
									handleFieldChange(
										"additionalSpecifications.truckDriver",
										e.target.checked
									)
								}
							/>
						}
						label="راننده کامیون"
					/>
					<PersianDateInput
						label="تاریخ شروع کار"
						value={formatDateForInput(
							formData.additionalSpecifications?.jobStartDate
						)}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.jobStartDate",
								e.target.value
							)
						}
						sx={{ width: "100%" }}
						required
					/>
					<PersianDateInput
						label="تاریخ پایان کار"
						value={formatDateForInput(
							formData.additionalSpecifications?.jobEndDate
						)}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.jobEndDate",
								e.target.value || undefined
							)
						}
						sx={{ width: "100%" }}
						applyConstraints={false}
					/>
					<TextField
						label="وضعیت"
						select
						value={formData.performance?.status || "active"}
						onChange={(e) =>
							handleFieldChange("performance.status", e.target.value)
						}
						fullWidth
					>
						<MenuItem value="active">فعال</MenuItem>
						<MenuItem value="inactive">غیرفعال</MenuItem>
						<MenuItem value="on_leave">در مرخصی</MenuItem>
					</TextField>
				</Stack>
			</Stack>
		</FormDialog>
	);
}
