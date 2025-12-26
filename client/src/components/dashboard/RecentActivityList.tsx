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
import type { RecentActivityItem } from "../../api/api";

interface RecentActivityListProps {
	activities: RecentActivityItem[];
	loading?: boolean;
}

export function RecentActivityList({
	activities,
	loading,
}: RecentActivityListProps) {
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateString;
		}
	};

	return (
		<Card>
			<CardContent>
				<Typography variant="h6" gutterBottom>
					Recent Activity
				</Typography>
				<TableContainer component={Paper} sx={{ mt: 2 }}>
					<Table size="small">
						<TableHead>
							<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
								<TableCell>
									<strong>Employee Name</strong>
								</TableCell>
								<TableCell>
									<strong>Province</strong>
								</TableCell>
								<TableCell>
									<strong>Last Updated</strong>
								</TableCell>
								<TableCell>
									<strong>Created</strong>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={4} align="center">
										Loading...
									</TableCell>
								</TableRow>
							) : activities.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} align="center">
										No recent activity
									</TableCell>
								</TableRow>
							) : (
								activities.map((activity) => (
									<TableRow key={activity._id}>
										<TableCell>
											{activity.basicInfo.firstName}{" "}
											{activity.basicInfo.lastName}
										</TableCell>
										<TableCell>{activity.province.name}</TableCell>
										<TableCell>{formatDate(activity.updatedAt)}</TableCell>
										<TableCell>{formatDate(activity.createdAt)}</TableCell>
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
