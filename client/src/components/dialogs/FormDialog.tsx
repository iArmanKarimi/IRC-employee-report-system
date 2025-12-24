import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

type FormDialogProps = {
	open: boolean;
	onClose: () => void;
	onSave: () => void;
	title: string;
	children: ReactNode;
	loading?: boolean;
	saveLabel?: string;
	cancelLabel?: string;
	maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
	fullWidth?: boolean;
};

/**
 * Reusable dialog component for forms
 * Provides consistent layout with title, content area, and action buttons
 */
export function FormDialog({
	open,
	onClose,
	onSave,
	title,
	children,
	loading = false,
	saveLabel = "Save",
	cancelLabel = "Cancel",
	maxWidth = "md",
	fullWidth = true,
}: FormDialogProps) {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={maxWidth}
			fullWidth={fullWidth}
		>
			<form onSubmit={handleSubmit}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>{children}</DialogContent>
				<DialogActions>
					<Button type="button" onClick={onClose} disabled={loading}>
						{cancelLabel}
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={loading}
						color="primary"
					>
						{loading ? "Saving..." : saveLabel}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
