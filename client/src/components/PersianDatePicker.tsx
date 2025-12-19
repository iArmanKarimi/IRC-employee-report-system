import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { g2j, j2g, j2d } from "jalaali-js";

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

// Convert Gregorian date string (YYYY/MM/DD) to Persian (YYYY/MM/DD)
function gregorianToPersian(gregorianStr: string): string {
	if (!gregorianStr) return "";
	try {
		const [gy, gm, gd] = gregorianStr.split(/[-\/]/).map(Number);
		const [jy, jm, jd] = g2j(gy, gm, gd);
		return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(
			2,
			"0"
		)}`;
	} catch {
		return "";
	}
}

// Convert Persian date string (YYYY/MM/DD) to Gregorian (YYYY/MM/DD)
function persianToGregorian(persianStr: string): string {
	if (!persianStr) return "";
	try {
		const [jy, jm, jd] = persianStr.split(/[-\/]/).map(Number);
		const [gy, gm, gd] = j2g(jy, jm, jd);
		return `${gy}/${String(gm).padStart(2, "0")}/${String(gd).padStart(
			2,
			"0"
		)}`;
	} catch {
		return "";
	}
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
	const [persianValue, setPersianValue] = useState<string>("");
	const [calYear, setCalYear] = useState<number>(1403);
	const [calMonth, setCalMonth] = useState<number>(1);

	// Sync inputValue with value prop
	useEffect(() => {
		if (value) {
			let dateStr: string;
			if (typeof value === "string") {
				dateStr = value.replace(/-/g, "/");
			} else {
				const isoStr = new Date(value).toISOString().split("T")[0];
				dateStr = isoStr.replace(/-/g, "/");
			}
			setInputValue(dateStr);

			const persian = gregorianToPersian(dateStr);
			setPersianValue(persian);
			if (persian) {
				const [py, pm] = persian.split(/[-\/]/).map(Number);
				if (!isNaN(py) && !isNaN(pm)) {
					setCalYear(py);
					setCalMonth(pm);
				}
			}
		} else {
			setInputValue("");
			setPersianValue("");
		}
	}, [value]);

	const handleGregorianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		// Update local input state immediately for responsive typing
		setInputValue(newValue);

		// Only notify parent if we have a complete valid date
		if (newValue.length === 10 && newValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
			try {
				// Validate it's a real date
				const [y, m, d] = newValue.split("/").map(Number);
				if (y > 1900 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
					onChange(newValue);
				}
			} catch {
				// Invalid date, don't notify parent
			}
		}
	};

	const handleCalendarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDateSelect = (year: number, month: number, day: number) => {
		const persianStr = `${year}/${String(month).padStart(2, "0")}/${String(
			day
		).padStart(2, "0")}`;
		try {
			const gregorian = persianToGregorian(persianStr);
			setPersianValue(persianStr);
			setCalYear(year);
			setCalMonth(month);
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
		? parseInt(persianValue.split(/[-\/]/)[2])
		: null;

	return (
		<Box sx={{ ...sx }}>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<TextField
					label={label}
					type="text"
					placeholder="YYYY/MM/DD"
					value={inputValue}
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
