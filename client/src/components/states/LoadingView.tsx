import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import NavBar from "../NavBar";

type LoadingViewProps = {
	/** Custom title for navbar (default: "در حال بارگذاری...") */
	title?: string;
};

/**
 * Standardized loading view with navbar and centered spinner
 *
 * Provides consistent loading UI across the application.
 * Displays a navbar with customizable title and a centered loading spinner.
 *
 * @example
 * if (loading) return <LoadingView title="در حال بارگذاری کارمندان..." />;
 */
export function LoadingView({
	title = "در حال بارگذاری...",
}: LoadingViewProps) {
	return (
		<>
			<NavBar title={title} />
			<Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Container>
		</>
	);
}
