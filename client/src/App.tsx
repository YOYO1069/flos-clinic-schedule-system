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
import StaffManagement from "./pages/StaffManagement";
import StaffLeaveCalendar from "./pages/StaffLeaveCalendar";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/approval" component={LeaveApproval} />
      <Route path={"/"} component={LeaveCalendar} />
      <Route path="/schedule" component={Home} />
      <Route path="/calendar" component={CalendarSchedule} />
      <Route path="/doctor-schedule" component={DoctorSchedule} />
      <Route path="/staff-management" component={StaffManagement} />
      <Route path="/staff-leave" component={StaffLeaveCalendar} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/leave" component={LeaveManagement} />
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
