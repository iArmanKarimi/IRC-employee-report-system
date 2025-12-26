import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

interface StatCardProps {
	title: string;
	value: number | string;
	subtitle?: string;
	color?: string;
	icon?: React.ReactNode;
}

export function StatCard({
	title,
	value,
	subtitle,
	color = "primary.main",
	icon,
}: StatCardProps) {
	return (
		<Card>
			<CardContent>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
					spacing={2}
				>
					<Box flex={1}>
						<Typography color="textSecondary" gutterBottom>
							{title}
						</Typography>
						<Typography variant="h5" component="div">
							{typeof value === "number" ? value.toLocaleString() : value}
						</Typography>
						{subtitle && (
							<Typography variant="caption" color="textSecondary">
								{subtitle}
							</Typography>
						)}
					</Box>
					{icon && (
						<Box
							sx={{
								bgcolor: color,
								borderRadius: "8px",
								p: 1.5,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
							}}
						>
							{icon}
						</Box>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}
