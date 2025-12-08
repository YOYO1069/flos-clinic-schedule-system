import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveCalendar from "./pages/LeaveCalendar";
import Login from "./pages/Login";
import DoctorPortal from "./pages/DoctorPortal";
import NurseSOP from "./pages/NurseSOP";
import BeauticianSOP from "./pages/BeauticianSOP";
import AdminPanel from "./pages/AdminPanel";
import LeaveApproval from "./pages/LeaveApproval";
// import TestEnv from "./pages/TestEnv"; // Temporarily disabled
import DoctorSchedule from "./pages/DoctorSchedule";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import AttendanceManagement from "./pages/AttendanceManagement";
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
      <Route path="/login" component={Login} />
      {/* <Route path="/test-env">
        <ProtectedRoute><TestEnv /></ProtectedRoute>
      </Route> */}
      <Route path="/attendance-dashboard">
        <ProtectedRoute><AttendanceDashboard /></ProtectedRoute>
      </Route>
      <Route path="/security">
        <ProtectedRoute><SecurityDashboard /></ProtectedRoute>
      </Route>
      <Route path="/employee-dashboard">
        <ProtectedRoute><AttendanceDashboard /></ProtectedRoute>
      </Route>
      <Route path="/attendance-management">
        <ProtectedRoute><AttendanceManagement /></ProtectedRoute>
      </Route>
      <Route path="/doctor-schedule">
        <ProtectedRoute><DoctorSchedule /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><AdminPanel /></ProtectedRoute>
      </Route>
      <Route path="/doctor-portal">
        <ProtectedRoute><DoctorPortal /></ProtectedRoute>
      </Route>
      <Route path="/nurse-sop">
        <ProtectedRoute><NurseSOP /></ProtectedRoute>
      </Route>
      <Route path="/beautician-sop">
        <ProtectedRoute><BeauticianSOP /></ProtectedRoute>
      </Route>
      <Route path="/approval">
        <ProtectedRoute><LeaveApproval /></ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/leave-calendar">
        <ProtectedRoute><LeaveCalendar /></ProtectedRoute>
      </Route>
      <Route path="/schedule">
        <ProtectedRoute><Home /></ProtectedRoute>
      </Route>
      <Route path="/attendance">
        <ProtectedRoute><Attendance /></ProtectedRoute>
      </Route>
      <Route path="/leave">
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
