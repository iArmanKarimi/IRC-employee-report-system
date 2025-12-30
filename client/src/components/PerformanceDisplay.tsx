import React from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import type { IPerformance } from "../types/models";

interface PerformanceDisplayProps {
	performance: IPerformance;
	onChange: (key: keyof IPerformance, value: any) => void;
	locked?: boolean;
}

const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
	performance,
	onChange,
	locked,
}) => {
	return (
		<Stack spacing={2.5}>
			{locked && (
				<Alert severity="warning" icon={<LockIcon />}>
					سوابق عملکرد در حال حاضر قفل شده است. شما نمی‌توانید در این زمان
					تغییراتی ایجاد کنید.
				</Alert>
			)}
			<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
				<TextField
					label="عملکرد روزانه"
					type="number"
					required
				inputProps={{ min: 0, max: 31 }}
				sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
				value={performance.dailyPerformance}
				onChange={(e) => onChange("dailyPerformance", Number(e.target.value))}
			/>
			<TextField
				label="تعداد شیفت در هر مکان"
				type="number"
				required
				inputProps={{ min: 0, max: 31 }}
				/>
			</Box>

			<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
				<FormControl
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					required
				>
					<InputLabel>مدت شیفت</InputLabel>
					<Select
						value={performance.shiftDuration}
						label="مدت شیفت"
						onChange={(e) => onChange("shiftDuration", Number(e.target.value))}
					>
						<MenuItem value={8}>8 ساعت</MenuItem>
						<MenuItem value={16}>16 ساعت</MenuItem>
						<MenuItem value={24}>24 ساعت</MenuItem>
					</Select>
				</FormControl>
				<TextField
					label="اضافه کاری"
					type="number"
					inputProps={{ min: 0 }}
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					value={performance.overtime}
					onChange={(e) => onChange("overtime", Number(e.target.value))}
				/>
			</Box>

			<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
				<TextField
					label="مرخصی روزانه"
					type="number"
				inputProps={{ min: 0, max: 31 }}
				sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
				value={performance.dailyLeave}
				onChange={(e) => onChange("dailyLeave", Number(e.target.value))}
			/>
			<TextField
				label="مرخصی استعلاجی"
				type="number"
				inputProps={{ min: 0, max: 31 }}
			</Box>

			<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
				<TextField
					label="غیبت"
					type="number"
					inputProps={{ min: 0 }}
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					value={performance.absence}
					onChange={(e) => onChange("absence", Number(e.target.value))}
				/>
				<TextField
					label="ماموریت سفر"
					type="number"
					inputProps={{ min: 0 }}
					sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
					value={performance.travelAssignment}
					onChange={(e) => onChange("travelAssignment", Number(e.target.value))}
				/>
			</Box>
			<FormControl fullWidth>
				<InputLabel>وضعیت</InputLabel>
				<Select
					value={performance.status}
					label="وضعیت"
					onChange={(e) => onChange("status", e.target.value)}
				>
					<MenuItem value="active">فعال</MenuItem>
					<MenuItem value="inactive">غیرفعال</MenuItem>
					<MenuItem value="on_leave">در مرخصی</MenuItem>
				</Select>
			</FormControl>

			<TextField
				label="یادداشت‌ها"
				multiline
				rows={3}
				fullWidth
				value={performance.notes}
				onChange={(e) => onChange("notes", e.target.value)}
				placeholder="یادداشت‌های اضافی را اضافه کنید..."
			/>
		</Stack>
	);
};

export default PerformanceDisplay;
