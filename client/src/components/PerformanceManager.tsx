import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import { PerformanceCard } from "./PerformanceCard";
import { PerformanceDialog } from "./dialogs/PerformanceDialog";
import type { IPerformance } from "../types/models";

type PerformanceManagerProps = {
	performances: IPerformance[];
	saving: boolean;
	onAdd: (performance: IPerformance) => Promise<void>;
	onEdit: (index: number, performance: IPerformance) => Promise<void>;
	onDelete: (index: number) => Promise<void>;
};

export function PerformanceManager({
	performances,
	saving,
	onAdd,
	onEdit,
	onDelete,
}: PerformanceManagerProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [performanceData, setPerformanceData] = useState<IPerformance | null>(
		null
	);

	const handleAddClick = () => {
		const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
		setPerformanceData({
			dailyPerformance: 0,
			shiftCountPerLocation: 0,
			shiftDuration: 8,
			overtime: 0,
			dailyLeave: 0,
			sickLeave: 0,
			absence: 0,
			volunteerShiftCount: 0,
			truckDriver: false,
			month: currentMonth,
			notes: "",
		});
		setEditingIndex(null);
		setDialogOpen(true);
	};

	const handleEditClick = (index: number) => {
		setPerformanceData({ ...performances[index] });
		setEditingIndex(index);
		setDialogOpen(true);
	};

	const handleSave = async (data: IPerformance) => {
		if (editingIndex !== null) {
			await onEdit(editingIndex, data);
		} else {
			await onAdd(data);
		}
		setDialogOpen(false);
	};

	const handleDelete = async (index: number) => {
		await onDelete(index);
	};

	return (
		<>
			<Card>
				<CardContent>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6">Performance Records</Typography>
						<Button
							variant="contained"
							size="small"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
						>
							Add Performance
						</Button>
					</Box>
					{performances.length === 0 ? (
						<Typography color="text.secondary">
							No performance records yet.
						</Typography>
					) : (
						<Stack spacing={1}>
							{performances.map((perf, index) => (
								<PerformanceCard
									key={index}
									performance={perf}
									onEdit={() => handleEditClick(index)}
									onDelete={() => handleDelete(index)}
								/>
							))}
						</Stack>
					)}
				</CardContent>
			</Card>

			{performanceData && (
				<PerformanceDialog
					open={dialogOpen}
					performance={performanceData}
					saving={saving}
					isEdit={editingIndex !== null}
					onClose={() => setDialogOpen(false)}
					onSave={handleSave}
				/>
			)}
		</>
	);
}
