import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { provinceApi, type Province } from "../api/api";
import { ROUTES } from "../const/endpoints";

export default function GlobalAdminDashboardPage() {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProvinces = async () => {
			try {
				const response = await provinceApi.list();
				setProvinces(response.data ?? []);
			} catch (err) {
				setError("Failed to load provinces");
			} finally {
				setLoading(false);
			}
		};

		fetchProvinces();
	}, []);

	if (loading) {
		return <div>Loading provinces...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	if (!provinces.length) {
		return <div>No provinces found.</div>;
	}

	return (
		<div style={{ padding: "1rem" }}>
			<h1>Provinces</h1>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th
							style={{
								textAlign: "left",
								borderBottom: "1px solid #ccc",
								padding: "0.5rem",
							}}
						>
							Name
						</th>
						<th
							style={{
								textAlign: "left",
								borderBottom: "1px solid #ccc",
								padding: "0.5rem",
							}}
						>
							Admin
						</th>
						<th
							style={{
								textAlign: "left",
								borderBottom: "1px solid #ccc",
								padding: "0.5rem",
							}}
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{provinces.map((province) => (
						<tr key={province._id}>
							<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
								{province.name ?? "Unnamed"}
							</td>
							<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
								{typeof province.admin === "object" &&
								province.admin &&
								"username" in province.admin
									? (province.admin as { username?: string }).username ??
									  "(unknown)"
									: "(not set)"}
							</td>
							<td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
								<Link
									to={ROUTES.PROVINCE_EMPLOYEES.replace(
										":provinceId",
										province._id
									)}
								>
									View employees
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
