import { TextField, Box, Typography } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import { useState } from "react";
import { getCurrentPersianYear } from "../utils/dateUtils";

interface PersianDateInputProps
	extends Omit<TextFieldProps, "type" | "onChange" | "value"> {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	required?: boolean;
	applyConstraints?: boolean; // Whether to apply min/max constraints (for birth date, job start date)
}

/**
 * Persian Date Input Component
 * Three separate inputs for year, month, and day in Shamsi/Jalali format
 */
export function PersianDateInput({
	value,
	onChange,
	label,
	required,
	applyConstraints = true,
	sx,
	...props
}: PersianDateInputProps) {
	// Parse YYYY-MM-DD format - only initialize once, don't sync back from parent
	const [year, setYear] = useState(() => {
		if (value) {
			const parts = value.split("-");
			return parts.length === 3 ? parts[0] : "";
		}
		return "";
	});
	const [month, setMonth] = useState(() => {
		if (value) {
			const parts = value.split("-");
			return parts.length === 3 ? parts[1].replace(/^0+/, "") : "";
		}
		return "";
	});
	const [day, setDay] = useState(() => {
		if (value) {
			const parts = value.split("-");
			return parts.length === 3 ? parts[2].replace(/^0+/, "") : "";
		}
		return "";
	});

	const handlePartChange = (
		part: "year" | "month" | "day",
		newValue: string
	) => {
		// Only allow numbers
		if (newValue && !/^\d+$/.test(newValue)) return;

		// Apply constraints
		let constrainedValue = newValue;
		let updatedYear = year;
		let updatedMonth = month;
		let updatedDay = day;

		if (part === "day" && applyConstraints) {
			const dayNum = parseInt(newValue, 10);
			if (dayNum === 0) constrainedValue = "1";
			else if (dayNum > 31) constrainedValue = "31";
			setDay(constrainedValue);
			updatedDay = constrainedValue;
		} else if (part === "day") {
			setDay(newValue);
			updatedDay = newValue;
		}

		if (part === "month" && applyConstraints) {
			const monthNum = parseInt(newValue, 10);
			if (monthNum === 0) constrainedValue = "1";
			else if (monthNum > 12) constrainedValue = "12";
			setMonth(constrainedValue);
			updatedMonth = constrainedValue;
		} else if (part === "month") {
			setMonth(newValue);
			updatedMonth = newValue;
		}

		if (part === "year" && newValue.length === 4 && applyConstraints) {
			const yearNum = parseInt(newValue, 10);
			const currentYear = getCurrentPersianYear();
			const maxYear = currentYear - 18;

			if (yearNum < 1300) constrainedValue = "1300";
			else if (yearNum > maxYear) constrainedValue = maxYear.toString();

			setYear(constrainedValue);
			updatedYear = constrainedValue;
		} else if (part === "year") {
			setYear(newValue);
			updatedYear = newValue;
		}

		// Notify parent immediately with updated values
		notifyParent(updatedYear, updatedMonth, updatedDay);
	};

	const notifyParent = (
		currentYear?: string,
		currentMonth?: string,
		currentDay?: string
	) => {
		// Use provided values or fall back to state
		const y = currentYear !== undefined ? currentYear : year;
		const m = currentMonth !== undefined ? currentMonth : month;
		const d = currentDay !== undefined ? currentDay : day;

		// Only notify parent with combined value when all parts are provided
		if (y && m && d) {
			const combinedValue = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
			const syntheticEvent = {
				target: { value: combinedValue },
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(syntheticEvent);
		} else if (!y && !m && !d) {
			// All empty - send empty string
			const syntheticEvent = {
				target: { value: "" },
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(syntheticEvent);
		}
		// If partially filled, don't notify parent (keep local state only)
	};

	return (
		<Box sx={{ ...sx }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ mb: 0.5, display: "block" }}
			>
				{label} {required && <span style={{ color: "red" }}>*</span>}
			</Typography>
			<Box sx={{ display: "flex", gap: 1 }}>
				<TextField
					{...props}
					label="روز"
					type="text"
					inputProps={{
						maxLength: 2,
						dir: "ltr",
						style: { textAlign: "center" },
					}}
					value={day}
					onChange={(e) => handlePartChange("day", e.target.value)}
					required={required}
					sx={{ flex: 1 }}
				/>
				<TextField
					{...props}
					label="ماه"
					type="text"
					inputProps={{
						maxLength: 2,
						dir: "ltr",
						style: { textAlign: "center" },
					}}
					value={month}
					onChange={(e) => handlePartChange("month", e.target.value)}
					required={required}
					sx={{ flex: 1 }}
				/>
				<TextField
					{...props}
					label="سال"
					type="text"
					inputProps={{
						maxLength: 4,
						dir: "ltr",
						style: { textAlign: "center" },
					}}
					value={year}
					onChange={(e) => handlePartChange("year", e.target.value)}
					required={required}
					sx={{ flex: 2 }}
				/>
			</Box>
		</Box>
	);
}
