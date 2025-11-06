import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [doctorSchedules, setDoctorSchedules] = useState([])
  const [staffSchedules, setStaffSchedules] = useState([])
  const [doctors, setDoctors] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      loadDoctors(),
      loadStaff(),
      loadDoctorSchedules(),
      loadStaffSchedules()
    ])
    setLoading(false)
  }

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('載入醫師失敗:', error)
    }
  }

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('載入員工失敗:', error)
    }
  }

  const loadDoctorSchedules = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (error) throw error
      setDoctorSchedules(data || [])
    } catch (error) {
      console.error('載入醫師排班失敗:', error)
    }
  }

  const loadStaffSchedules = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('staff_schedules')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (error) throw error
      setStaffSchedules(data || [])
    } catch (error) {
      console.error('載入員工排班失敗:', error)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // 填充前面的空白
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // 填充實際日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const getSchedulesForDate = (day) => {
    if (!day) return { doctors: [], staff: [] }
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const doctorSchedulesForDay = doctorSchedules.filter(s => s.date === dateStr)
    const staffSchedulesForDay = staffSchedules.filter(s => s.date === dateStr)
    
    return {
      doctors: doctorSchedulesForDay.map(s => {
        const doctor = doctors.find(d => d.id === s.doctor_id)
        return { ...s, name: doctor?.name || '未知' }
      }),
      staff: staffSchedulesForDay.map(s => {
        const staffMember = staff.find(st => st.id === s.staff_id)
        return { ...s, name: staffMember?.name || '未知' }
      })
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleExport = () => {
    alert('匯出功能開發中...\n將支援PDF和圖片格式')
  }

  const handlePrint = () => {
    window.print()
  }

  const days = getDaysInMonth()
  const monthName = currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 控制列 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-white min-w-[150px] text-center">
            {monthName}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            列印
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            匯出
          </Button>
        </div>
      </div>

      {/* 月曆 */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div
                key={index}
                className={`text-center font-semibold py-2 ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-white'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const schedules = getSchedulesForDate(day)
              const isToday = day && 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded border ${
                    day 
                      ? isToday
                        ? 'bg-blue-900/50 border-blue-500'
                        : 'bg-slate-700/30 border-slate-600/30'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${
                        index % 7 === 0 ? 'text-red-400' : 'text-white'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {schedules.doctors.map((schedule, idx) => (
                          <div
                            key={`doctor-${idx}`}
                            className="text-xs bg-blue-600/50 rounded px-1 py-0.5 truncate"
                            title={`${schedule.name} ${schedule.start_time}-${schedule.end_time}`}
                          >
                            👨‍⚕️ {schedule.name}
                          </div>
                        ))}
                        {schedules.staff.map((schedule, idx) => (
                          <div
                            key={`staff-${idx}`}
                            className="text-xs bg-green-600/50 rounded px-1 py-0.5 truncate"
                            title={`${schedule.name} ${schedule.start_time}-${schedule.end_time}`}
                          >
                            👤 {schedule.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 圖例 */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600/50 rounded"></div>
          <span className="text-white">醫師排班</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600/50 rounded"></div>
          <span className="text-white">員工排班</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-900/50 border border-blue-500 rounded"></div>
          <span className="text-white">今天</span>
        </div>
      </div>
    </div>
  )
}
