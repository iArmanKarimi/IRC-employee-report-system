import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import api from "../../api/api";
import { API_ENDPOINTS } from "../../const/endpoints";

vi.mock("../../api/api");

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should show loading state initially", () => {
		vi.mocked(api.get).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		expect(screen.getByText("Verifying authorization...")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("should render children when user is authorized (200 response)", async () => {
		vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await waitFor(() => {
			expect(screen.getByText("Protected Content")).toBeInTheDocument();
		});

		expect(api.get).toHaveBeenCalledWith(API_ENDPOINTS.PROVINCES);
	});

	it("should render children when user gets 403 (authenticated province admin)", async () => {
		const error = new Error("Forbidden");
		(error as any).response = { status: 403 };
		(error as any).isAxiosError = true;
		vi.mocked(api.get).mockRejectedValueOnce(error);

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await waitFor(() => {
			expect(screen.getByText("Protected Content")).toBeInTheDocument();
		});
	});

	it("should redirect to login when user is unauthorized (401)", async () => {
		const error = new Error("Unauthorized");
		(error as any).response = { status: 401 };
		(error as any).isAxiosError = true;
		vi.mocked(api.get).mockRejectedValueOnce(error);

		render(
			<MemoryRouter initialEntries={["/protected"]}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await waitFor(() => {
			expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
		});
	});

	it("should redirect to login on network error", async () => {
		vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));

		render(
			<MemoryRouter initialEntries={["/protected"]}>
				<ProtectedRoute>
					<div>Protected Content</div>
				</ProtectedRoute>
			</MemoryRouter>
		);

		await waitFor(() => {
			expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
		});
	});
});
