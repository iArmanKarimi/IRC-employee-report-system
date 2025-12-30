import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type InfoFieldValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| (string | number)[];

type InfoFieldProps = {
	label: string;
	value: InfoFieldValue;
};

/**
 * Reusable info field component for displaying labeled data
 * Handles various value types and formats them appropriately
 */
export function InfoField({ label, value }: InfoFieldProps) {
	let displayValue: string;

	if (value === null || value === undefined || value === "") {
		displayValue = "-";
	} else if (typeof value === "boolean") {
		displayValue = value ? "بله" : "خیر";
	} else if (Array.isArray(value)) {
		displayValue = value.filter(Boolean).join(" و ") || "-";
	} else {
		displayValue = String(value);
	}

	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
			<Typography variant="body2" color="text.secondary">
				{label}:
			</Typography>
			<Typography variant="body2" sx={{ fontWeight: 500 }}>
				{displayValue}
			</Typography>
		</Box>
	);
}
