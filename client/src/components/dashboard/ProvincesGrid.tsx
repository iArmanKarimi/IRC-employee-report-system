import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import type { ProvinceOverview } from "../../api/api";

interface ProvincesGridProps {
	provinces: ProvinceOverview[];
	loading?: boolean;
}

export function ProvincesGrid({ provinces, loading }: ProvincesGridProps) {
	const getPerformanceColor = (avg: number) => {
		if (avg >= 80) return "success";
		if (avg >= 60) return "warning";
		return "error";
	};

	return (
		<Card>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					All Provinces Overview
				</Typography>
				<TableContainer component={Paper} sx={{ mt: 2 }}>
					<Table size="small">
						<TableHead>
							<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
								<TableCell>
									<strong>Province</strong>
								</TableCell>
								<TableCell align="right">
									<strong>Total Employees</strong>
								</TableCell>
								<TableCell align="right">
									<strong>Active Employees</strong>
								</TableCell>
								<TableCell align="right">
									<strong>Avg Performance</strong>
								</TableCell>
								<TableCell>
									<strong>Admin</strong>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} align="center">
										Loading...
									</TableCell>
								</TableRow>
							) : provinces.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center">
										No provinces found
									</TableCell>
								</TableRow>
							) : (
								provinces.map((province) => (
									<TableRow key={province._id}>
										<TableCell>{province.name}</TableCell>
										<TableCell align="right">
											{province.employeeCount}
										</TableCell>
										<TableCell align="right">
											{province.activeEmployeeCount}
										</TableCell>
										<TableCell align="right">
											<Chip
												label={`${province.avgEmployeePerformance.toFixed(1)}%`}
												size="small"
												color={getPerformanceColor(
													province.avgEmployeePerformance
												)}
												variant="outlined"
											/>
										</TableCell>
										<TableCell>{province.admin.username}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
		</Card>
	);
}
