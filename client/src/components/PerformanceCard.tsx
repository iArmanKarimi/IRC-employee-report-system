import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { IPerformance } from "../types/models";

type PerformanceCardProps = {
	performance: IPerformance;
	onEdit: () => void;
	onDelete: () => void;
};

export function PerformanceCard({
	performance,
	onEdit,
	onDelete,
}: PerformanceCardProps) {
	return (
		<Accordion>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
					<Typography sx={{ flex: 1, fontWeight: "medium" }}>
						{performance.month
							? `Performance: ${performance.month}`
							: "Performance Record"}
					</Typography>
					<Box
						sx={{ display: "flex", gap: 0.5 }}
						onClick={(e) => e.stopPropagation()}
					>
						<IconButton size="small" onClick={onEdit} color="primary">
							<EditIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" onClick={onDelete} color="error">
							<DeleteOutlineIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>
			</AccordionSummary>
			<AccordionDetails>
				<Stack spacing={1}>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Daily Performance:
						</Typography>
						<Typography variant="body2">
							{performance.dailyPerformance}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Shift Count per Location:
						</Typography>
						<Typography variant="body2">
							{performance.shiftCountPerLocation}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Shift Duration:
						</Typography>
						<Typography variant="body2">
							{performance.shiftDuration} hours
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Overtime:
						</Typography>
						<Typography variant="body2">
							{performance.overtime} hours
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Daily Leave:
						</Typography>
						<Typography variant="body2">{performance.dailyLeave}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Sick Leave:
						</Typography>
						<Typography variant="body2">{performance.sickLeave}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							Absence:
						</Typography>
						<Typography variant="body2">{performance.absence}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							{" "}
							Travel Assignment:
						</Typography>
						<Typography variant="body2">
							{performance.travelAssignment} days
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							{" "}
							Truck Driver:
						</Typography>
						<Typography variant="body2">
							{performance.truckDriver ? "Yes" : "No"}
						</Typography>
					</Box>
					{performance.notes && (
						<Box sx={{ mt: 1 }}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Notes:
							</Typography>
							<Typography variant="body2">{performance.notes}</Typography>
						</Box>
					)}
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
}
