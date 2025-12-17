import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";

type EmptyStateProps = {
	message: string;
	action?: {
		label: string;
		onClick: () => void;
		icon?: ReactNode;
	};
};

/**
 * Standardized empty state component
 * Used when there's no data to display
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
