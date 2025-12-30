import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";

interface PersianDateInputProps extends Omit<TextFieldProps, "type"> {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	required?: boolean;
}

/**
 * Persian Date Input Component
 * Text input for entering dates in YYYY-MM-DD format (Shamsi/Jalali)
 */
export function PersianDateInput({
	value,
	onChange,
	label,
	required,
	...props
}: PersianDateInputProps) {
	return (
		<TextField
			{...props}
			label={label}
			type="text"
			required={required}
			value={value}
			onChange={onChange}
			placeholder="مثال: 1404-10-10"
			helperText="فرمت تاریخ: سال-ماه-روز (شمسی) مثال: 1404-10-10"
			FormHelperTextProps={{
				sx: { textAlign: "right", fontSize: "0.75rem" },
			}}
		/>
	);
}
