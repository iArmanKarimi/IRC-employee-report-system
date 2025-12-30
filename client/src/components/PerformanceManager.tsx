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
	/** Array of performance records to display */
	performances: IPerformance[];
	/** Whether a save operation is in progress */
	saving: boolean;
	/** Whether performance editing is locked globally */
	performanceLocked?: boolean;
	/** Callback when adding a new performance record */
	onAdd: (performance: IPerformance) => Promise<void>;
	/** Callback when editing an existing performance record */
	onEdit: (index: number, performance: IPerformance) => Promise<void>;
	/** Callback when deleting a performance record */
	onDelete: (index: number) => Promise<void>;
};

/**
 * PerformanceManager Component
 *
 * Manages the display and CRUD operations for employee performance records.
 * Provides a UI for viewing, adding, editing, and deleting performance data.
 * Integrates with the global performance lock feature.
 *
 * @example
 * <PerformanceManager
 *   performances={employee.performance}
 *   saving={saving}
 *   performanceLocked={settings?.performanceLocked}
 *   onAdd={handleAddPerformance}
 *   onEdit={handleEditPerformance}
 *   onDelete={handleDeletePerformance}
 * />
 */
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

	/**
	 * Open dialog to add a new performance record with default values
	 */
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

	/**
	 * Open dialog to edit an existing performance record
	 * @param index - Index of the performance record to edit
	 */
	const handleEditClick = (index: number) => {
		setPerformanceData({ ...performances[index] });
		setEditingIndex(index);
		setDialogOpen(true);
	};

	/**
	 * Save performance data (calls onAdd for new or onEdit for existing)
	 * @param data - Performance data to save
	 */
	const handleSave = async (data: IPerformance) => {
		if (editingIndex !== null) {
			await onEdit(editingIndex, data);
		} else {
			await onAdd(data);
		}
		setDialogOpen(false);
	};

	/**
	 * Open confirmation dialog for deleting a performance record
	 * @param index - Index of the performance record to delete
	 */
	const handleDeleteClick = (index: number) => {
		setDeletingIndex(index);
		setDeleteDialogOpen(true);
	};

	/**
	 * Confirm and execute deletion of a performance record
	 */
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
							سوابق عملکرد
						</Typography>
						<Button
							variant="contained"
							size="small"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							sx={{ whiteSpace: "nowrap" }}
						>
							افزودن عملکرد
						</Button>
					</Box>
					{performances.length === 0 ? (
						<Typography color="text.secondary">
							هنوز سابقه عملکردی ثبت نشده است.
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
				title="تایید حذف"
				message="آیا مطمئن هستید که می‌خواهید این رکورد عملکرد را حذف کنید؟ این عمل قابل بازگشت نیست."
				loading={saving}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
}
