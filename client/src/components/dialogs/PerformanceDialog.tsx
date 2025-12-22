import { useState } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { FormDialog } from "./FormDialog";
import type { IPerformance } from "../../types/models";

type PerformanceDialogProps = {
	open: boolean;
	performance: IPerformance;
	saving: boolean;
	isEdit: boolean;
	onClose: () => void;
	onSave: (data: IPerformance) => Promise<void>;
};

export function PerformanceDialog({
	open,
	performance,
	saving,
	isEdit,
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
			title={isEdit ? "Edit Performance" : "Add Performance"}
			loading={saving}
			onClose={onClose}
			onSave={handleSave}
		>
			<Stack spacing={2}>
				<TextField
					label=""
					placeholder="Month (YYYY-MM)"
					type="month"
					required
					value={formData.month}
					onChange={(e) => handleFieldChange("month", e.target.value)}
					InputLabelProps={{ shrink: true }}
					helperText="Month (YYYY-MM)"
					fullWidth
					sx={{ mt: 2 }}
				/>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label="Daily Performance"
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
						label="Shift Count per Location"
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
						<InputLabel>Shift Duration</InputLabel>
						<Select
							value={formData.shiftDuration}
							label="Shift Duration"
							onChange={(e) =>
								handleFieldChange("shiftDuration", Number(e.target.value))
							}
						>
							<MenuItem value={8}>8 hours</MenuItem>
							<MenuItem value={12}>12 hours</MenuItem>
						</Select>
					</FormControl>
					<TextField
						label="Overtime (hours)"
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
						label="Daily Leave"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.dailyLeave}
						onChange={(e) =>
							handleFieldChange("dailyLeave", Number(e.target.value))
						}
					/>
					<TextField
						label="Sick Leave"
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
						label="Absence"
						type="number"
						inputProps={{ min: 0 }}
						sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
						value={formData.absence}
						onChange={(e) =>
							handleFieldChange("absence", Number(e.target.value))
						}
					/>
					<TextField
label="Travel Assignment (days)"
type="number"
inputProps={{ min: 0, max: 31 }}
sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 200 }}
value={formData.travelAssignment}
onChange={(e) =>
handleFieldChange("travelAssignment", Number(e.target.value))
}
/>
</Box>
				<FormControlLabel
					control={
						<Checkbox
							checked={formData.truckDriver}
							onChange={(e) =>
								handleFieldChange("truckDriver", e.target.checked)
							}
						/>
					}
					label="Truck Driver"
				/>
				<TextField
					label="Notes"
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
