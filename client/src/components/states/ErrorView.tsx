import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavBar from "../NavBar";

type ErrorViewProps = {
	/** Custom title for navbar (default: "خطا") */
	title?: string;
	/** Error message to display */
	message: string;
	/** Optional retry callback to show retry button */
	onRetry?: () => void;
	/** Optional additional content below the error */
	children?: React.ReactNode;
};

/**
 * Standardized error view with navbar, error message, and optional retry button
 *
 * Provides consistent error UI across the application.
 * Displays an error alert with optional retry button and additional content.
 *
 * @example
 * if (error) return <ErrorView message={error} onRetry={refetch} />;
 */
export function ErrorView({
	title = "خطا",
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
							تلاش مجدد
						</Button>
					</Box>
				)}
				{children}
			</Container>
		</>
	);
}
