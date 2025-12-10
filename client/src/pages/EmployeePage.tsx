import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { provinceApi, Employee } from "../api/api";
import { ROUTES } from "../const/endpoints";

export default function EmployeePage() {
	const { provinceId, employeeId } = useParams<{
		provinceId: string;
		employeeId: string;
	}>();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!provinceId || !employeeId) {
			setError("Missing identifiers");
			setLoading(false);
			return;
		}

		const fetchEmployee = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await provinceApi.getEmployee(provinceId, employeeId);
				if (!res.success || !res.data) {
					setError(res.error || "Employee not found");
					return;
				}
				setEmployee(res.data);
			} catch (err) {
				setError("Failed to load employee");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployee();
	}, [provinceId, employeeId]);

	if (loading) {
		return <div>Loading employee...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	if (!employee) {
		return <div>Employee not found.</div>;
	}

	return (
		<div style={{ padding: "1rem" }}>
			<h1>Employee Details</h1>
			<pre
				style={{ background: "#f7f7f7", padding: "1rem", overflowX: "auto" }}
			>
				{JSON.stringify(employee, null, 2)}
			</pre>
			<div style={{ marginTop: "1rem" }}>
				<Link
					to={ROUTES.PROVINCE_EMPLOYEES.replace(
						":provinceId",
						provinceId || ""
					)}
				>
					Back to employees
				</Link>
			</div>
		</div>
	);
}
