import { useState, useMemo } from 'react'
import { Calendar, List, Clock, Plus, Download, ArrowLeft, Grid3x3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppointments } from '@/hooks/useAppointments'
import { exportAppointmentsToExcel } from '@/lib/exportExcel'
import { formatDate, generateCalendarDays, formatDisplayDate, isHoliday } from '@/lib/dateUtils'
import { isClosedDay as checkClosedDay, TAIWAN_HOLIDAYS_2025 } from '@/lib/holidays'
import { getAppointmentColor } from '@/lib/appointmentColors'
import { AppointmentEditDialog } from '@/components/AppointmentEditDialog'
import { AppointmentCreateDialog } from '@/components/AppointmentCreateDialog'
import { TimeSlotView } from '@/components/TimeSlotView'
import { DateAppointmentPopover } from '@/components/DateAppointmentPopover'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function AppointmentsPage() {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState('calendar')
  const [timeSlotDate, setTimeSlotDate] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { appointments, loading, error, statistics, updateAppointment, deleteAppointment, holidays } = useAppointments()

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentDate)
  }, [currentDate])

  const getAppointmentsForDate = (dateString) => {    const dayAppointments = appointments.filter(apt => apt.taiwan_date === dateString)
    
    // 按客戶名稱分組
    const groupedByCustomer = dayAppointments.reduce((acc, apt) => {
      const customerName = apt.customer_name || '未知客戶'
      if (!acc[customerName]) {
        acc[customerName] = []
      }
      acc[customerName].push(apt)
      return acc
    }, {})
    
    // 合併同一客戶的預約
    const mergedAppointments = Object.entries(groupedByCustomer).map(([customerName, apts]) => {
      if (apts.length === 1) {
        return apts[0]
      }
      
      // 多筆預約：合併療程項目和時間
      const times = apts.map(apt => apt.time_24h).filter(Boolean)
      const uniqueTimes = [...new Set(times)].join(', ')
      
      const treatments = apts.map(apt => apt.treatment_item).filter(Boolean)
      const uniqueTreatments = [...new Set(treatments)].join(' + ')
      
      return {
        ...apts[0], // 使用第一筆的基本資料
        time_24h: uniqueTimes,
        treatment_item: uniqueTreatments,
        merged_count: apts.length, // 標記合併了幾筆
        merged_ids: apts.map(apt => apt.id) // 保留所有ID以便編輯
      }
    })
    
    // 按時間排序
    return mergedAppointments.sort((a, b) => {
      const timeA = (a.time_24h || '00:00').split(',')[0].trim()
      const timeB = (b.time_24h || '00:00').split(',')[0].trim()
      return timeA.localeCompare(timeB)
    })
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleExportExcel = () => {
    exportAppointmentsToExcel(appointments)
  }

  const handleEditAppointment = (appointment) => {
    // 明確提取所有需要的欄位，避免資料丟失
    const editData = {
      ...appointment,
      // 明確指定關鍵欄位的對應關係
      customer_name: appointment.customer_name || '',
      customer_birthday: appointment.customer_birthday || '',
      contact_phone: appointment.contact_phone || '',
      
      taiwan_date: appointment.taiwan_date || '',
      time_24h: appointment.time_24h || '',
      treatment_item: appointment.treatment_item || '',
      attending_physician: appointment.attending_physician || '',
    };
    
    setSelectedAppointment(editData);
    setIsEditDialogOpen(true);
  }

  const handleSaveAppointment = async (id, updates) => {
    const result = await updateAppointment(id, updates)
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  const handleDeleteAppointment = async (id) => {
    const result = await deleteAppointment(id)
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  const isClosedDay = (day) => {
    // 使用新的 holidays 模組檢查是否為休診日
    const closedInfo = checkClosedDay(day.date)
    return closedInfo !== null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-red-400 text-xl">錯誤: {error}</div>
      </div>
    )
  }

  return (
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* 頂部導航欄 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
	        <div className="container mx-auto px-0 sm:px-4 py-4">
          <div className="flex items-center justify-between">
	            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
	                <h1 className="text-lg sm:text-xl font-bold text-white">預約排程管理</h1>
	                <p className="text-xs text-blue-200 hidden sm:block">智能排程與員工分配</p>
              </div>
            </div>

	            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant={currentView === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('calendar')}
                className="text-white"
              >
                <Calendar className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">月曆</span>
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="text-white"
              >
                <List className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">列表</span>
              </Button>
              <Button
                variant={currentView === 'timeslot' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCurrentView('timeslot')
                  setTimeSlotDate(new Date())
                }}
                className="text-white"
              >
                <Clock className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">時段</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">新增預約</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="text-white border-white/20 hover:bg-white/10 hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                匯出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 統計卡片 */}
	                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl border-white/20 overflow-x-auto hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">📅 總預約數</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">{statistics.totalAppointments}</div>
              <p className="text-xs text-blue-200 mt-1">總預約統計</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 backdrop-blur-xl border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-orange-200 to-amber-200 bg-clip-text text-transparent">⏳ 待約數量</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">{statistics.pendingAppointments}</div>
              <p className="text-xs text-orange-200 mt-1">尚未報到</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">👥 客人數量</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{statistics.uniquePatients}</div>
              <p className="text-xs text-purple-200 mt-1">總病患數</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-600/20 backdrop-blur-xl border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">✅ 已完成</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-300 to-teal-300 bg-clip-text text-transparent">{statistics.completedAppointments}</div>
              <p className="text-xs text-green-200 mt-1">已完成的預約</p>
            </CardContent>
          </Card>
        </div>

        {currentView === 'calendar' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-lg shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => changeMonth(-1)} className="text-white border-white/20 hover:bg-white/10">上個月</Button>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{formatDisplayDate(currentDate)}</h2>
              <Button variant="outline" onClick={() => changeMonth(1)} className="text-white border-white/20 hover:bg-white/10">下個月</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
              {["日", "一", "二", "三", "四", "五", "六"].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayAppointments = day ? getAppointmentsForDate(day.dateString) : []
                const isToday = day && day.isToday  // 使用已計算好的 isToday 屬性
                const isClosed = day && isClosedDay(day)
                const holidayInfo = day && isHoliday(day.date)

                return (
                  <div
                    key={index}
                    className={`relative h-24 sm:h-32 md:h-36 lg:h-40 rounded-xl p-2 sm:p-2.5 md:p-3 text-left transition-all duration-300 
                      ${day ? 'bg-gradient-to-br from-slate-700/50 via-slate-750/50 to-slate-800/50 hover:from-slate-600/60 hover:via-slate-650/60 hover:to-slate-700/60 border-2 border-slate-600/40 hover:border-slate-500/60 shadow-lg hover:shadow-2xl backdrop-blur-sm' : 'bg-transparent'}
                      ${isToday ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900 shadow-2xl shadow-yellow-400/70 scale-[1.05] border-yellow-400/50' : ''}`}
                  >
                    {day && (
                      <>
                        {/* 日期號碼顯示 */}
                        <div className={`text-lg sm:text-xl md:text-2xl font-extrabold mb-1.5 ${isToday ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : day.isCurrentMonth ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>
                          {day.dayOfMonth}
                        </div>
                        
                        {/* 休診日圖示 - 週日或國定假日 */}
                        {isClosed && (
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-red-300/50">
                              <span className="text-white text-sm sm:text-base font-bold drop-shadow-md">休</span>
                            </div>
                            <div className="text-xxs text-red-200 bg-red-900/70 px-1.5 py-0.5 rounded-md hidden sm:block shadow-sm">{isClosed.name}</div>
                          </div>
                        )}
                        
                        {/* 假日名稱 */}
                        {holidayInfo && !isClosed && (
                          <div className="text-xxs text-red-400 truncate mb-1">{holidayInfo.name}</div>
                        )}
                        
                        {/* 預約列表 - 手機版點擊顯示懸浮窗 */}
                        <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1 overflow-y-auto max-h-12 sm:max-h-20 md:max-h-24 lg:max-h-28 pr-0.5 sm:pr-1">
                          {dayAppointments.length > 0 && (
                            <DateAppointmentPopover 
                              dateString={day.dateString}
                              appointments={dayAppointments} 
                              onEdit={handleEditAppointment}
                              onDelete={deleteAppointment}
                            >
                              <div className="cursor-pointer">
                                {/* 桌面版：顯示前2筆預約 */}
                                <div className="hidden sm:block space-y-1">
                                  {dayAppointments.slice(0, 2).map(apt => (
                                    <div
                                      key={apt.id}
                                      className={`text-xxs sm:text-xs p-0.5 sm:p-1 rounded-sm sm:rounded-md truncate ${getAppointmentColor(apt).bgClass}`}
                                    >
                                      <span className="font-semibold">{apt.time_24h}</span> {apt.customer_name}
                                      {apt.merged_count > 1 && ` (+${apt.merged_count - 1})`}
                                    </div>
                                  ))}
                                  {dayAppointments.length > 2 && (
                                    <div className="text-xxs text-blue-300 text-center bg-blue-900/30 rounded py-0.5">
                                      +{dayAppointments.length - 2} 更多
                                    </div>
                                  )}
                                </div>
                                
                                {/* 手機版：顯示預約數量 */}
                                <div className="sm:hidden">
                                  <div className="bg-blue-500/80 text-white text-xs font-bold rounded-md px-2 py-1 text-center">
                                    📋 {dayAppointments.length} 筆預約
                                  </div>
                                </div>
                              </div>
                            </DateAppointmentPopover>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {currentView === 'list' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-lg shadow-2xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">預約列表</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                  <tr>
                    <th scope="col" className="px-4 py-3">日期</th>
                    <th scope="col" className="px-4 py-3">時間</th>
                    <th scope="col" className="px-4 py-3">姓名</th>
                    <th scope="col" className="px-4 py-3">療程</th>
                    <th scope="col" className="px-4 py-3">狀態</th>
                    <th scope="col" className="px-4 py-3">醫師</th>
                    <th scope="col" className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                      <td className="px-4 py-3">{apt.taiwan_date}</td>
                      <td className="px-4 py-3">{apt.time_24h}</td>
                      <td className="px-4 py-3 font-medium text-white">{apt.customer_name}</td>
                      <td className="px-4 py-3">{apt.treatment_item}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${apt.appointment_status === '已完成' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {apt.appointment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{apt.attending_physician}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(apt)} className="text-blue-400 hover:text-blue-300">編輯</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

	        {currentView === 'timeslot' && (
	          <TimeSlotView 
	            selectedDate={currentDate} 
	            onAppointmentClick={handleEditAppointment}
	          />
	        )}
      </main>

      <AppointmentEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
      />
      
      <AppointmentCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          toast.success('預約新增成功！')
        }}
        initialDate={selectedDate}
      />

      <Toaster />
    </div>
  )
}

export default AppointmentsPage
