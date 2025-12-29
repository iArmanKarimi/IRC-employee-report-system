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
				<Box
					sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}
				>
					<Typography sx={{ flex: 1, fontWeight: "medium" }}>
						سابقه عملکرد
					</Typography>
					<Box
						sx={{ display: "flex", gap: 1 }}
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
				<Stack spacing={1.5}>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							عملکرد روزانه:
						</Typography>
						<Typography variant="body2">
							{performance.dailyPerformance}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							تعداد شیفت در هر مکان:
						</Typography>
						<Typography variant="body2">
							{performance.shiftCountPerLocation}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							مدت شیفت:
						</Typography>
						<Typography variant="body2">
							{performance.shiftDuration} ساعت
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							اضافه کاری:
						</Typography>
						<Typography variant="body2">{performance.overtime} ساعت</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							مرخصی روزانه:
						</Typography>
						<Typography variant="body2">{performance.dailyLeave}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							مرخصی استعلاجی:
						</Typography>
						<Typography variant="body2">{performance.sickLeave}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							غیبت:
						</Typography>
						<Typography variant="body2">{performance.absence}</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="body2" color="text.secondary">
							{" "}
							ماموریت سفر:
						</Typography>
						<Typography variant="body2">
							{performance.travelAssignment} روز
						</Typography>
					</Box>
					{performance.notes && (
						<Box sx={{ mt: 1 }}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								یادداشت‌ها:
							</Typography>
							<Typography variant="body2">{performance.notes}</Typography>
						</Box>
					)}
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
}
