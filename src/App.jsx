import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SchedulePage from './pages/SchedulePage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// FLOS曜診所排班系統 - 獨立版本
// 只包含排班功能,不包含後台管理

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* 所有路徑都導向排班系統 */}
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="*" element={<SchedulePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
