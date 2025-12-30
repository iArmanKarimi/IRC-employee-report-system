import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Breadcrumbs from "../Breadcrumbs";

describe("Breadcrumbs", () => {
	it("should return null when no breadcrumb items exist", () => {
		const { container } = render(
			<MemoryRouter>
				<Breadcrumbs />
			</MemoryRouter>
		);

		expect(container.firstChild).toBeNull();
	});

	it("should show province name when provinceId is present", () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees"
						element={<Breadcrumbs provinceName="تهران" />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("تهران")).toBeInTheDocument();
	});

	it("should show provinces link when showProvincesLink is true", () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees"
						element={
							<Breadcrumbs provinceName="تهران" showProvincesLink={true} />
						}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("استان‌ها")).toBeInTheDocument();
	});

	it("should not show provinces link when showProvincesLink is false", () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees"
						element={
							<Breadcrumbs provinceName="تهران" showProvincesLink={false} />
						}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.queryByText("استان‌ها")).not.toBeInTheDocument();
	});

	it("should show new employee label when on new employee page", () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees/new"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees/new"
						element={<Breadcrumbs provinceName="تهران" />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("کارمند جدید")).toBeInTheDocument();
	});

	it("should show employee name when on employee detail page", () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees/456"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees/:employeeId"
						element={
							<Breadcrumbs provinceName="تهران" employeeName="علی محمدی" />
						}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("علی محمدی")).toBeInTheDocument();
	});

	it('should fall back to "کارمندان" when provinceName is too short', () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees"
						element={<Breadcrumbs provinceName="ت" />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("کارمندان")).toBeInTheDocument();
		expect(screen.queryByText("ت")).not.toBeInTheDocument();
	});

	it('should fall back to "کارمندان" when provinceName is empty', () => {
		render(
			<MemoryRouter initialEntries={["/provinces/123/employees"]}>
				<Routes>
					<Route
						path="/provinces/:provinceId/employees"
						element={<Breadcrumbs provinceName="" />}
					/>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText("کارمندان")).toBeInTheDocument();
	});
});
