import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { translateStatus } from "../../utils/formatters";
import type { IPerformance } from "../../types/models";

type PerformanceSummaryTooltipProps = {
	performance: IPerformance;
};

type MetricRowProps = {
	label: string;
	value: string | number;
};

/**
 * Reusable metric row component for performance summary
 */
function MetricRow({ label, value }: MetricRowProps) {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Typography variant="caption" sx={{ flex: 1 }}>
				{label}
			</Typography>
			<Typography variant="caption" sx={{ fontWeight: 600 }}>
				{value}
			</Typography>
		</Box>
	);
}

/**
 * Performance Summary Tooltip Content
 * Used in employee list tooltips to display performance metrics
 */
export function PerformanceSummaryTooltip({
	performance,
}: PerformanceSummaryTooltipProps) {
	return (
		<Box sx={{ minWidth: 280 }}>
			<Typography
				variant="subtitle2"
				sx={{
					fontWeight: 600,
					mb: 1.5,
					color: "inherit",
				}}
			>
				خلاصه عملکرد
			</Typography>
			<Divider sx={{ mb: 2, opacity: 0.5 }} />
			<Stack spacing={1.5}>
				<MetricRow label="وضعیت" value={translateStatus(performance.status)} />
				<MetricRow label="عملکرد روزانه" value={performance.dailyPerformance} />
				<MetricRow label="مدت شیفت" value={`${performance.shiftDuration}h`} />
				<MetricRow label="اضافه کاری" value={`${performance.overtime}h`} />
				<MetricRow label="مرخصی روزانه" value={performance.dailyLeave} />
				<MetricRow label="مرخصی استعلاجی" value={performance.sickLeave} />
				<MetricRow label="غیبت" value={performance.absence} />
				<MetricRow
					label="ماموریت سفر"
					value={`${performance.travelAssignment}d`}
				/>
				<MetricRow
					label="تعداد شیفت/مکان"
					value={performance.shiftCountPerLocation}
				/>
			</Stack>
		</Box>
	);
}
