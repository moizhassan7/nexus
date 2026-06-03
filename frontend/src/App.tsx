import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ApiScanner from "./pages/ApiScanner";
import CodeScanner from "./pages/CodeScanner";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NewScan from "./pages/NewScan";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import ScanHistory from "./pages/ScanHistory";
import ScanResults from "./pages/ScanResults";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan/new" element={<NewScan />} />
          <Route path="/scan/code" element={<CodeScanner />} />
          <Route path="/scan/api" element={<ApiScanner />} />
          <Route path="/scan/results/:id" element={<ScanResults />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
