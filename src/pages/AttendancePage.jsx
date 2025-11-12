import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { MapPin, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [todayRecord, setTodayRecord] = useState(null)
  const [recentRecords, setRecentRecords] = useState([])

  useEffect(() => {
    fetchTodayRecord()
    fetchRecentRecords()
  }, [])

  const fetchTodayRecord = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setTodayRecord(data)
    }
  }

  const fetchRecentRecords = async () => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('check_in_time', { ascending: false })
      .limit(10)

    if (!error) {
      setRecentRecords(data || [])
    }
  }

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('瀏覽器不支援定位功能'))
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
          reject(error)
        }
      )
    })
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const loc = await getCurrentLocation()
      
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([
          {
            employee_id: 1, // 暫時使用固定 ID,實際應從登入狀態取得
            check_in_time: new Date().toISOString(),
            check_in_location_lat: loc.latitude,
            check_in_location_lng: loc.longitude,
            status: 'normal'
          }
        ])
        .select()

      if (error) throw error

      alert('上班打卡成功!')
      fetchTodayRecord()
      fetchRecentRecords()
    } catch (error) {
      alert('打卡失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord || todayRecord.check_out_time) {
      alert('今日尚未上班打卡或已完成下班打卡')
      return
    }

    setLoading(true)
    try {
      const loc = await getCurrentLocation()
      const checkOutTime = new Date()
      const checkInTime = new Date(todayRecord.check_in_time)
      const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60)

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: checkOutTime.toISOString(),
          check_out_location_lat: loc.latitude,
          check_out_location_lng: loc.longitude,
          work_hours: workHours.toFixed(2)
        })
        .eq('id', todayRecord.id)
        .select()

      if (error) throw error

      alert('下班打卡成功!')
      fetchTodayRecord()
      fetchRecentRecords()
    } catch (error) {
      alert('打卡失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">員工打卡系統</h1>
            <p className="text-slate-600 mt-1">FLOS 曜診所考勤管理</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">
              {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              {format(new Date(), 'HH:mm:ss')}
            </div>
          </div>
        </div>

        {/* 打卡按鈕 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Clock className="w-5 h-5" />
                上班打卡
              </CardTitle>
              <CardDescription>
                {todayRecord && !todayRecord.check_out_time
                  ? `已於 ${format(new Date(todayRecord.check_in_time), 'HH:mm')} 打卡`
                  : '點擊按鈕進行上班打卡'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={handleCheckIn}
                disabled={loading || (todayRecord && !todayRecord.check_out_time)}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {loading ? '定位中...' : '上班打卡'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock className="w-5 h-5" />
                下班打卡
              </CardTitle>
              <CardDescription>
                {todayRecord?.check_out_time
                  ? `已於 ${format(new Date(todayRecord.check_out_time), 'HH:mm')} 打卡`
                  : '完成工作後進行下班打卡'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={handleCheckOut}
                disabled={loading || !todayRecord || todayRecord.check_out_time}
              >
                <XCircle className="w-5 h-5 mr-2" />
                {loading ? '定位中...' : '下班打卡'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 今日出勤狀態 */}
        {todayRecord && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                今日出勤狀態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-slate-600">上班時間</div>
                  <div className="text-xl font-semibold text-green-700">
                    {format(new Date(todayRecord.check_in_time), 'HH:mm:ss')}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-slate-600">下班時間</div>
                  <div className="text-xl font-semibold text-blue-700">
                    {todayRecord.check_out_time
                      ? format(new Date(todayRecord.check_out_time), 'HH:mm:ss')
                      : '尚未打卡'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-slate-600">工作時數</div>
                  <div className="text-xl font-semibold text-purple-700">
                    {todayRecord.work_hours ? `${todayRecord.work_hours} 小時` : '計算中'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最近打卡記錄 */}
        <Card>
          <CardHeader>
            <CardTitle>最近打卡記錄</CardTitle>
            <CardDescription>顯示最近 10 筆打卡記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {format(new Date(record.check_in_time), 'dd')}
                    </div>
                    <div>
                      <div className="font-medium">
                        {format(new Date(record.check_in_time), 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
                      </div>
                      <div className="text-sm text-slate-600">
                        {format(new Date(record.check_in_time), 'HH:mm')} - 
                        {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '未打卡'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-700">
                      {record.work_hours ? `${record.work_hours} 小時` : '-'}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      GPS 定位
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
