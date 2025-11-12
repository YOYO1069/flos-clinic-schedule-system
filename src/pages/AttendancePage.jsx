import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { MapPin, Clock, CheckCircle, XCircle, Calendar, User, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function AttendancePage() {
  const handleBackToAdmin = () => {
    window.location.href = 'https://classy-biscotti-42a418.netlify.app/'
  }
  
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [todayRecord, setTodayRecord] = useState(null)
  const [recentRecords, setRecentRecords] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 員工識別狀態
  const [isIdentified, setIsIdentified] = useState(false)
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [employeeCode, setEmployeeCode] = useState('')
  const [employeeName, setEmployeeName] = useState('')

  useEffect(() => {
    // 檢查 localStorage 是否有儲存的員工資訊
    const savedEmployeeInfo = localStorage.getItem('flos_employee_info')
    if (savedEmployeeInfo) {
      const info = JSON.parse(savedEmployeeInfo)
      setEmployeeInfo(info)
      setIsIdentified(true)
      fetchTodayRecord(info.id)
      fetchRecentRecords(info.id)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEmployeeIdentify = async () => {
    if (!employeeCode.trim() || !employeeName.trim()) {
      alert('請輸入員工編號和姓名')
      return
    }

    setLoading(true)
    try {
      // 查詢員工資料
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_code', employeeCode.trim())
        .eq('name', employeeName.trim())
        .single()

      if (error || !employee) {
        alert('找不到員工資料,請確認員工編號和姓名是否正確')
        setLoading(false)
        return
      }

      // 儲存員工資訊
      const info = {
        id: employee.id,
        name: employee.name,
        employee_code: employee.employee_code,
        department: employee.department
      }
      setEmployeeInfo(info)
      setIsIdentified(true)
      localStorage.setItem('flos_employee_info', JSON.stringify(info))

      // 載入打卡記錄
      await fetchTodayRecord(employee.id)
      await fetchRecentRecords(employee.id)
    } catch (err) {
      console.error('識別員工失敗:', err)
      alert('系統錯誤,請稍後再試')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('flos_employee_info')
    setIsIdentified(false)
    setEmployeeInfo(null)
    setTodayRecord(null)
    setRecentRecords([])
    setEmployeeCode('')
    setEmployeeName('')
  }

  const fetchTodayRecord = async (employeeId) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`)
      .order('check_in_time', { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      setTodayRecord(data[0])
    }
  }

  const fetchRecentRecords = async (employeeId) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .order('check_in_time', { ascending: false })
      .limit(10)

    if (!error) {
      setRecentRecords(data || [])
    }
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('瀏覽器不支援定位功能'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setLocation(loc)
          resolve(loc)
        },
        (error) => {
          reject(new Error('無法取得位置資訊'))
        }
      )
    })
  }

  const handleCheckIn = async () => {
    if (!employeeInfo) return

    setLoading(true)
    try {
      const loc = await getLocation()
      
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeInfo.id,
          check_in_time: new Date().toISOString(),
          check_in_location: `${loc.latitude},${loc.longitude}`,
          status: 'normal'
        })
        .select()
        .single()

      if (error) throw error

      alert('上班打卡成功!')
      await fetchTodayRecord(employeeInfo.id)
      await fetchRecentRecords(employeeInfo.id)
    } catch (error) {
      console.error('打卡失敗:', error)
      alert(`打卡失敗: ${error.message}`)
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    if (!employeeInfo || !todayRecord) return

    setLoading(true)
    try {
      const loc = await getLocation()
      
      const { error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: new Date().toISOString(),
          check_out_location: `${loc.latitude},${loc.longitude}`
        })
        .eq('id', todayRecord.id)

      if (error) throw error

      alert('下班打卡成功!')
      await fetchTodayRecord(employeeInfo.id)
      await fetchRecentRecords(employeeInfo.id)
    } catch (error) {
      console.error('打卡失敗:', error)
      alert(`打卡失敗: ${error.message}`)
    }
    setLoading(false)
  }

  // 員工識別畫面
  if (!isIdentified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Button
            onClick={handleBackToAdmin}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回後台
          </Button>

          <Card className="shadow-xl border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6" />
                員工打卡系統
              </CardTitle>
              <CardDescription className="text-purple-100">
                FLOS 曜診所考勤管理
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="employeeCode">員工編號</Label>
                <Input
                  id="employeeCode"
                  type="text"
                  placeholder="請輸入員工編號"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employeeName">姓名</Label>
                <Input
                  id="employeeName"
                  type="text"
                  placeholder="請輸入姓名"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleEmployeeIdentify}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? '驗證中...' : '開始打卡'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 打卡主畫面
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={handleBackToAdmin}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回後台
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            切換員工
          </Button>
        </div>

        <Card className="shadow-xl border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">員工打卡系統</CardTitle>
                <CardDescription className="text-purple-100 mt-2">
                  FLOS 曜診所考勤管理
                </CardDescription>
                <div className="mt-3 text-sm text-purple-100">
                  <User className="w-4 h-4 inline mr-1" />
                  {employeeInfo?.name} ({employeeInfo?.employee_code})
                  {employeeInfo?.department && ` - ${employeeInfo.department}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">
                  {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
                </div>
                <div className="text-3xl font-bold mt-1">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 上班打卡 */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Clock className="w-5 h-5" />
                    上班打卡
                  </CardTitle>
                  <CardDescription>點擊按鈕進行上班打卡</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCheckIn}
                    disabled={loading || (todayRecord && todayRecord.check_in_time)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? '定位中...' : todayRecord?.check_in_time ? '已打卡' : '上班打卡'}
                  </Button>
                  {todayRecord?.check_in_time && (
                    <div className="mt-3 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      {format(new Date(todayRecord.check_in_time), 'HH:mm:ss')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 下班打卡 */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <MapPin className="w-5 h-5" />
                    下班打卡
                  </CardTitle>
                  <CardDescription>完成工作後進行下班打卡</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCheckOut}
                    disabled={loading || !todayRecord || todayRecord.check_out_time}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? '定位中...' : todayRecord?.check_out_time ? '已打卡' : '下班打卡'}
                  </Button>
                  {todayRecord?.check_out_time && (
                    <div className="mt-3 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      {format(new Date(todayRecord.check_out_time), 'HH:mm:ss')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 最近打卡記錄 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  最近打卡記錄
                </CardTitle>
                <CardDescription>顯示最近 10 筆打卡記錄</CardDescription>
              </CardHeader>
              <CardContent>
                {recentRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">尚無打卡記錄</p>
                ) : (
                  <div className="space-y-2">
                    {recentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {format(new Date(record.check_in_time), 'yyyy-MM-dd EEEE', { locale: zhTW })}
                          </div>
                          <div className="text-sm text-gray-600">
                            上班: {format(new Date(record.check_in_time), 'HH:mm:ss')}
                            {record.check_out_time && (
                              <> | 下班: {format(new Date(record.check_out_time), 'HH:mm:ss')}</>
                            )}
                          </div>
                        </div>
                        <div>
                          {record.check_out_time ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
