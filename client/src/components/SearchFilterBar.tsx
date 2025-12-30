import { useState } from "react";
import {
	Box,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	FormControlLabel,
	Checkbox,
	Stack,
	IconButton,
	Tooltip,
	InputAdornment,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Props for SearchFilterBar component
 */
interface SearchFilterBarProps {
	/** Callback when search term changes */
	onSearchChange: (searchTerm: string) => void;
	/** Callback when search field selection changes */
	onSearchFieldChange?: (field: string) => void;
	/** Callback when performance filter changes */
	onPerformanceFilterChange?: (metric: string, value: number | null) => void;
	/** Callback when toggle filters change */
	onToggleFiltersChange?: (filters: {
		maritalStatus: string;
		gender: string;
		status: string;
		truckDriverOnly: boolean;
	}) => void;
	/** Current search value */
	searchValue?: string;
	/** Current search field value */
	searchFieldValue?: string;
	/** Options for search field dropdown */
	searchFieldOptions?: { value: string; label: string }[];
	/** Current performance metric selection */
	performanceMetric?: string;
	/** Current performance value */
	performanceValue?: number;
	/** Current toggle filter values */
	toggleFilters?: {
		maritalStatus: string;
		gender: string;
		status: string;
		truckDriverOnly: boolean;
	};
}

/**
 * SearchFilterBar Component
 *
 * Comprehensive search and filter bar for employee lists.
 * Supports multiple filter types:
 * - Text search with field selection
 * - Performance metric filtering
 * - Toggle filters (marital status, gender, employment status, truck driver)
 *
 * All filter changes are communicated via callbacks for controlled behavior.
 *
 * @example
 * <SearchFilterBar
 *   onSearchChange={setSearchTerm}
 *   onSearchFieldChange={setSearchField}
 *   onToggleFiltersChange={setToggleFilters}
 *   searchValue={searchTerm}
 *   toggleFilters={toggleFilters}
 * />
 */
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
	toggleFilters = {
		maritalStatus: "",
		gender: "",
		status: "",
		truckDriverOnly: false,
	},
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
		{ value: "all", label: "همه فیلدها" },
		{ value: "name", label: "نام" },
		{ value: "nationalId", label: "کد ملی" },
		{ value: "contactNumber", label: "شماره تماس" },
		{ value: "branch", label: "شعبه" },
		{ value: "rank", label: "رتبه" },
		{ value: "province", label: "استان" },
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
		filterType: "maritalStatus" | "gender" | "status" | "truckDriverOnly",
		value: string | boolean
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
					<InputLabel>جستجو بر اساس</InputLabel>
					<Select
						value={localSearchField}
						onChange={handleSearchFieldChange}
						label="جستجو بر اساس"
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
					placeholder="مقدار جستجو را وارد کنید..."
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
									<Tooltip title="پاک کردن جستجو">
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
					<InputLabel>وضعیت تاهل</InputLabel>
					<Select
						value={localToggleFilters.maritalStatus}
						onChange={(e) =>
							handleToggleFilterChange("maritalStatus", e.target.value)
						}
						label="وضعیت تاهل"
					>
						<MenuItem value="">همه</MenuItem>
						<MenuItem value="married">متاهل</MenuItem>
						<MenuItem value="single">مجرد</MenuItem>
					</Select>
				</FormControl>

				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 90, md: 100 } }}
				>
					<InputLabel>جنسیت</InputLabel>
					<Select
						value={localToggleFilters.gender}
						onChange={(e) => handleToggleFilterChange("gender", e.target.value)}
						label="جنسیت"
					>
						<MenuItem value="">همه</MenuItem>
						<MenuItem value="male">مرد</MenuItem>
						<MenuItem value="female">زن</MenuItem>
					</Select>
				</FormControl>

				<FormControl
					size="small"
					sx={{ minWidth: { xs: "100%", sm: 90, md: 100 } }}
				>
					<InputLabel>وضعیت</InputLabel>
					<Select
						value={localToggleFilters.status}
						onChange={(e) => handleToggleFilterChange("status", e.target.value)}
						label="وضعیت"
					>
						<MenuItem value="">همه</MenuItem>
						<MenuItem value="active">فعال</MenuItem>
						<MenuItem value="inactive">غیرفعال</MenuItem>
						<MenuItem value="on_leave">در مرخصی</MenuItem>
					</Select>
				</FormControl>

				<FormControlLabel
					control={
						<Checkbox
							size="small"
							checked={localToggleFilters.truckDriverOnly}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleToggleFilterChange("truckDriverOnly", e.target.checked)
							}
						/>
					}
					label="رانندگان کامیون"
				/>
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
					<InputLabel>معیار</InputLabel>
					<Select
						value={localPerformanceMetric}
						onChange={handlePerformanceMetricChange}
						label="معیار"
					>
						<MenuItem value="">
							<em>انتخاب معیار...</em>
						</MenuItem>
						<MenuItem value="dailyPerformance">عملکرد روزانه</MenuItem>
						<MenuItem value="shiftCountPerLocation">
							تعداد شیفت در هر مکان
						</MenuItem>
						<MenuItem value="shiftDuration">مدت شیفت (ساعت)</MenuItem>
						<MenuItem value="overtime">اضافه کاری (ساعت)</MenuItem>
						<MenuItem value="dailyLeave">مرخصی روزانه</MenuItem>
						<MenuItem value="sickLeave">مرخصی استعلاجی</MenuItem>
						<MenuItem value="absence">غیبت</MenuItem>
						<MenuItem value="travelAssignment">ماموریت سفر (روز)</MenuItem>
						<MenuItem value="childrenCount">تعداد فرزندان</MenuItem>
					</Select>
				</FormControl>

				{/* Metric Value Filter */}
				{localPerformanceMetric && (
					<TextField
						label="مقدار"
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
