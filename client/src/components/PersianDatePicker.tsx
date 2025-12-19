import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
	const [selectedYear, setSelectedYear] = useState<number>(1404);
	const [selectedMonth, setSelectedMonth] = useState<number>(10);

	useEffect(() => {
		// Convert prop value to string format for display
		let displayValue = "";
		if (value) {
			if (typeof value === "string") {
				displayValue = value.replace(/-/g, "/");
			} else if (value instanceof Date) {
				// For Date objects, just use YYYY/MM/DD format (assuming Persian dates)
				const isoStr = value.toISOString().split("T")[0];
				displayValue = isoStr.replace(/-/g, "/");
			}
		}
		setInputValue(displayValue);

		// Update year/month for calendar display
		if (displayValue) {
			const [y, m] = displayValue.split("/").map(Number);
			setSelectedYear(y);
			setSelectedMonth(m);
		}
	}, [value]);

	const handleCalendarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const daysInMonth = (year: number, month: number): number => {
		if ([1, 2, 3, 4, 5, 6].includes(month)) return 31;
		if ([7, 8, 9, 10, 11].includes(month)) return 30;
		// Month 12
		const isLeap = ((((year - 1342) % 2820) % 128) % 33) % 4 === 1;
		return isLeap ? 30 : 29;
	};

	const firstDayOfMonth = (year: number, month: number): number => {
		// Simple Persian calendar first day calculation
		// Using a known reference point: 1/1/1400 was a Saturday (0)
		// Calculate total days from reference to target date
		const refYear = 1400;

		let totalDays = 0;

		// Add days for complete years
		for (let y = refYear; y < year; y++) {
			const isLeap = ((((y - 1342) % 2820) % 128) % 33) % 4 === 1;
			totalDays += isLeap ? 366 : 365;
		}

		// Add days for complete months in target year
		for (let m = 1; m < month; m++) {
			totalDays += daysInMonth(year, m);
		}

		// 1/1/1400 was Saturday (day 0), so add totalDays and mod 7
		return totalDays % 7;
	};

	const handleDateClick = (day: number) => {
		const dateStr = `${selectedYear}/${String(selectedMonth).padStart(
			2,
			"0"
		)}/${String(day).padStart(2, "0")}`;
		setInputValue(dateStr);
		onChange(dateStr);
		setAnchorEl(null);
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

		// Update year/month for calendar display
		if (newValue.length >= 5) {
			const parts = newValue.split("/");
			if (parts[0]) setSelectedYear(parseInt(parts[0]) || selectedYear);
			if (parts[1]) setSelectedMonth(Math.min(parseInt(parts[1]) || 1, 12));
		}

		// Only notify parent if we have a complete valid date
		if (newValue.length === 10 && newValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
			try {
				const [y, m, d] = newValue.split("/").map(Number);
				if (y > 1300 && y < 1500 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
					onChange(newValue);
				}
			} catch {
				// Invalid date, don't notify parent
			}
		}
	};

	const open = Boolean(anchorEl);
	const daysCount = daysInMonth(selectedYear, selectedMonth);
	const firstDay = firstDayOfMonth(selectedYear, selectedMonth);
	const days = Array.from({ length: daysCount }, (_, i) => i + 1);
	const calendarDays: (number | null)[] = Array(firstDay)
		.fill(null)
		.concat(days);

	const persianMonths = [
		"فروردین",
		"اردیبهشت",
		"خرداد",
		"تیر",
		"مرداد",
		"شهریور",
		"مهر",
		"آبان",
		"آذر",
		"دی",
		"بهمن",
		"اسفند",
	];

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
				PaperProps={{
					sx: {
						mt: 1,
						boxShadow: 3,
					},
				}}
			>
				<Box sx={{ p: 2, bgcolor: "background.paper", width: 280 }}>
					{/* Month and Year selector */}
					<Stack
						direction="row"
						spacing={1}
						justifyContent="space-between"
						alignItems="center"
						sx={{ mb: 2 }}
					>
						<Button
							size="small"
							onClick={() =>
								setSelectedMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)
							}
						>
							←
						</Button>
						<Typography
							variant="subtitle2"
							sx={{ minWidth: 120, textAlign: "center" }}
						>
							{persianMonths[selectedMonth - 1]} {selectedYear}
						</Typography>
						<Button
							size="small"
							onClick={() =>
								setSelectedMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)
							}
						>
							→
						</Button>
					</Stack>

					{/* Year selector */}
					<Stack
						direction="row"
						spacing={1}
						justifyContent="space-between"
						alignItems="center"
						sx={{ mb: 2 }}
					>
						<Button
							size="small"
							onClick={() => setSelectedYear(selectedYear - 1)}
						>
							-
						</Button>
						<Typography
							variant="body2"
							sx={{ minWidth: 120, textAlign: "center" }}
						>
							{selectedYear}
						</Typography>
						<Button
							size="small"
							onClick={() => setSelectedYear(selectedYear + 1)}
						>
							+
						</Button>
					</Stack>

					{/* Day headers */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(7, 1fr)",
							gap: 0.5,
							mb: 1,
						}}
					>
						{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => (
							<Typography
								key={day}
								variant="caption"
								sx={{ textAlign: "center", fontWeight: "bold" }}
							>
								{day}
							</Typography>
						))}
					</Box>

					{/* Calendar grid */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(7, 1fr)",
							gap: 0.5,
						}}
					>
						{calendarDays.map((day, idx) => (
							<Button
								key={idx}
								size="small"
								disabled={!day}
								onClick={() => day && handleDateClick(day)}
								sx={{
									minHeight: 32,
									p: 0,
									backgroundColor:
										day &&
										inputValue.includes(
											`/${String(selectedMonth).padStart(2, "0")}/${String(
												day
											).padStart(2, "0")}`
										)
											? "primary.main"
											: "transparent",
									color:
										day &&
										inputValue.includes(
											`/${String(selectedMonth).padStart(2, "0")}/${String(
												day
											).padStart(2, "0")}`
										)
											? "white"
											: "inherit",
									"&:hover": {
										backgroundColor: day ? "action.hover" : "transparent",
									},
									"&:disabled": {
										backgroundColor: "transparent",
										color: "transparent",
									},
								}}
							>
								{day}
							</Button>
						))}
					</Box>
				</Box>
			</Popover>
		</Box>
	);
}
