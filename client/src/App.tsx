import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveCalendar from "./pages/LeaveCalendar";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import LeaveApproval from "./pages/LeaveApproval";
import CalendarSchedule from "./pages/CalendarSchedule";
import DoctorSchedule from "./pages/DoctorSchedule";
import Dashboard from "./pages/Dashboard";
import StaffManagement from "./pages/StaffManagement";
import ChangePassword from "./pages/ChangePassword";
import TestEnv from "./pages/TestEnv";
import TestDB from "./pages/TestDB";
import OperationFee from "./pages/OperationFee";
import AttendanceSettings from "./pages/AttendanceSettings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/test-env" component={TestEnv} />
      <Route path="/test-db" component={TestDB} />
      <Route path="/login" component={Login} />
      <Route path="/doctor-schedule" component={DoctorSchedule} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/approval" component={LeaveApproval} />
      <Route path={"/"} component={Dashboard} />
      <Route path="/leave-calendar" component={LeaveCalendar} />
      <Route path="/schedule" component={Home} />
      <Route path="/calendar" component={CalendarSchedule} />
      <Route path="/staff-management" component={StaffManagement} />
      <Route path="/staff-leave" component={LeaveCalendar} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/leave" component={LeaveManagement} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/operation-fee" component={OperationFee} />
      <Route path="/attendance-settings" component={AttendanceSettings} />
      <Route path={"/404"} component={NotFound} />
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
