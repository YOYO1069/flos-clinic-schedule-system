import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ScheduleHome from "./pages/ScheduleHome";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveCalendar from "./pages/LeaveCalendar";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import LeaveApproval from "./pages/LeaveApproval";
import CalendarSchedule from "./pages/CalendarSchedule";
import DoctorSchedule from "./pages/DoctorSchedule";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendanceManagement from "./pages/AttendanceManagement";

function Router() {
  // All routes except /login require authentication
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/test-env">
        <ProtectedRoute><TestEnv /></ProtectedRoute>
      </Route>
      <Route path="/attendance-dashboard">
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
      <Route path="/approval">
        <ProtectedRoute><LeaveApproval /></ProtectedRoute>
      </Route>
      <Route path="/">
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
