import { TextField } from "@mui/material";
import { inputValueToPersian } from "../utils/dateUtils";
import type { TextFieldProps } from "@mui/material/TextField";

interface PersianDateInputProps extends Omit<TextFieldProps, "type"> {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	required?: boolean;
}

/**
 * Persian Date Input Component
 * Uses HTML5 date input but displays Persian date in helper text
 */
export function PersianDateInput({
	value,
	onChange,
	label,
	required,
	...props
}: PersianDateInputProps) {
	const persianDateText = value
		? inputValueToPersian(value, "text")
		: "تاریخ را انتخاب کنید";

	return (
		<TextField
			{...props}
			label={label}
			type="date"
			required={required}
			InputLabelProps={{ shrink: true }}
			value={value}
			onChange={onChange}
			helperText={persianDateText}
			FormHelperTextProps={{
				sx: { textAlign: "right", fontWeight: "bold", color: "primary.main" },
			}}
		/>
	);
}
