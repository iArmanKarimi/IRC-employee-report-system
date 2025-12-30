import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { InfoField } from "./common/InfoField";
import { toPersianDate } from "../utils/dateUtils";
import type { IEmployee } from "../types/models";

type EmployeeInfoCardProps = {
	/** Employee data to display */
	employee: IEmployee;
};

/**
 * EmployeeInfoCard Component
 *
 * Presentational component that displays employee basic information
 * in a formatted card layout. Handles null/undefined values gracefully.
 *
 * Displays:
 * - Basic Info: Name, National ID, Birth Date, Gender, Marital Status, Children Count
 * - Additional Specifications: Contact, Education, Addresses
 * - Workplace Info: Branch, Rank, Licensed Workplace, Truck Driver Status
 * - Job Dates: Start and End dates
 *
 * @example
 * <EmployeeInfoCard employee={employee} />
 */
export function EmployeeInfoCard({ employee }: EmployeeInfoCardProps) {
	const basic = employee.basicInfo;
	const additional = employee.additionalSpecifications;
	const workplace = employee.workPlace;

	return (
		<Card>
			<CardContent>
				<Typography variant="h6" sx={{ mb: 2 }}>
					اطلاعات پایه
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
					<InfoField label="نام" value={basic?.firstName} />
					<InfoField label="نام خانوادگی" value={basic?.lastName} />
					<InfoField label="کد ملی" value={basic?.nationalID} />
					<InfoField label="جنسیت" value={basic?.male ? "مرد" : "زن"} />
					<InfoField
						label="وضعیت تأهل"
						value={basic?.married ? "متأهل" : "مجرد"}
					/>
					<InfoField label="تعداد فرزندان" value={basic?.childrenCount} />
				</Box>

				<Divider sx={{ my: 3 }} />

				<Typography variant="h6" sx={{ mb: 2 }}>
					مشخصات تکمیلی
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
					<InfoField
						label="تاریخ تولد"
						value={toPersianDate(additional?.dateOfBirth, "text")}
					/>
					<InfoField label="شماره تماس" value={additional?.contactNumber} />
					<InfoField
						label="مدرک تحصیلی"
						value={additional?.educationalDegree}
					/>
					<InfoField label="راننده کامیون" value={additional?.truckDriver} />
					<InfoField
						label="تاریخ شروع کار"
						value={toPersianDate(additional?.jobStartDate, "text")}
					/>
					<InfoField
						label="تاریخ پایان کار"
						value={toPersianDate(additional?.jobEndDate, "text")}
					/>
				</Box>

				<Divider sx={{ my: 3 }} />

				<Typography variant="h6" sx={{ mb: 2 }}>
					اطلاعات شغلی
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
					<InfoField label="شعبه" value={workplace?.branch} />
					<InfoField label="رتبه" value={workplace?.rank} />
					<InfoField
						label="محل کار مجاز"
						value={workplace?.licensedWorkplace}
					/>
				</Box>
			</CardContent>
		</Card>
	);
}
