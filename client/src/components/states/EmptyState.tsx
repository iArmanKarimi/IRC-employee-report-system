import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

type EmptyStateProps = {
	/** Message to display when no data exists */
	message: string;
	/** Optional action button configuration */
	action?: {
		/** Button label */
		label: string;
		/** Button click handler */
		onClick: () => void;
		/** Optional button icon */
		icon?: ReactNode;
	};
};

/**
 * Standardized empty state component
 *
 * Used when there's no data to display (e.g., empty lists).
 * Displays an informational alert with optional call-to-action button.
 *
 * @example
 * <EmptyState
 *   message="هنوز کارمندی ثبت نشده است"
 *   action={{
 *     label: "افزودن کارمند",
 *     onClick: handleAddEmployee,
 *     icon: <AddIcon />
 *   }}
 * />
 */
export function EmptyState({ message, action }: EmptyStateProps) {
	return (
		<Box>
			<Alert severity="info">{message}</Alert>
			{action && (
				<Box sx={{ mt: 2 }}>
					<Button
						variant="contained"
						onClick={action.onClick}
						startIcon={action.icon}
					>
						{action.label}
					</Button>
				</Box>
			)}
		</Box>
	);
}
