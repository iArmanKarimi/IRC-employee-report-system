import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

type ConfirmDialogProps = {
	/** Whether the dialog is visible */
	open: boolean;
	/** Callback when dialog is closed without confirming */
	onClose: () => void;
	/** Callback when user confirms the action */
	onConfirm: () => void;
	/** Dialog title */
	title: string;
	/** Confirmation message/question */
	message: string;
	/** Whether an operation is in progress */
	loading?: boolean;
	/** Custom label for confirm button (default: "تأیید") */
	confirmLabel?: string;
	/** Custom label for cancel button (default: "لغو") */
	cancelLabel?: string;
	/** Color of confirm button (default: "error") */
	confirmColor?:
		| "inherit"
		| "primary"
		| "secondary"
		| "error"
		| "info"
		| "success"
		| "warning";
};

/**
 * Reusable confirmation dialog component
 *
 * Provides a standard UI for confirming destructive or important actions.
 * Automatically handles loading states and disables buttons during operations.
 *
 * @example
 * <ConfirmDialog
 *   open={deleteDialogOpen}
 *   title="تایید حذف"
 *   message="آیا مطمئن هستید؟"
 *   loading={deleting}
 *   onClose={() => setDeleteDialogOpen(false)}
 *   onConfirm={handleDelete}
 * />
 */
export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	loading = false,
	confirmLabel = "تأیید",
	cancelLabel = "لغو",
	confirmColor = "error",
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					{cancelLabel}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color={confirmColor}
					disabled={loading}
				>
					{loading ? "در حال پردازش..." : confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
