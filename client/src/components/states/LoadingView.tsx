import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import NavBar from "../NavBar";

type LoadingViewProps = {
	title?: string;
};

/**
 * Standardized loading view with navbar and centered spinner
 */
export function LoadingView({ title = "Loading..." }: LoadingViewProps) {
	return (
		<>
			<NavBar title={title} />
			<Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Container>
		</>
	);
}
