import { Navigate } from "react-router-dom";
import axios from "axios";
import api from "../api/api";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, ROUTES } from "../const/endpoints";

type ProtectedRouteProps = {
	children: JSX.Element;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		const checkAuthorization = async () => {
			try {
				await api.get(API_ENDPOINTS.PROVINCES);
				setAuthorized(true);
			} catch (err: unknown) {
				if (axios.isAxiosError(err)) {
					const status = err.response?.status;
					// A 403 here likely means the user is authenticated but not a global admin, which is still acceptable
					if (status === 403) {
						setAuthorized(true);
						return;
					}
				}
				setAuthorized(false);
			} finally {
				setLoading(false);
			}
		};

		checkAuthorization();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!authorized) {
		return <Navigate to={ROUTES.ROOT} replace />;
	}

	return children;
}
