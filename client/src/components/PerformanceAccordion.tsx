import React from "react";
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IPerformance } from "../types/models";

interface PerformanceAccordionProps {
	performance: IPerformance;
	index: number;
	onChange: (key: keyof IPerformance, value: any) => void;
}

const PerformanceAccordion: React.FC<PerformanceAccordionProps> = ({
	performance,
	index,
	onChange,
}) => {
	return (
		<Accordion defaultExpanded={index === 0}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography fontWeight="bold">{`Performance #${index + 1}`}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack spacing={2.5} sx={{ mt: 1 }}>
					<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
						<TextField
							label="Daily Performance"
							type="number"
							required
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.dailyPerformance}
							onChange={(e) =>
								onChange("dailyPerformance", Number(e.target.value))
							}
						/>
						<TextField
							label="Shift Count per Location"
							type="number"
							required
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.shiftCountPerLocation}
							onChange={(e) =>
								onChange("shiftCountPerLocation", Number(e.target.value))
							}
						/>
					</Box>
					<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
						<FormControl
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							required
						>
							<InputLabel>Shift Duration</InputLabel>
							<Select
								value={performance.shiftDuration}
								label="Shift Duration"
								onChange={(e) =>
									onChange("shiftDuration", Number(e.target.value))
								}
							>
								<MenuItem value={8}>8 hours</MenuItem>
								<MenuItem value={16}>16 hours</MenuItem>
								<MenuItem value={24}>24 hours</MenuItem>
							</Select>
						</FormControl>
						<TextField
							label="Overtime"
							type="number"
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.overtime}
							onChange={(e) => onChange("overtime", Number(e.target.value))}
						/>
					</Box>
					<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
						<TextField
							label="Daily Leave"
							type="number"
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.dailyLeave}
							onChange={(e) => onChange("dailyLeave", Number(e.target.value))}
						/>
						<TextField
							label="Sick Leave"
							type="number"
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.sickLeave}
							onChange={(e) => onChange("sickLeave", Number(e.target.value))}
						/>
					</Box>
					<Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
						<TextField
							label="Absence"
							type="number"
							inputProps={{ min: 0 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.absence}
							onChange={(e) => onChange("absence", Number(e.target.value))}
						/>
						<TextField
							label="Travel Assignment (days)"
							type="number"
							inputProps={{ min: 0, max: 31 }}
							sx={{ flex: "1 1 calc(50% - 12px)", minWidth: 200 }}
							value={performance.travelAssignment}
							onChange={(e) =>
								onChange("travelAssignment", Number(e.target.value))
							}
						/>
					</Box>
					<FormControl fullWidth>
						<InputLabel>Status</InputLabel>
						<Select
							value={performance.status || "active"}
							label="Status"
							onChange={(e) => onChange("status", e.target.value)}
						>
							<MenuItem value="active">Active</MenuItem>
							<MenuItem value="inactive">Inactive</MenuItem>
							<MenuItem value="on_leave">On Leave</MenuItem>
						</Select>
					</FormControl>
					<TextField
						label="Notes"
						multiline
						rows={2}
						value={performance.notes || ""}
						onChange={(e) => onChange("notes", e.target.value)}
						fullWidth
					/>
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
};

export default PerformanceAccordion;
