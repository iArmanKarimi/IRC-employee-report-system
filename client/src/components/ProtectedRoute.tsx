import { Navigate } from "react-router-dom";
import api from "../api/api";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setAuthorized(true))
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!authorized) {
    return <Navigate to="/login" />;
  }
  return children;
}
