import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { jd2j, j2d } from "jalaali-js";

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

// Convert Gregorian date string (YYYY-MM-DD) to Persian (YYYY-MM-DD)
function gregorianToPersian(gregorianStr: string): string {
	if (!gregorianStr) return "";
	const [year, month, day] = gregorianStr.split("-").map(Number);
	const jDate = new Date(year, month - 1, day);
	const gregorianDayNumber =
		Math.floor(
			(jDate.getTime() - new Date(1970, 0, 1).getTime()) / (24 * 60 * 60 * 1000)
		) + 1;
	const [jy, jm, jd] = jd2j(gregorianDayNumber);
	return `${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}`;
}

// Convert Persian date string (YYYY-MM-DD) to Gregorian (YYYY-MM-DD)
function persianToGregorian(persianStr: string): string {
	if (!persianStr) return "";
	const [jy, jm, jd] = persianStr.split("-").map(Number);
	const gregorianDayNumber = j2d(jy, jm, jd);
	const date = new Date(1970, 0, gregorianDayNumber);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
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
	const [gregorianValue, setGregorianValue] = useState<string>("");
	const [persianValue, setPersianValue] = useState<string>("");
	const [calYear, setCalYear] = useState<number>(1403);
	const [calMonth, setCalMonth] = useState<number>(1);

	// Initialize with value
	useEffect(() => {
		if (value) {
			const dateStr =
				typeof value === "string"
					? value
					: new Date(value).toISOString().split("T")[0];
			setGregorianValue(dateStr);
			const persian = gregorianToPersian(dateStr);
			setPersianValue(persian);
			const [py, pm] = persian.split("-").map(Number);
			setCalYear(py);
			setCalMonth(pm);
		}
	}, [value]);

	const handleGregorianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setGregorianValue(newValue);
		if (newValue) {
			const persian = gregorianToPersian(newValue);
			setPersianValue(persian);
			onChange(newValue);
		}
	};

	const handleCalendarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDateSelect = (year: number, month: number, day: number) => {
		const persianStr = `${year}-${String(month).padStart(2, "0")}-${String(
			day
		).padStart(2, "0")}`;
		try {
			const gregorian = persianToGregorian(persianStr);
			setGregorianValue(gregorian);
			setPersianValue(persianStr);
			onChange(gregorian);
			setAnchorEl(null);
		} catch {
			// Invalid date
		}
	};

	const open = Boolean(anchorEl);

	// Generate calendar for current month
	const getDaysInMonth = (month: number) => {
		if (month <= 6) return 31;
		if (month <= 11) return 30;
		return 29; // Month 12 can be 29 or 30
	};

	const getFirstDayOfMonth = (year: number, month: number): number => {
		const firstDay = j2d(year, month, 1);
		const date = new Date(1970, 0, firstDay);
		return (date.getDay() + 1) % 7;
	};

	const daysInMonth = getDaysInMonth(calMonth);
	const firstDay = getFirstDayOfMonth(calYear, calMonth);
	const days: (number | null)[] = [];
	for (let i = 0; i < firstDay; i++) {
		days.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}

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

	const handlePrevMonth = () => {
		if (calMonth === 1) {
			setCalYear(calYear - 1);
			setCalMonth(12);
		} else {
			setCalMonth(calMonth - 1);
		}
	};

	const handleNextMonth = () => {
		if (calMonth === 12) {
			setCalYear(calYear + 1);
			setCalMonth(1);
		} else {
			setCalMonth(calMonth + 1);
		}
	};

	const selectedDay = persianValue
		? parseInt(persianValue.split("-")[2])
		: null;

	return (
		<Box sx={{ ...sx }}>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<TextField
					label={label}
					type="date"
					value={gregorianValue}
					onChange={handleGregorianChange}
					required={required}
					fullWidth={fullWidth}
					InputLabelProps={{ shrink: true, ...InputLabelProps }}
					error={error}
					helperText={helperText}
					sx={{ flex: "1 1 auto" }}
				/>
				<IconButton
					onClick={handleCalendarClick}
					size="small"
					sx={{ marginTop: 1 }}
					title="Open Persian Calendar"
				>
					<CalendarTodayIcon />
				</IconButton>
			</Stack>

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
				<Box sx={{ p: 2, minWidth: 320 }}>
					<Stack spacing={2}>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
						>
							<Button size="small" onClick={handlePrevMonth}>
								←
							</Button>
							<Typography variant="h6" align="center" sx={{ flex: 1 }}>
								{persianMonths[calMonth - 1]} {calYear}
							</Typography>
							<Button size="small" onClick={handleNextMonth}>
								→
							</Button>
						</Stack>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: "repeat(7, 1fr)",
								gap: 1,
							}}
						>
							{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => (
								<Typography
									key={day}
									variant="caption"
									align="center"
									sx={{ fontWeight: "bold" }}
								>
									{day}
								</Typography>
							))}
							{days.map((day, idx) => (
								<Button
									key={idx}
									onClick={() =>
										day && handleDateSelect(calYear, calMonth, day)
									}
									disabled={!day}
									variant={day === selectedDay ? "contained" : "outlined"}
									size="small"
									sx={{
										width: "100%",
										padding: 0.5,
										minHeight: 32,
									}}
								>
									{day}
								</Button>
							))}
						</Box>
					</Stack>
				</Box>
			</Popover>
		</Box>
	);
}
