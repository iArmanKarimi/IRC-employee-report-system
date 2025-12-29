import { useState } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LockIcon from "@mui/icons-material/Lock";
import { FormDialog } from "./FormDialog";
import type { IPerformance } from "../../types/models";

type PerformanceDialogProps = {
	open: boolean;
	performance: IPerformance;
	saving: boolean;
	performanceLocked?: boolean;
	onClose: () => void;
	onSave: (data: IPerformance) => Promise<void>;
};

export function PerformanceDialog({
	open,
	performance,
	saving,
	performanceLocked,
	onClose,
	onSave,
}: PerformanceDialogProps) {
	const [formData, setFormData] = useState<IPerformance>(performance);

	const handleFieldChange = (field: keyof IPerformance, value: any) => {
		setFormData({
			...formData,
			[field]: value,
		});
	};

	const handleSave = async () => {
		await onSave(formData);
	};

	return (
		<FormDialog
			open={open}
			title="ویرایش عملکرد"
			loading={saving}
			onClose={onClose}
			onSave={handleSave}
			saveDisabled={performanceLocked}
		>
			<Stack spacing={2}>
				{performanceLocked && (
					<Alert severity="error" icon={<LockIcon />}>
						ویرایش عملکرد در حال حاضر توسط مدیر کل قفل شده است. شما نمی‌توانید
						در این زمان تغییراتی ایجاد کنید.
					</Alert>
				)}
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label="عملکرد روزانه"
						type="number"
						required
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.dailyPerformance}
						onChange={(e) =>
							handleFieldChange("dailyPerformance", Number(e.target.value))
						}
					/>
					<TextField
						label="تعداد شیفت در هر مکان"
						type="number"
						required
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.shiftCountPerLocation}
						onChange={(e) =>
							handleFieldChange("shiftCountPerLocation", Number(e.target.value))
						}
					/>
				</Box>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<FormControl
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						required
					>
						<InputLabel>مدت شیفت</InputLabel>
						<Select
							value={formData.shiftDuration}
							label="مدت شیفت"
							onChange={(e) =>
								handleFieldChange("shiftDuration", Number(e.target.value))
							}
						>
							<MenuItem value={8}>8 ساعت</MenuItem>
							<MenuItem value={12}>12 ساعت</MenuItem>
						</Select>
					</FormControl>
					<TextField
						label="اضافه کاری (ساعت)"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.overtime}
						onChange={(e) =>
							handleFieldChange("overtime", Number(e.target.value))
						}
					/>
				</Box>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label="مرخصی روزانه"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.dailyLeave}
						onChange={(e) =>
							handleFieldChange("dailyLeave", Number(e.target.value))
						}
					/>
					<TextField
						label="مرخصی استعلاجی"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.sickLeave}
						onChange={(e) =>
							handleFieldChange("sickLeave", Number(e.target.value))
						}
					/>
				</Box>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label="غیبت"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.absence}
						onChange={(e) =>
							handleFieldChange("absence", Number(e.target.value))
						}
					/>
					<TextField
						label="ماموریت سفر (روز)"
						type="number"
						inputProps={{ min: 0, max: 31 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.travelAssignment}
						onChange={(e) =>
							handleFieldChange("travelAssignment", Number(e.target.value))
						}
					/>
				</Box>
				<TextField
					label="یادداشت‌ها"
					multiline
					rows={3}
					value={formData.notes}
					onChange={(e) => handleFieldChange("notes", e.target.value)}
					fullWidth
				/>
			</Stack>
		</FormDialog>
	);
}
