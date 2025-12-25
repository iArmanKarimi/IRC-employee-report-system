import { useState } from "react";
import {
	Box,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Stack,
	IconButton,
	Tooltip,
	InputAdornment,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

interface SearchFilterBarProps {
	onSearchChange: (searchTerm: string) => void;
	onFilterChange: (filter: string) => void;
	onPerformanceFilterChange?: (metric: string, value: number | null) => void;
	searchValue?: string;
	filterValue?: string;
	performanceMetric?: string;
	performanceValue?: number;
}

export function SearchFilterBar({
	onSearchChange,
	onFilterChange,
	onPerformanceFilterChange,
	searchValue = "",
	filterValue = "",
	performanceMetric = "",
	performanceValue,
}: SearchFilterBarProps) {
	const [localSearch, setLocalSearch] = useState(searchValue);
	const [localFilter, setLocalFilter] = useState("");
	const [localPerformanceMetric, setLocalPerformanceMetric] =
		useState(performanceMetric);
	const [localPerformanceValue, setLocalPerformanceValue] = useState(
		performanceValue || ""
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLocalSearch(value);
		onSearchChange(value);
	};

	const handleSearchClear = () => {
		setLocalSearch("");
		onSearchChange("");
	};

	const handleFilterChange = (e: any) => {
		const value = e.target.value;
		setLocalFilter(value);
		onFilterChange(value);
	};

	const handlePerformanceMetricChange = (e: any) => {
		const metric = e.target.value;
		setLocalPerformanceMetric(metric);
		if (localPerformanceValue !== "") {
			onPerformanceFilterChange?.(metric, Number(localPerformanceValue));
		}
	};

	const handlePerformanceValueChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setLocalPerformanceValue(value);
		if (value !== "" && localPerformanceMetric) {
			onPerformanceFilterChange?.(localPerformanceMetric, Number(value));
		}
	};

	const handleClearPerformanceFilter = () => {
		setLocalPerformanceMetric("");
		setLocalPerformanceValue("");
		onPerformanceFilterChange?.("", null);
	};

	return (
		<Box
			sx={{
				display: "flex",
				gap: 2.5,
				alignItems: "flex-end",
				flexWrap: "wrap",
				p: 2,
				backgroundColor: "background.paper",
				borderRadius: 1,
				border: "1px solid",
				borderColor: "divider",
			}}
		>
			{/* Search Input */}
			<TextField
				placeholder="Search..."
				variant="outlined"
				size="small"
				value={localSearch}
				onChange={handleSearchChange}
				sx={{ flex: 1, minWidth: 250 }}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
						),
						endAdornment: localSearch && (
							<InputAdornment position="end">
								<Tooltip title="Clear search">
									<IconButton
										size="small"
										onClick={handleSearchClear}
										edge="end"
									>
										<ClearIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</InputAdornment>
						),
					},
				}}
			/>

			{/* Filter Dropdown */}
			<FormControl size="small" sx={{ minWidth: 100 }}>
				<InputLabel>Status</InputLabel>
				<Select
					value={localFilter}
					onChange={handleFilterChange}
					label="Status"
				>
					<MenuItem value="">All</MenuItem>
					<MenuItem value="active">Active</MenuItem>
					<MenuItem value="inactive">Inactive</MenuItem>
					<MenuItem value="on_leave">On Leave</MenuItem>
				</Select>
			</FormControl>

			{/* Performance Metric Filter */}
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<FormControl size="small" sx={{ minWidth: 180 }}>
					<InputLabel>Performance Metric</InputLabel>
					<Select
						value={localPerformanceMetric}
						onChange={handlePerformanceMetricChange}
						label="Performance Metric"
					>
						<MenuItem value="">
							<em>Select metric...</em>
						</MenuItem>
						<MenuItem value="dailyPerformance">Daily Performance</MenuItem>
						<MenuItem value="shiftCountPerLocation">
							Shift Count per Location
						</MenuItem>
						<MenuItem value="shiftDuration">Shift Duration (hours)</MenuItem>
						<MenuItem value="overtime">Overtime (hours)</MenuItem>
						<MenuItem value="dailyLeave">Daily Leave</MenuItem>
						<MenuItem value="sickLeave">Sick Leave</MenuItem>
						<MenuItem value="absence">Absence</MenuItem>
						<MenuItem value="travelAssignment">
							Travel Assignment (days)
						</MenuItem>
					</Select>
				</FormControl>

				{/* Performance Value Filter */}
				{localPerformanceMetric && (
					<>
						<TextField
							label="Value"
							type="number"
							size="small"
							value={localPerformanceValue}
							onChange={handlePerformanceValueChange}
							inputProps={{ min: 0 }}
							sx={{ width: 100 }}
						/>
						<IconButton
							size="small"
							onClick={handleClearPerformanceFilter}
							title="Clear performance filter"
							sx={{ mb: 0.5 }}
						>
							<ClearIcon fontSize="small" />
						</IconButton>
					</>
				)}
			</Stack>
		</Box>
	);
}
