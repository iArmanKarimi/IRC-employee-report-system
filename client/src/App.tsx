import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashBoard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Provinces from "./pages/Provinces";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/provinces"
        element={
          <ProtectedRoute>
            <Provinces />
          </ProtectedRoute>
        }
      ></Route>
    </Routes>
  );
}

export default App;
