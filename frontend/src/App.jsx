import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GateEntry from "./pages/GateEntry";
import VehicleQueue from "./pages/VehicleQueue";
import DockManagement from "./pages/DockManagement";
import VehicleTracking from "./pages/VehicleTracking";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import DisplayBoard from "./pages/DisplayBoard";
import PrivateRoute from "./components/PrivateRoute";
import DriverTracker from "./pages/DriverTracker";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/track/:token" element={<DriverTracker />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="gate-entry" element={<GateEntry />} />
        <Route path="vehicle-queue" element={<VehicleQueue />} />
        <Route path="dock-management" element={<DockManagement />} />
        <Route path="vehicle-tracking" element={<VehicleTracking />} />
        <Route path="reports" element={<Reports />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="display-board" element={<DisplayBoard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
