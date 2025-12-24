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
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

interface SearchFilterBarProps {
	onSearchChange: (searchTerm: string) => void;
	onFilterChange: (filter: string) => void;
	searchValue?: string;
	filterValue?: string;
}

export function SearchFilterBar({
	onSearchChange,
	onFilterChange,
	searchValue = "",
	filterValue = "",
}: SearchFilterBarProps) {
	const [localSearch, setLocalSearch] = useState(searchValue);
	const [localFilter, setLocalFilter] = useState(""); // Default to 'All' (empty string)

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

	return (
		<Box
			sx={{
				display: "flex",
				gap: 2,
				alignItems: "flex-end",
				flexWrap: "wrap",
				padding: 1.5,
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
				InputProps={{
					startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
					endAdornment: localSearch && (
						<Tooltip title="Clear search">
							<IconButton
								size="small"
								onClick={handleSearchClear}
								edge="end"
								sx={{ mr: -0.5 }}
							>
								<ClearIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					),
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
		</Box>
	);
}
