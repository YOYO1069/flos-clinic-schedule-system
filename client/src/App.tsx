import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ScheduleHome from "./pages/ScheduleHome";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveCalendar from "./pages/LeaveCalendar";
import Login from "./pages/Login";
import UnifiedLogin from "./pages/UnifiedLogin";
import ChangePassword from "./pages/ChangePassword";
import AdminPanel from "./pages/AdminPanel";
import LeaveApproval from "./pages/LeaveApproval";
import CalendarSchedule from "./pages/CalendarSchedule";
// import TestEnv from "./pages/TestEnv"; // Temporarily disabled
import DoctorSchedule from "./pages/DoctorSchedule";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendanceManagement from "./pages/AttendanceManagement";
import AdvancedAttendanceManagement from "./pages/AdvancedAttendanceManagement";
import AttendanceSettings from "./pages/AttendanceSettings";
import SimpleAttendanceManagement from "./pages/SimpleAttendanceManagement";
import StaffManagement from "./pages/StaffManagement";
import OperationFee from "./pages/OperationFee";
import AccountManagement from "./pages/AccountManagement";
import PermissionManagement from "./pages/PermissionManagement";
import SecurityDashboardPage from "./pages/SecurityDashboardPage";
import { useAuth } from "./_core/hooks/useAuth";
import { useVisitorLog } from "./_core/hooks/useVisitorLog";

function Router() {
  // All routes except /login require authentication
  const [location] = useLocation();
  const { user } = useAuth();
  const { logVisit } = useVisitorLog();

  // 記錄頁面訪問
  useEffect(() => {
    // 將 user 轉換為 visitor log 所需的格式
    if (user) {
      // 如果 user 有 employee_id 屬性，直接使用
      const userData = 'employee_id' in user ? user as any : undefined;
      logVisit(userData);
    } else {
      logVisit(undefined);
    }
  }, [location, user]);

  return (
    <Switch>
      <Route path="/unified-login" component={UnifiedLogin} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/login" component={Login} />
      {/* <Route path="/test-env">
        <ProtectedRoute><TestEnv /></ProtectedRoute>
      </Route> */}
      <Route path="/attendance-dashboard">
        <ProtectedRoute><AttendanceDashboard /></ProtectedRoute>
      </Route>
      <Route path="/attendance-management">
        <ProtectedRoute><SimpleAttendanceManagement /></ProtectedRoute>
      </Route>
      <Route path="/advanced-attendance-management">
        <ProtectedRoute><AdvancedAttendanceManagement /></ProtectedRoute>
      </Route>
      <Route path="/simple-attendance">
        <ProtectedRoute><SimpleAttendanceManagement /></ProtectedRoute>
      </Route>
      <Route path="/attendance-settings">
        <ProtectedRoute><AttendanceSettings /></ProtectedRoute>
      </Route>
      <Route path="/employee-management">
        <ProtectedRoute><StaffManagement /></ProtectedRoute>
      </Route>
      <Route path="/account-management">
        <ProtectedRoute><AccountManagement /></ProtectedRoute>
      </Route>
      <Route path="/permission-management">
        <ProtectedRoute><PermissionManagement /></ProtectedRoute>
      </Route>
      <Route path="/operation-fee">
        <ProtectedRoute><OperationFee /></ProtectedRoute>
      </Route>
      <Route path="/security">
        <ProtectedRoute><SecurityDashboardPage /></ProtectedRoute>
      </Route>
      <Route path="/leave-calendar">
        <ProtectedRoute><LeaveCalendar /></ProtectedRoute>
      </Route>
      <Route path="/attendance">
        <ProtectedRoute><Attendance /></ProtectedRoute>
      </Route>
      <Route path="/doctor-schedule">
        <ProtectedRoute><DoctorSchedule /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><AdminPanel /></ProtectedRoute>
      </Route>
      <Route path="/leave-approval">
        <ProtectedRoute><LeaveApproval /></ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute><Home /></ProtectedRoute>
      </Route>
      <Route path="/schedule-overview">
        <ProtectedRoute><ScheduleHome /></ProtectedRoute>
      </Route>
      <Route path="/schedule">
        <ProtectedRoute><ScheduleHome /></ProtectedRoute>
      </Route>

      <Route path="/leave-management">
        <ProtectedRoute><LeaveManagement /></ProtectedRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
