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
import { ConfirmDialog } from "./dialogs/ConfirmDialog";
import type { IPerformance } from "../types/models";

type PerformanceManagerProps = {
	performances: IPerformance[];
	saving: boolean;
	performanceLocked?: boolean;
	onAdd: (performance: IPerformance) => Promise<void>;
	onEdit: (index: number, performance: IPerformance) => Promise<void>;
	onDelete: (index: number) => Promise<void>;
};

export function PerformanceManager({
	performances,
	saving,
	performanceLocked,
	onAdd,
	onEdit,
	onDelete,
}: PerformanceManagerProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [performanceData, setPerformanceData] = useState<IPerformance | null>(
		null
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

	const handleAddClick = () => {
		setPerformanceData({
			dailyPerformance: 0,
			shiftCountPerLocation: 0,
			shiftDuration: 8,
			overtime: 0,
			dailyLeave: 0,
			sickLeave: 0,
			absence: 0,
			travelAssignment: 0,
			status: "active",
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

	const handleDeleteClick = (index: number) => {
		setDeletingIndex(index);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (deletingIndex !== null) {
			await onDelete(deletingIndex);
			setDeleteDialogOpen(false);
			setDeletingIndex(null);
		}
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
							mb: 3,
							gap: 2,
						}}
					>
						<Typography variant="h6" sx={{ m: 0 }}>
							Performance Records
						</Typography>
						<Button
							variant="contained"
							size="small"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							sx={{ whiteSpace: "nowrap" }}
						>
							Add Performance
						</Button>
					</Box>
					{performances.length === 0 ? (
						<Typography color="text.secondary">
							No performance records yet.
						</Typography>
					) : (
						<Stack spacing={1.5}>
							{performances.map((perf, index) => (
								<PerformanceCard
									key={index}
									performance={perf}
									onEdit={() => handleEditClick(index)}
									onDelete={() => handleDeleteClick(index)}
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
					performanceLocked={performanceLocked}
					onClose={() => setDialogOpen(false)}
					onSave={handleSave}
				/>
			)}

			<ConfirmDialog
				open={deleteDialogOpen}
				title="Confirm Delete"
				message="Are you sure you want to delete this performance record? This action cannot be undone."
				loading={saving}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
}
