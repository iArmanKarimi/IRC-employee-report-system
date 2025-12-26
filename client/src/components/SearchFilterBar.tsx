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
	onSearchFieldChange?: (field: string) => void;
	onPerformanceFilterChange?: (metric: string, value: number | null) => void;
	onToggleFiltersChange?: (filters: {
		maritalStatus: string;
		gender: string;
		status: string;
	}) => void;
	searchValue?: string;
	searchFieldValue?: string;
	searchFieldOptions?: { value: string; label: string }[];
	performanceMetric?: string;
	performanceValue?: number;
	toggleFilters?: {
		maritalStatus: string;
		gender: string;
		status: string;
	};
}

export function SearchFilterBar({
	onSearchChange,
	onSearchFieldChange,
	onPerformanceFilterChange,
	onToggleFiltersChange,
	searchValue = "",
	searchFieldValue = "all",
	searchFieldOptions,
	performanceMetric = "",
	performanceValue,
	toggleFilters = { maritalStatus: "", gender: "", status: "" },
}: SearchFilterBarProps) {
	const [localSearch, setLocalSearch] = useState(searchValue);
	const [localSearchField, setLocalSearchField] = useState(searchFieldValue);
	const [localPerformanceMetric, setLocalPerformanceMetric] =
		useState(performanceMetric);
	const [localPerformanceValue, setLocalPerformanceValue] = useState(
		performanceValue || ""
	);
	const [localToggleFilters, setLocalToggleFilters] = useState(toggleFilters);

	const fieldOptions = searchFieldOptions ?? [
		{ value: "all", label: "All fields" },
		{ value: "name", label: "Name" },
		{ value: "nationalId", label: "National ID" },
		{ value: "contactNumber", label: "Contact number" },
		{ value: "branch", label: "Branch" },
		{ value: "rank", label: "Rank" },
		{ value: "province", label: "Province" },
	];

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLocalSearch(value);
		onSearchChange(value);
	};

	const handleSearchFieldChange = (e: any) => {
		const value = e.target.value;
		setLocalSearchField(value);
		onSearchFieldChange?.(value);
	};

	const handleSearchClear = () => {
		setLocalSearch("");
		onSearchChange("");
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

	const handleToggleFilterChange = (
		filterType: "maritalStatus" | "gender" | "status",
		value: string
	) => {
		const updatedFilters = { ...localToggleFilters, [filterType]: value };
		setLocalToggleFilters(updatedFilters);
		onToggleFiltersChange?.(updatedFilters);
	};

	return (
		<Box
			sx={{
				display: "flex",
				gap: { xs: 1.5, sm: 2, md: 2.5 },
				alignItems: { xs: "stretch", sm: "center" },
				flexDirection: { xs: "column", md: "row" },
				flexWrap: { md: "wrap" },
				p: { xs: 1.5, sm: 2 },
				backgroundColor: "background.paper",
				borderRadius: 1,
				border: "1px solid",
				borderColor: "divider",
			}}
		>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={{ xs: 1, sm: 1.5 }}
				alignItems="stretch"
				sx={{
					flex: { xs: "1 1 auto", md: 1 },
					minWidth: { xs: "100%", sm: 280, md: 320 },
					width: { xs: "100%", md: "auto" },
				}}
			>
				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 130, md: 150 } }}
				>
					<InputLabel>Search by</InputLabel>
					<Select
						value={localSearchField}
						onChange={handleSearchFieldChange}
						label="Search by"
					>
						{fieldOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{/* Search Input */}
				<TextField
					placeholder="Enter search value..."
					variant="outlined"
					size="small"
					value={localSearch}
					onChange={handleSearchChange}
					sx={{ flex: 1, minWidth: { xs: "100%", sm: 180, md: 200 } }}
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
			</Stack>

			{/* Toggle Filters Dropdown */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={{ xs: 1, sm: 1 }}
				alignItems="stretch"
				sx={{ width: { xs: "100%", md: "auto" } }}
			>
				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 120, md: 140 } }}
				>
					<InputLabel>Marital Status</InputLabel>
					<Select
						value={localToggleFilters.maritalStatus}
						onChange={(e) =>
							handleToggleFilterChange("maritalStatus", e.target.value)
						}
						label="Marital Status"
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="married">Married</MenuItem>
						<MenuItem value="single">Single</MenuItem>
					</Select>
				</FormControl>

				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 90, md: 100 } }}
				>
					<InputLabel>Gender</InputLabel>
					<Select
						value={localToggleFilters.gender}
						onChange={(e) => handleToggleFilterChange("gender", e.target.value)}
						label="Gender"
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="male">Male</MenuItem>
						<MenuItem value="female">Female</MenuItem>
					</Select>
				</FormControl>

				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 90, md: 100 } }}
				>
					<InputLabel>Status</InputLabel>
					<Select
						value={localToggleFilters.status}
						onChange={(e) => handleToggleFilterChange("status", e.target.value)}
						label="Status"
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="inactive">Inactive</MenuItem>
						<MenuItem value="on_leave">On Leave</MenuItem>
					</Select>
				</FormControl>
			</Stack>

			{/* Metric Filter */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={{ xs: 1, sm: 1 }}
				alignItems="stretch"
				sx={{ width: { xs: "100%", md: "auto" } }}
			>
				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 160, md: 180 } }}
				>
					<InputLabel>Metric</InputLabel>
					<Select
						value={localPerformanceMetric}
						onChange={handlePerformanceMetricChange}
						label="Metric"
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
						<MenuItem value="childrenCount">Children Count</MenuItem>
					</Select>
				</FormControl>

				{/* Metric Value Filter */}
				{localPerformanceMetric && (
					<TextField
						label="Value"
						type="number"
						size="small"
						value={localPerformanceValue}
						onChange={handlePerformanceValueChange}
						inputProps={{ min: 0 }}
						sx={{ width: { xs: "100%", sm: 90, md: 100 } }}
					/>
				)}
			</Stack>
		</Box>
	);
}
