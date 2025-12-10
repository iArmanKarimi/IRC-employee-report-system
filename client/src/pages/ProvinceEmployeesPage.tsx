import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
	provinceApi,
	type Employee,
	type PaginatedResponse,
	type Pagination,
} from "../api/api";
import { ROUTES } from "../const/endpoints";
import styles from "./ProvinceEmployeesPage.module.css";

type BasicName = { firstName?: string; lastName?: string; fullName?: string };

type EmployeesState = {
	data: Employee[];
	pagination: Pagination | null;
	_links?: Record<string, string>;
};

const formatEmployeeName = (emp: Employee): string => {
	const info = emp.basicInfo as BasicName | undefined;
	const full = info?.fullName?.trim();
	if (full) return full;

	const first = info?.firstName?.trim();
	const last = info?.lastName?.trim();
	const nameParts = [first, last].filter(Boolean);
	if (nameParts.length) return nameParts.join(" ");

	return emp._id;
};

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [state, setState] = useState<EmployeesState>({
		data: [],
		pagination: null,
	});
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const canGoPrev = useMemo(
		() => (state.pagination?.page ?? 1) > 1,
		[state.pagination]
	);
	const canGoNext = useMemo(
		() => (state.pagination?.page ?? 1) < (state.pagination?.pages ?? 1),
		[state.pagination]
	);

	useEffect(() => {
		if (!provinceId) {
			setError("Province ID is missing");
			setLoading(false);
			return;
		}

		const fetchEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
				const response: PaginatedResponse<Employee> =
					await provinceApi.listEmployees(provinceId, page, limit);
				setState({
					data: response.data ?? [],
					pagination: response.pagination,
					_links: response._links,
				});
			} catch (err) {
				setError("Failed to load employees");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployees();
	}, [provinceId, page, limit]);

	if (loading) {
		return (
			<div className={styles.container}>
				<div className={styles.statusCard}>Loading employees...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.statusCard}>{error}</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div>
					<h1 className={styles.title}>Employees</h1>
					<p className={styles.subtitle}>Province {provinceId ?? "N/A"}</p>
				</div>
				{state.pagination ? (
					<span className={styles.badge}>{state.pagination.total} total</span>
				) : null}
			</div>

			{state.data.length === 0 ? (
				<div className={styles.statusCard}>No employees found.</div>
			) : (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th className={styles.th}>Name</th>
								<th className={styles.th}>Province</th>
								<th className={styles.th}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{state.data.map((emp, index) => (
								<tr
									key={emp._id}
									className={index % 2 === 1 ? styles.rowStriped : undefined}
								>
									<td className={styles.td}>{formatEmployeeName(emp)}</td>
									<td className={styles.td}>{String(emp.provinceId)}</td>
									<td className={styles.td}>
										<Link
											className={styles.actionLink}
											to={ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
												":provinceId",
												provinceId ?? ""
											).replace(":employeeId", emp._id)}
										>
											View
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{state.pagination && (
				<div className={styles.pagination}>
					<button
						className={`${styles.button} ${
							canGoPrev ? "" : styles.buttonDisabled
						}`.trim()}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={!canGoPrev}
					>
						Prev
					</button>
					<span>
						Page {state.pagination.page} of {state.pagination.pages} (total{" "}
						{state.pagination.total})
					</span>
					<button
						className={`${styles.button} ${
							canGoNext ? "" : styles.buttonDisabled
						}`.trim()}
						onClick={() => setPage((p) => p + 1)}
						disabled={!canGoNext}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
