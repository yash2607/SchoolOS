import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/Dashboard.js";
import { LoginPage } from "./pages/Login.js";
import { StudentsPage } from "./pages/Students.js";
import { AttendancePage } from "./pages/Attendance.js";

// TODO: [PHASE-5] Add all remaining admin pages per Tech Spec Section 3
export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
