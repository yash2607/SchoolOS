import "./lib/api.js";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { LoginPage } from "./pages/Login.js";
import { DashboardPage } from "./pages/Dashboard.js";
import { StudentsPage } from "./pages/Students.js";
import { TeachersPage } from "./pages/Teachers.js";
import { TimetablePage } from "./pages/Timetable.js";
import { AcademicsPage } from "./pages/Academics.js";
import { AttendancePage } from "./pages/Attendance.js";
import { FinancePage } from "./pages/Finance.js";
import { CommunicationPage } from "./pages/Communication.js";
import { SettingsPage } from "./pages/Settings.js";

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
      <Route path="/academics" element={<ProtectedRoute><AcademicsPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
