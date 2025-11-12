import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SchedulePage from './pages/SchedulePage'
import AttendancePage from './pages/AttendancePage'
import LeavePage from './pages/LeavePage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// FLOS曜診所排班與考勤管理系統
// 包含排班功能、員工打卡、請假管理

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* 排班系統 */}
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          
          {/* 考勤系統 */}
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          
          {/* 預設路徑 */}
          <Route path="*" element={<SchedulePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
