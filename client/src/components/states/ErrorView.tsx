import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavBar from "../NavBar";

type ErrorViewProps = {
	title?: string;
	message: string;
	onRetry?: () => void;
	children?: React.ReactNode;
};

/**
 * Standardized error view with navbar, error message, and optional retry button
 */
export function ErrorView({
	title = "Error",
	message,
	onRetry,
	children,
}: ErrorViewProps) {
	return (
		<>
			<NavBar title={title} />
			<Container sx={{ mt: 4 }}>
				<Alert severity="error" sx={{ mb: 2 }}>
					{message}
				</Alert>
				{onRetry && (
					<Box sx={{ mt: 2 }}>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={onRetry}
						>
							Retry
						</Button>
					</Box>
				)}
				{children}
			</Container>
		</>
	);
}
