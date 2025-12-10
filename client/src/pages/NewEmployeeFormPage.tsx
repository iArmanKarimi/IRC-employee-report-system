import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { provinceApi } from "../api/api";
import { ROUTES } from "../const/endpoints";

type BasicInfoForm = {
	firstName: string;
	lastName: string;
	nationalID: string;
	male: boolean;
	married: boolean;
	childrenCount: number;
};

export default function NewEmployeeFormPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const navigate = useNavigate();
	const [form, setForm] = useState<BasicInfoForm>({
		firstName: "",
		lastName: "",
		nationalID: "",
		male: true,
		married: false,
		childrenCount: 0,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const update = (
		key: keyof BasicInfoForm,
		value: string | number | boolean
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!provinceId) {
			setError("Province ID is missing");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			await provinceApi.createEmployee(provinceId, {
				provinceId,
				basicInfo: {
					firstName: form.firstName,
					lastName: form.lastName,
					nationalID: form.nationalID,
					male: form.male,
					married: form.married,
					childrenCount: form.childrenCount,
				},
				workPlace: {},
				additionalSpecifications: {},
				performances: [],
			});
			navigate(ROUTES.PROVINCE_EMPLOYEES.replace(":provinceId", provinceId), {
				replace: true,
			});
		} catch (err) {
			setError("Failed to create employee");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "1rem", maxWidth: 480 }}>
			<h1>New Employee</h1>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
			>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>First Name</span>
					<input
						required
						value={form.firstName}
						onChange={(e) => update("firstName", e.target.value)}
					/>
				</label>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>Last Name</span>
					<input
						required
						value={form.lastName}
						onChange={(e) => update("lastName", e.target.value)}
					/>
				</label>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>National ID</span>
					<input
						required
						value={form.nationalID}
						onChange={(e) => update("nationalID", e.target.value)}
					/>
				</label>
				<label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
					<input
						type="checkbox"
						checked={form.male}
						onChange={(e) => update("male", e.target.checked)}
					/>
					<span>Male</span>
				</label>
				<label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
					<input
						type="checkbox"
						checked={form.married}
						onChange={(e) => update("married", e.target.checked)}
					/>
					<span>Married</span>
				</label>
				<label
					style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
				>
					<span>Children Count</span>
					<input
						type="number"
						min={0}
						value={form.childrenCount}
						onChange={(e) => update("childrenCount", Number(e.target.value))}
					/>
				</label>
				<button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create"}
				</button>
				{error && <div style={{ color: "red" }}>{error}</div>}
			</form>

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
