import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import type {
	PerformanceStatus,
	RankDistribution,
	BranchDistribution,
} from "../../api/api";

interface PerformanceMetricsProps {
	byStatus: PerformanceStatus[];
	byRank: RankDistribution[];
	byBranch: BranchDistribution[];
	loading?: boolean;
}

export function PerformanceMetrics({
	byStatus,
	byRank,
	byBranch,
	loading,
}: PerformanceMetricsProps) {
	if (loading) {
		return (
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Performance Metrics
					</Typography>
					<Typography color="textSecondary">Loading...</Typography>
				</CardContent>
			</Card>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "active":
				return "success";
			case "inactive":
				return "error";
			case "on_leave":
				return "warning";
			default:
				return "default";
		}
	};

	return (
		<Grid container spacing={2}>
			{/* Performance by Status */}
			<Grid item xs={12} md={6}>
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Performance by Status
						</Typography>
						<Stack spacing={2}>
							{byStatus.length === 0 ? (
								<Typography color="textSecondary">No data available</Typography>
							) : (
								byStatus.map((status) => (
									<Box key={status._id}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
											sx={{ mb: 1 }}
										>
											<Chip
												label={status._id?.toUpperCase() || "Unknown"}
												color={getStatusColor(status._id)}
												size="small"
											/>
											<Typography variant="body2" fontWeight="bold">
												{status.count} employees
											</Typography>
										</Stack>
										<Stack
											direction="row"
											spacing={2}
											sx={{ fontSize: "0.875rem" }}
										>
											<Typography variant="caption">
												Avg Performance:{" "}
												<strong>{status.avgDailyPerformance.toFixed(1)}</strong>
											</Typography>
											<Typography variant="caption">
												Avg Overtime:{" "}
												<strong>{status.avgOvertime.toFixed(1)}h</strong>
											</Typography>
										</Stack>
									</Box>
								))
							)}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			{/* Top Ranks */}
			<Grid item xs={12} md={6}>
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Top 5 Ranks by Employee Count
						</Typography>
						<Stack spacing={1.5}>
							{byRank.length === 0 ? (
								<Typography color="textSecondary">No data available</Typography>
							) : (
								byRank.slice(0, 5).map((rank) => (
									<Box key={rank._id}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Typography variant="body2">
												{rank._id || "Unknown"}
											</Typography>
											<Chip
												label={`${rank.count} emp`}
												size="small"
												variant="outlined"
											/>
										</Stack>
										<Typography variant="caption" color="textSecondary">
											Avg Performance: {rank.avgDailyPerformance.toFixed(1)}
										</Typography>
									</Box>
								))
							)}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			{/* Top Branches */}
			<Grid item xs={12} md={6}>
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Top 5 Branches by Employee Count
						</Typography>
						<Stack spacing={1.5}>
							{byBranch.length === 0 ? (
								<Typography color="textSecondary">No data available</Typography>
							) : (
								byBranch.slice(0, 5).map((branch) => (
									<Box key={branch._id}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Typography variant="body2">
												{branch._id || "Unknown"}
											</Typography>
											<Chip
												label={`${branch.count} emp`}
												size="small"
												variant="outlined"
											/>
										</Stack>
										<Typography variant="caption" color="textSecondary">
											Avg Performance: {branch.avgPerformance.toFixed(1)}
										</Typography>
									</Box>
								))
							)}
						</Stack>
					</CardContent>
				</Card>
			</Grid>

			{/* Leave Summary */}
			{byStatus.length > 0 && (
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Leave Summary
							</Typography>
							<Stack spacing={1.5}>
								{byStatus.map((status) => (
									<Box key={`leave-${status._id}`}>
										<Typography variant="body2" fontWeight="bold">
											{status._id?.toUpperCase() || "Unknown"}
										</Typography>
										<Stack
											direction="row"
											spacing={2}
											sx={{ fontSize: "0.875rem", ml: 1 }}
										>
											<Typography variant="caption">
												Daily:{" "}
												<strong>{status.avgDailyLeave.toFixed(1)}</strong>
											</Typography>
											<Typography variant="caption">
												Sick: <strong>{status.avgSickLeave.toFixed(1)}</strong>
											</Typography>
											<Typography variant="caption">
												Absence: <strong>{status.avgAbsence.toFixed(1)}</strong>
											</Typography>
										</Stack>
									</Box>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			)}
		</Grid>
	);
}
