import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import BarChart from "@mui/icons-material/BarChart";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import type { ProvinceAnalytic } from "../../api/api";

interface EmployeeDistributionProps {
	provinces: ProvinceAnalytic[];
	loading?: boolean;
}

export function EmployeeDistribution({
	provinces,
	loading,
}: EmployeeDistributionProps) {
	if (loading) {
		return (
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Employee Distribution by Province
					</Typography>
					<Box sx={{ mt: 2 }}>
						<LinearProgress />
					</Box>
				</CardContent>
			</Card>
		);
	}

	const maxEmployees = Math.max(...provinces.map((p) => p.employeeCount), 1);

	return (
		<Card>
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
					<BarChart color="primary" />
					<Typography variant="h6">
						Employee Distribution by Province
					</Typography>
				</Stack>

				<Stack spacing={2}>
					{provinces.length === 0 ? (
						<Typography color="textSecondary">No data available</Typography>
					) : (
						provinces.map((province) => (
							<Box key={province._id}>
								<Stack
									direction="row"
									justifyContent="space-between"
									sx={{ mb: 0.5 }}
								>
									<Typography variant="body2">{province.name}</Typography>
									<Typography variant="body2" fontWeight="bold">
										{province.employeeCount}
									</Typography>
								</Stack>
								<LinearProgress
									variant="determinate"
									value={(province.employeeCount / maxEmployees) * 100}
									sx={{ height: 8, borderRadius: 4 }}
								/>
							</Box>
						))
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}
