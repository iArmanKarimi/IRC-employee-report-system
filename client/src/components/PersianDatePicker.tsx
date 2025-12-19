import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Calendar } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

interface PersianDatePickerProps {
	label: string;
	value: string | Date;
	onChange: (value: string) => void;
	required?: boolean;
	fullWidth?: boolean;
	InputLabelProps?: any;
	sx?: any;
	error?: boolean;
	helperText?: string;
}

// Convert YYYY/MM/DD or YYYY-MM-DD to { year, month, day }
function dateStringToObject(
	dateStr: string
): { year: number; month: number; day: number } | null {
	if (!dateStr) return null;
	try {
		const [y, m, d] = dateStr.replace(/-/g, "/").split("/").map(Number);
		if (y && m && d) {
			return { year: y, month: m, day: d };
		}
	} catch {
		// Invalid date
	}
	return null;
}

// Convert { year, month, day } to YYYY/MM/DD
function dateObjectToString(dateObj: {
	year: number;
	month: number;
	day: number;
}): string {
	return `${dateObj.year}/${String(dateObj.month).padStart(2, "0")}/${String(
		dateObj.day
	).padStart(2, "0")}`;
}

export function PersianDatePicker({
	label,
	value,
	onChange,
	required = false,
	fullWidth = false,
	InputLabelProps,
	sx,
	error = false,
	helperText,
}: PersianDatePickerProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [inputValue, setInputValue] = useState<string>("");

	// Convert prop value to string format for display
	let displayValue = "";
	if (value) {
		if (typeof value === "string") {
			displayValue = value.replace(/-/g, "/");
		} else {
			const isoStr = new Date(value).toISOString().split("T")[0];
			displayValue = isoStr.replace(/-/g, "/");
		}
	}

	// Sync internal input when prop changes
	if (displayValue !== inputValue && displayValue) {
		setInputValue(displayValue);
	}

	const handleCalendarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDateChange = (
		dateObj: { year: number; month: number; day: number } | null
	) => {
		if (dateObj) {
			const dateStr = dateObjectToString(dateObj);
			setInputValue(dateStr);
			onChange(dateStr);
			setAnchorEl(null);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value;

		// Allow only digits and slashes
		newValue = newValue.replace(/[^\d\/]/g, "");

		// Auto-format as user types
		if (newValue.length === 4 && inputValue.length === 3) {
			newValue += "/";
		} else if (newValue.length === 7 && inputValue.length === 6) {
			newValue += "/";
		}

		// Limit to YYYY/MM/DD format length (10 characters)
		if (newValue.length > 10) {
			newValue = newValue.slice(0, 10);
		}

		setInputValue(newValue);

		// Only notify parent if we have a complete valid date
		if (newValue.length === 10 && newValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
			try {
				const [y, m, d] = newValue.split("/").map(Number);
				if (y > 1900 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
					onChange(newValue);
				}
			} catch {
				// Invalid date, don't notify parent
			}
		}
	};

	const open = Boolean(anchorEl);
	const selectedDate = dateStringToObject(inputValue);

	return (
		<Box sx={{ ...sx }}>
			<TextField
				label={label}
				type="text"
				placeholder="YYYY/MM/DD"
				value={inputValue}
				onChange={handleInputChange}
				required={required}
				fullWidth={fullWidth}
				InputLabelProps={{ shrink: true, ...InputLabelProps }}
				error={error}
				helperText={helperText}
				slotProps={{
					input: {
						endAdornment: (
							<IconButton
								onClick={handleCalendarClick}
								size="small"
								sx={{ mr: -1 }}
								title="Open Persian Calendar"
							>
								<CalendarTodayIcon fontSize="small" />
							</IconButton>
						),
					},
				}}
			/>

			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
			>
				<Box sx={{ p: 1 }}>
					<Calendar
						value={selectedDate}
						onChange={handleDateChange}
						locale="fa"
						calendarClassName="calendar"
						calendarTodayClassName="today"
						calendarRangeStartClassName="range-start"
						calendarRangeEndClassName="range-end"
						colorPrimary="#1976d2"
						colorPrimaryLight="rgba(25, 118, 210, 0.08)"
						shouldHighlightWeekends
					/>
				</Box>
			</Popover>
		</Box>
	);
}
