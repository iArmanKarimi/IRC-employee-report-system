import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FormDialog } from "./FormDialog";
import { PersianDatePicker } from "../PersianDatePicker";
import type { IEmployee, UpdateEmployeeInput } from "../../types/models";

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
				additionalSpecifications: { ...employee.additionalSpecifications },
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
		onSave(formData);
	};

	return (
		<FormDialog
			open={open}
			title="Edit Employee"
			loading={saving}
			onClose={onClose}
			onSave={handleSubmit}
		>
			<Stack spacing={3}>
				{/* Basic Information */}
				<Stack spacing={2}>
					<TextField
						label="First Name"
						value={formData.basicInfo?.firstName || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.firstName", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="Last Name"
						value={formData.basicInfo?.lastName || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.lastName", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="National ID"
						value={formData.basicInfo?.nationalID || ""}
						onChange={(e) =>
							handleFieldChange("basicInfo.nationalID", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="Gender"
						select
						value={formData.basicInfo?.male ? "male" : "female"}
						onChange={(e) =>
							handleFieldChange("basicInfo.male", e.target.value === "male")
						}
						fullWidth
						required
					>
						<MenuItem value="male">Male</MenuItem>
						<MenuItem value="female">Female</MenuItem>
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
						label="Married"
					/>
					<TextField
						label="Children Count"
						type="number"
						value={formData.basicInfo?.childrenCount || 0}
						onChange={(e) =>
							handleFieldChange(
								"basicInfo.childrenCount",
								parseInt(e.target.value) || 0
							)
						}
						fullWidth
					/>
				</Stack>

				{/* Work Place Information */}
				<Stack spacing={2}>
					<TextField
						label="Branch"
						value={formData.workPlace?.branch || ""}
						onChange={(e) =>
							handleFieldChange("workPlace.branch", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="Rank"
						value={formData.workPlace?.rank || ""}
						onChange={(e) =>
							handleFieldChange("workPlace.rank", e.target.value)
						}
						fullWidth
						required
					/>
					<TextField
						label="Licensed Workplace"
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
						label="Educational Degree"
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
					<PersianDatePicker
						label="Date of Birth"
						value={
							formData.additionalSpecifications?.dateOfBirth
								? new Date(formData.additionalSpecifications.dateOfBirth)
										.toISOString()
										.split("T")[0]
								: ""
						}
						onChange={(value) =>
							handleFieldChange("additionalSpecifications.dateOfBirth", value)
						}
						fullWidth
						InputLabelProps={{ shrink: true }}
						required
					/>
					<TextField
						label="Contact Number"
						value={formData.additionalSpecifications?.contactNumber || ""}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.contactNumber",
								e.target.value
							)
						}
						fullWidth
						required
						helperText="Must be 10 digits"
					/>
					<PersianDatePicker
						label="Job Start Date"
						value={
							formData.additionalSpecifications?.jobStartDate
								? new Date(formData.additionalSpecifications.jobStartDate)
										.toISOString()
										.split("T")[0]
								: ""
						}
						onChange={(value) =>
							handleFieldChange("additionalSpecifications.jobStartDate", value)
						}
						fullWidth
						InputLabelProps={{ shrink: true }}
						required
					/>
					<PersianDatePicker
						label="Job End Date"
						value={
							formData.additionalSpecifications?.jobEndDate
								? new Date(formData.additionalSpecifications.jobEndDate)
										.toISOString()
										.split("T")[0]
								: ""
						}
						onChange={(value) =>
							handleFieldChange(
								"additionalSpecifications.jobEndDate",
								value ? value : undefined
							)
						}
						fullWidth
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						label="Status"
						select
						value={formData.additionalSpecifications?.status || "active"}
						onChange={(e) =>
							handleFieldChange(
								"additionalSpecifications.status",
								e.target.value
							)
						}
						fullWidth
					>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="inactive">Inactive</MenuItem>
						<MenuItem value="on_leave">On Leave</MenuItem>
					</TextField>
				</Stack>
			</Stack>
		</FormDialog>
	);
}
