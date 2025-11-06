import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Search, Plus, FileText, User, Phone, 
  Calendar, Stethoscope, Edit, Trash2, Filter, Clock,
  MapPin, UserCheck, Briefcase, Activity, CalendarRange
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppointments } from '@/hooks/useAppointments'
import { Toaster, toast } from 'sonner'
import MedicalRecordsCharts from '@/components/MedicalRecordsCharts'


function MedicalRecordsPage() {
  const navigate = useNavigate()
  const { appointments, loading, error } = useAppointments()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [timeRange, setTimeRange] = useState('all') // 1month, 3months, 6months, all
  const [activeTab, setActiveTab] = useState('records') // records, charts
  const [patientDetailTab, setPatientDetailTab] = useState('info') // info

  // 按病患分組預約記錄
  const patientRecords = useMemo(() => {
    const records = {}
    
    appointments.forEach(apt => {
      const patientName = apt.user_name || apt.patient_name || apt.customer_name || '未知'
      if (!records[patientName]) {
        records[patientName] = {
          name: patientName,
          phone: apt.phone || apt.contact_phone || '',
          lineId: apt.line_id || '',
          appointments: [],
          totalVisits: 0,
          lastVisit: null,
          firstVisit: null
        }
      }
      
      records[patientName].appointments.push(apt)
      records[patientName].totalVisits++
      
      const aptDate = apt.taiwan_date || apt.date || apt.appointment_date
      if (!records[patientName].lastVisit || aptDate > records[patientName].lastVisit) {
        records[patientName].lastVisit = aptDate
      }
      if (!records[patientName].firstVisit || aptDate < records[patientName].firstVisit) {
        records[patientName].firstVisit = aptDate
      }
    })
    
    return Object.values(records).sort((a, b) => {
      // 按最後就診日期排序(最新的在前)
      return new Date(b.lastVisit) - new Date(a.lastVisit)
    })
  }, [appointments])

  // 搜尋過濾
  const filteredRecords = useMemo(() => {
    let filtered = patientRecords
    
    // 搜尋過濾
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phone.includes(searchTerm) ||
        record.lineId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 狀態過濾
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => {
        const lastVisit = new Date(record.lastVisit)
        const now = new Date()
        const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24))
        
        if (filterStatus === 'active') return daysDiff <= 90 // 3個月內
        if (filterStatus === 'inactive') return daysDiff > 90
        return true
      })
    }
    
    // 時間範圍過濾
    if (timeRange !== 'all') {
      const now = new Date()
      let monthsAgo = 0
      
      if (timeRange === '1month') monthsAgo = 1
      else if (timeRange === '3months') monthsAgo = 3
      else if (timeRange === '6months') monthsAgo = 6
      
      if (monthsAgo > 0) {
        const cutoffDate = new Date()
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo)
        
        filtered = filtered.map(record => ({
          ...record,
          appointments: record.appointments.filter(apt => {
            const aptDate = new Date(apt.taiwan_date || apt.date || apt.appointment_date)
            return aptDate >= cutoffDate
          }),
          totalVisits: record.appointments.filter(apt => {
            const aptDate = new Date(apt.taiwan_date || apt.date || apt.appointment_date)
            return aptDate >= cutoffDate
          }).length
        })).filter(record => record.totalVisits > 0)
      }
    }
    
    return filtered
  }, [patientRecords, searchTerm, filterStatus, timeRange])

  // 統計資料
  const statistics = useMemo(() => {
    const now = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    return {
      totalPatients: patientRecords.length,
      totalVisits: appointments.length,
      activePatients: patientRecords.filter(r => {
        const lastVisit = new Date(r.lastVisit)
        return lastVisit > threeMonthsAgo
      }).length,
      newPatients: patientRecords.filter(r => {
        const firstVisit = new Date(r.firstVisit)
        return firstVisit > threeMonthsAgo
      }).length
    }
  }, [patientRecords, appointments])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 頂部導航欄 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">病歷系統</h1>
                <p className="text-xs text-blue-200">電子病歷管理與療程記錄追蹤</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜尋病患姓名、電話或LINE ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-blue-800/30 border-blue-700/30 text-white placeholder:text-gray-400 w-80"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-blue-800/30 border-blue-700/30 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="all">全部病患</option>
                <option value="active">活躍病患</option>
                <option value="inactive">非活躍病患</option>
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-blue-800/30 border-blue-700/30 text-white rounded-md px-3 py-2 text-sm flex items-center gap-2"
              >
                <option value="all">全部時間</option>
                <option value="1month">1個月內</option>
                <option value="3months">3個月內</option>
                <option value="6months">6個月內</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 標籤頁導航 */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeTab === 'records' ? 'default' : 'outline'}
            onClick={() => setActiveTab('records')}
            className={activeTab === 'records' ? 'bg-blue-600 text-white' : 'bg-blue-800/30 text-white border-blue-700/30 hover:bg-blue-700/40'}
          >
            📋 病歷列表
          </Button>
          <Button
            variant={activeTab === 'charts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('charts')}
            className={activeTab === 'charts' ? 'bg-blue-600 text-white' : 'bg-blue-800/30 text-white border-blue-700/30 hover:bg-blue-700/40'}
          >
            📊 數據視覺化
          </Button>
        </div>

        {/* 統計卡片 */}
        {activeTab === 'records' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10 hover:bg-blue-900/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">總病患數</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.totalPatients}</p>
                  <p className="text-xs text-blue-300 mt-1">不重複客戶</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10 hover:bg-blue-900/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">總就診次數</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.totalVisits}</p>
                  <p className="text-xs text-blue-300 mt-1">所有預約記錄</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10 hover:bg-blue-900/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">活躍病患</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.activePatients}</p>
                  <p className="text-xs text-blue-300 mt-1">近3個月有就診</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10 hover:bg-blue-900/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">新增病患</p>
                  <p className="text-3xl font-bold text-white mt-1">{statistics.newPatients}</p>
                  <p className="text-xs text-blue-300 mt-1">近3個月首次就診</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 病患列表 */}
        <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                病患病歷列表 ({filteredRecords.length} 位)
              </CardTitle>
              <div className="text-sm text-blue-300">
                共 {filteredRecords.reduce((sum, r) => sum + r.totalVisits, 0)} 次就診記錄
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <div className="text-center text-blue-300 py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">暫無符合條件的病歷資料</p>
                  <p className="text-sm mt-2">請調整搜尋條件或篩選器</p>
                </div>
              ) : (
                filteredRecords.map((record, index) => (
                  <div
                    key={index}
                    className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/30 rounded-lg p-4 hover:bg-blue-700/40 hover:border-blue-600/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedPatient(record)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{record.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                                {record.totalVisits} 次就診
                              </span>
                              {(() => {
                                const lastVisit = new Date(record.lastVisit)
                                const daysDiff = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24))
                                if (daysDiff <= 30) {
                                  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300">活躍</span>
                                } else if (daysDiff > 90) {
                                  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-300">非活躍</span>
                                }
                                return null
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-200 ml-13">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1.5 text-blue-400" />
                            {record.phone || '未提供'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-blue-400" />
                            最後就診: {record.lastVisit}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
                            首次就診: {record.firstVisit}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10 group-hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPatient(record)
                        }}
                      >
                        查看完整病歷 →
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </>
        )}

        {/* 數據視覺化標籤頁 */}
        {activeTab === 'charts' && (
          <MedicalRecordsCharts appointments={appointments} />
        )}

        {/* 病患詳細資料對話框 */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPatient(null)}>
            <Card className="bg-blue-900 border-white/10 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        {selectedPatient.name} 的完整病歷
                      </CardTitle>
                      <p className="text-sm text-blue-300 mt-1">
                        共 {selectedPatient.totalVisits} 次就診記錄
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                    className="text-white hover:bg-white/10"
                  >
                    ✕ 關閉
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden flex-1 flex flex-col">
                {/* 標籤頁導航 */}
                <div className="flex border-b border-white/10 px-6 pt-4">
                  <button
                    onClick={() => setPatientDetailTab('info')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      patientDetailTab === 'info'
                        ? 'text-white border-b-2 border-blue-500'
                        : 'text-blue-300 hover:text-white'
                    }`}
                  >
                    📋 病歷資訊
                  </button>

                </div>

                {/* 標籤頁內容 */}
                <div className="p-6 overflow-y-auto flex-1">
                {patientDetailTab === 'info' && (
                <div className="space-y-6">
                  {/* 基本資料 */}
                  <div className="bg-blue-800/30 backdrop-blur-sm rounded-lg p-5 border border-blue-700/30">
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      基本資料
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-300 block mb-1">姓名</span>
                        <span className="text-white font-medium">{selectedPatient.name}</span>
                      </div>
                      <div>
                        <span className="text-blue-300 block mb-1">聯絡電話</span>
                        <span className="text-white font-medium">{selectedPatient.phone || '未提供'}</span>
                      </div>
                      <div>
                        <span className="text-blue-300 block mb-1">LINE ID</span>
                        <span className="text-white font-medium">{selectedPatient.lineId || '未提供'}</span>
                      </div>
                      <div>
                        <span className="text-blue-300 block mb-1">總就診次數</span>
                        <span className="text-white font-medium">{selectedPatient.totalVisits} 次</span>
                      </div>
                      <div>
                        <span className="text-blue-300 block mb-1">首次就診</span>
                        <span className="text-white font-medium">{selectedPatient.firstVisit}</span>
                      </div>
                      <div>
                        <span className="text-blue-300 block mb-1">最後就診</span>
                        <span className="text-white font-medium">{selectedPatient.lastVisit}</span>
                      </div>
                    </div>
                  </div>

                  {/* 就診記錄 */}
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      就診記錄時間軸
                    </h4>
                    <div className="space-y-3">
                      {selectedPatient.appointments
                        .sort((a, b) => {
                          const dateA = new Date(`${a.taiwan_date || a.date || a.appointment_date} ${a.time_24h || a.time || a.appointment_time || '00:00'}`)
                          const dateB = new Date(`${b.taiwan_date || b.date || b.appointment_date} ${b.time_24h || b.time || b.appointment_time || '00:00'}`)
                          return dateB - dateA
                        })
                        .map((apt, idx) => {
                          const aptDate = apt.taiwan_date || apt.date || apt.appointment_date
                          const aptTime = apt.time_24h || apt.time || apt.appointment_time || ''
                          const aptItem = apt.treatment_item || apt.appointment_item || apt.treatment || '未指定療程'
                          const aptStatus = apt.appointment_status || apt.status || '尚未報到'
                          
                          return (
                            <div key={idx} className="bg-blue-800/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30 hover:bg-blue-700/40 transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-xs text-white font-medium">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-blue-300" />
                                      <span className="text-white font-medium">
                                        {aptDate}
                                      </span>
                                      <Clock className="w-4 h-4 text-blue-300 ml-2" />
                                      <span className="text-white">
                                        {aptTime.substring(0, 5) || '未指定'}
                                      </span>
                                    </div>
                                    <div className="text-sm text-blue-200 mt-1">
                                      時段: {apt.time_slot || '未指定'}
                                    </div>
                                  </div>
                                </div>
                                <span className={`
                                  px-3 py-1 rounded-full text-xs font-medium
                                  ${aptStatus === '已完成' || aptStatus === '已報到' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                                  ${aptStatus === '尚未報到' || aptStatus === '待約' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : ''}
                                  ${aptStatus === '已取消' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : ''}
                                  ${aptStatus === '未到' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : ''}
                                `}>
                                  {aptStatus}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-start">
                                    <Briefcase className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                    <div>
                                      <span className="text-blue-300">療程項目：</span>
                                      <span className="text-white font-medium">{aptItem}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <MapPin className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                    <div>
                                      <span className="text-blue-300">使用房間：</span>
                                      <span className="text-white">{apt.room_used || apt.room || '未指定'}</span>
                                    </div>
                                  </div>
                                  {(apt.equipment_used || apt.equipment) && (
                                    <div className="flex items-start">
                                      <Activity className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                      <div>
                                        <span className="text-blue-300">使用設備：</span>
                                        <span className="text-white">{apt.equipment_used || apt.equipment}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  {(apt.consultant || apt.executor) && (
                                    <div className="flex items-start">
                                      <UserCheck className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                      <div>
                                        <span className="text-blue-300">執行人員：</span>
                                        <span className="text-white">{apt.consultant || apt.executor}</span>
                                      </div>
                                    </div>
                                  )}
                                  {(apt.assistant || apt.consultant) && (
                                    <div className="flex items-start">
                                      <User className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                      <div>
                                        <span className="text-blue-300">諮詢師：</span>
                                        <span className="text-white">{apt.assistant || apt.consultant}</span>
                                      </div>
                                    </div>
                                  )}
                                  {(apt.attending_physician || apt.doctor) && (
                                    <div className="flex items-start">
                                      <Stethoscope className="w-4 h-4 text-blue-400 mr-2 mt-0.5" />
                                      <div>
                                        <span className="text-blue-300">主治醫師：</span>
                                        <span className="text-white">{apt.attending_physician || apt.doctor}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {apt.notes && (
                                <div className="mt-3 pt-3 border-t border-blue-700/30">
                                  <span className="text-blue-300 text-sm">備註：</span>
                                  <p className="text-white text-sm mt-1">{apt.notes}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
                )}


                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default MedicalRecordsPage
