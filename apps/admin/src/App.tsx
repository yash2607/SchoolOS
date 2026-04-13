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
import { ParentDashboardPage } from "./pages/parent/ParentDashboard.js";
import { ParentAcademicsPage } from "./pages/parent/ParentAcademics.js";
import { ParentAttendancePage } from "./pages/parent/ParentAttendance.js";
import { ParentFeesPage } from "./pages/parent/ParentFees.js";
import { ParentMessagesPage } from "./pages/parent/ParentMessages.js";
import { ParentTimetablePage } from "./pages/parent/ParentTimetable.js";
import { StudentDashboardPage } from "./pages/student/StudentDashboard.js";
import { StudentAcademicsPage } from "./pages/student/StudentAcademics.js";
import { StudentAttendancePage } from "./pages/student/StudentAttendance.js";
import { StudentTimetablePage } from "./pages/student/StudentTimetable.js";
import { getDefaultPortalPath } from "./lib/portal.js";
import { useAuthStore } from "./store/authStore.js";

export default function App(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const defaultPath = getDefaultPortalPath(user?.role);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
      <Route path="/admin/academics" element={<ProtectedRoute><AcademicsPage /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/admin/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/admin/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="/parent/dashboard" element={<ProtectedRoute><ParentDashboardPage /></ProtectedRoute>} />
      <Route path="/parent/academics" element={<ProtectedRoute><ParentAcademicsPage /></ProtectedRoute>} />
      <Route path="/parent/attendance" element={<ProtectedRoute><ParentAttendancePage /></ProtectedRoute>} />
      <Route path="/parent/timetable" element={<ProtectedRoute><ParentTimetablePage /></ProtectedRoute>} />
      <Route path="/parent/fees" element={<ProtectedRoute><ParentFeesPage /></ProtectedRoute>} />
      <Route path="/parent/messages" element={<ProtectedRoute><ParentMessagesPage /></ProtectedRoute>} />

      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/academics" element={<ProtectedRoute><StudentAcademicsPage /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendancePage /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute><StudentTimetablePage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}
