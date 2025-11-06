import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, LogIn, LogOut, Calendar, User, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function StaffPortalPage() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [staffId, setStaffId] = useState('')
  const [loginName, setLoginName] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(false)

  // 員工名單（與諾詢師選單相同）
  const staffList = [
    '萬晴', '陳韻安', '劉哲軒', '李文華', '張耿齊',
    '洪揚程', '謝鑵翹', '王筑句', '米米',
    '花', '劉道玄', '黃柏翰', '周稚凱', '郭郁承', '鐘曜任'
  ]

  // 載入打卡記錄
  const loadAttendanceRecords = async (name) => {
    try {
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('staff_name', name)
        .order('work_date', { ascending: false })
        .limit(10)

      if (error) throw error
      setAttendanceRecords(data || [])

      // 檢查今天是否已打卡
      const today = new Date().toISOString().split('T')[0]
      const todayRec = data?.find(rec => rec.work_date === today)
      setTodayRecord(todayRec || null)
    } catch (error) {
      console.error('載入打卡記錄失敗:', error)
      toast.error('載入打卡記錄失敗')
    }
  }

  // 員工登入
  const handleLogin = () => {
    if (!loginName.trim()) {
      toast.error('請輸入姓名')
      return
    }

    if (!staffList.includes(loginName.trim())) {
      toast.error('員工姓名不在名單中')
      return
    }

    setStaffName(loginName.trim())
    setIsLoggedIn(true)
    loadAttendanceRecords(loginName.trim())
    toast.success(`歡迎，${loginName}！`)
  }

  // 上班打卡
  const handleClockIn = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      // 檢查今天是否已打卡
      if (todayRecord && todayRecord.clock_in_time) {
        toast.error('今天已經打過上班卡了')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('staff_attendance')
        .insert([{
          staff_name: staffName,
          staff_id: staffId || null,
          clock_in_time: now.toISOString(),
          work_date: today
        }])
        .select()

      if (error) throw error

      setTodayRecord(data[0])
      loadAttendanceRecords(staffName)
      toast.success('上班打卡成功！')
    } catch (error) {
      console.error('打卡失敗:', error)
      toast.error('打卡失敗，請稍後再試')
    }
    setLoading(false)
  }

  // 下班打卡
  const handleClockOut = async () => {
    setLoading(true)
    try {
      if (!todayRecord || !todayRecord.clock_in_time) {
        toast.error('請先打上班卡')
        setLoading(false)
        return
      }

      if (todayRecord.clock_out_time) {
        toast.error('今天已經打過下班卡了')
        setLoading(false)
        return
      }

      const now = new Date()
      const clockInTime = new Date(todayRecord.clock_in_time)
      const totalHours = ((now - clockInTime) / (1000 * 60 * 60)).toFixed(2)

      const { data, error } = await supabase
        .from('staff_attendance')
        .update({
          clock_out_time: now.toISOString(),
          total_hours: parseFloat(totalHours),
          updated_at: now.toISOString()
        })
        .eq('id', todayRecord.id)
        .select()

      if (error) throw error

      setTodayRecord(data[0])
      loadAttendanceRecords(staffName)
      toast.success(`下班打卡成功！工作時數：${totalHours} 小時`)
    } catch (error) {
      console.error('打卡失敗:', error)
      toast.error('打卡失敗，請稍後再試')
    }
    setLoading(false)
  }

  // 登出
  const handleLogout = () => {
    setIsLoggedIn(false)
    setStaffName('')
    setStaffId('')
    setLoginName('')
    setAttendanceRecords([])
    setTodayRecord(null)
    toast.success('已登出')
  }

  // 格式化時間
  const formatTime = (timeString) => {
    if (!timeString) return '--:--'
    const date = new Date(timeString)
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      
      {/* 頂部導航欄 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 w-8 h-8 md:w-10 md:h-10"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">員工專區</h1>
                <p className="text-xs text-blue-200 hidden sm:block">打卡簽到系統</p>
              </div>
            </div>
            {isLoggedIn && (
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="text-white text-sm md:text-base">👋 {staffName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white border-white/20 hover:bg-white/10 text-xs md:text-sm"
                >
                  登出
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {!isLoggedIn ? (
          // 登入頁面
          <div className="max-w-md mx-auto mt-8 md:mt-16">
            <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-center text-xl md:text-2xl">員工登入</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                <div>
                  <label className="block text-white mb-2 text-sm md:text-base">選擇姓名</label>
                  <select
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-blue-800/30 border border-blue-700/30 rounded-md text-white text-sm md:text-base"
                  >
                    <option value="">請選擇...</option>
                    {staffList.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base py-2 md:py-3"
                >
                  <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  登入
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // 打卡頁面
          <div className="space-y-4 md:space-y-6">
            {/* 今日打卡狀態 */}
            <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-lg md:text-xl flex items-center">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  今日打卡
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* 上班打卡 */}
                  <div className="bg-blue-800/30 rounded-lg p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h3 className="text-white font-semibold text-base md:text-lg">上班打卡</h3>
                      {todayRecord?.clock_in_time && (
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                      )}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-blue-200 mb-3 md:mb-4">
                      {formatTime(todayRecord?.clock_in_time)}
                    </div>
                    <Button
                      onClick={handleClockIn}
                      disabled={loading || (todayRecord && todayRecord.clock_in_time)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 text-sm md:text-base"
                    >
                      <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      {todayRecord?.clock_in_time ? '已打卡' : '上班打卡'}
                    </Button>
                  </div>

                  {/* 下班打卡 */}
                  <div className="bg-blue-800/30 rounded-lg p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h3 className="text-white font-semibold text-base md:text-lg">下班打卡</h3>
                      {todayRecord?.clock_out_time && (
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                      )}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-blue-200 mb-3 md:mb-4">
                      {formatTime(todayRecord?.clock_out_time)}
                    </div>
                    <Button
                      onClick={handleClockOut}
                      disabled={loading || !todayRecord?.clock_in_time || todayRecord?.clock_out_time}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 text-sm md:text-base"
                    >
                      <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      {todayRecord?.clock_out_time ? '已打卡' : '下班打卡'}
                    </Button>
                  </div>
                </div>

                {/* 工作時數 */}
                {todayRecord?.total_hours && (
                  <div className="bg-blue-800/30 rounded-lg p-4 md:p-6 text-center">
                    <p className="text-blue-200 mb-2 text-sm md:text-base">今日工作時數</p>
                    <p className="text-3xl md:text-4xl font-bold text-white">{todayRecord.total_hours} 小時</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 打卡記錄 */}
            <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-lg md:text-xl">最近打卡記錄</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3 md:space-y-4">
                  {attendanceRecords.length === 0 ? (
                    <p className="text-blue-200 text-center py-8 text-sm md:text-base">尚無打卡記錄</p>
                  ) : (
                    attendanceRecords.map((record) => (
                      <div
                        key={record.id}
                        className="bg-blue-800/30 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
                          <div>
                            <p className="text-white font-semibold text-sm md:text-base">{formatDate(record.work_date)}</p>
                            <p className="text-blue-200 text-xs md:text-sm">
                              {formatTime(record.clock_in_time)} - {formatTime(record.clock_out_time)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right sm:text-left">
                          <p className="text-blue-200 text-xs md:text-sm">工作時數</p>
                          <p className="text-white font-bold text-base md:text-lg">
                            {record.total_hours ? `${record.total_hours} 小時` : '--'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffPortalPage
