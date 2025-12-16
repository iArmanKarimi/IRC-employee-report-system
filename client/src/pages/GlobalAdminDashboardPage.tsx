import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PeopleIcon from "@mui/icons-material/People";
import { provinceApi, type Province } from "../api/api";
import { ROUTES } from "../const/endpoints";
import NavBar from "../components/NavBar";

export default function GlobalAdminDashboardPage() {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProvinces = async () => {
			try {
				const response = await provinceApi.list();
				setProvinces(response.data ?? []);
			} catch (err) {
				setError("Failed to load provinces");
			} finally {
				setLoading(false);
			}
		};

		fetchProvinces();
	}, []);

	if (loading) {
		return (
			<>
				<NavBar title="Provinces - Global Admin" />
				<Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
					<CircularProgress />
				</Container>
			</>
		);
	}

	if (error) {
		return (
			<>
				<NavBar title="Provinces - Global Admin" />
				<Container sx={{ mt: 4 }}>
					<Alert severity="error">{error}</Alert>
				</Container>
			</>
		);
	}

	if (!provinces.length) {
		return (
			<>
				<NavBar title="Provinces - Global Admin" />
				<Container sx={{ mt: 4 }}>
					<Alert severity="info">No provinces found.</Alert>
				</Container>
			</>
		);
	}

	return (
		<>
			<NavBar title="Provinces - Global Admin" />
			<Container sx={{ mt: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Provinces
				</Typography>

				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Admin</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{provinces.map((province) => (
								<TableRow
									key={province._id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										{province.name ?? "Unnamed"}
									</TableCell>
									<TableCell>
										{typeof province.admin === "object" &&
										province.admin &&
										"username" in province.admin
											? (province.admin as { username?: string }).username ??
											  "(unknown)"
											: "(not set)"}
									</TableCell>
									<TableCell align="right">
										<Button
											component={Link}
											to={ROUTES.PROVINCE_EMPLOYEES.replace(
												":provinceId",
												province._id
											)}
											variant="outlined"
											size="small"
											startIcon={<PeopleIcon />}
										>
											View Employees
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Container>
		</>
	);
}
