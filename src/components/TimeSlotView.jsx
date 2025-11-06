import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Stethoscope, MapPin, AlertTriangle, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// 診所營業時間: 10:30 - 21:00
const START_TIME_HOUR = 10
const START_TIME_MINUTE = 30
const END_TIME_HOUR = 21
const END_TIME_MINUTE = 0
const INTERVAL_MINUTES = 30 // 0.5 小時單位
const SLOTS_PER_TIME = 3 // 每個時段 3 個空格

// 顏色標記系統
const STATUS_COLORS = {
  '尚未報到': 'bg-yellow-500',
  '已報到': 'bg-blue-500',
  '進行中': 'bg-green-500',
  '已完成': 'bg-gray-500',
  '已取消': 'bg-red-500',
}

// 產生時段列表
const generateTimeSlots = () => {
  const slots = []
  let currentMinutes = START_TIME_HOUR * 60 + START_TIME_MINUTE
  const endMinutes = END_TIME_HOUR * 60 + END_TIME_MINUTE
  
  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const minute = currentMinutes % 60
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    
    slots.push({ time: timeString })
    currentMinutes += INTERVAL_MINUTES
  }
  
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export function TimeSlotView({ selectedDate, onAppointmentClick }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 格式化日期
  const formatDate = (date) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const dateString = formatDate(selectedDate)

  // 從資料庫讀取當日預約
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('flos_appointments_v2')
          .select('*')
          .eq('taiwan_date', dateString)
          .order('time_24h', { ascending: true })

        if (fetchError) throw fetchError

        setAppointments(data || [])
      } catch (err) {
        console.error('讀取預約資料失敗:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (dateString) {
      fetchAppointments()
    }
  }, [dateString])

  if (loading) {
    return (
      <div className="text-white p-4 text-center">
        <p>載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-white p-4">
        <p className="text-red-300">載入失敗: {error}</p>
      </div>
    )
  }

  try {
    // 按時段分組預約
    const appointmentsBySlot = {}
    TIME_SLOTS.forEach(slot => {
      appointmentsBySlot[slot.time] = []
    })

    // 將預約分配到對應時段
    appointments.forEach(apt => {
      if (!apt) return
      
      const aptTime = (apt.time_24h || '').substring(0, 5)
      if (appointmentsBySlot[aptTime]) {
        appointmentsBySlot[aptTime].push(apt)
      }
    })

    // 計算每小時的預約數
    const hourlyCount = {}
    appointments.forEach(apt => {
      if (!apt) return
      
      const aptTime = (apt.time_24h || '').substring(0, 5)
      const hour = aptTime.substring(0, 2)
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1
    })

    const displayDate = selectedDate.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{displayDate}</h3>
          <div className="flex gap-2">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-gray-400">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {TIME_SLOTS.map(slot => {
            const slotAppointments = appointmentsBySlot[slot.time] || []
            const hour = slot.time.substring(0, 2)
            const hourCount = hourlyCount[hour] || 0
            const isOverbooked = hourCount > 3

            // 建立 3 個空格陣列
            const slotItems = []
            for (let i = 0; i < SLOTS_PER_TIME; i++) {
              if (i < slotAppointments.length) {
                slotItems.push({ type: 'appointment', data: slotAppointments[i] })
              } else {
                slotItems.push({ type: 'empty', index: i })
              }
            }

            return (
              <Card 
                key={slot.time} 
                className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-semibold text-white">{slot.time}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      {slotItems.map((item, index) => {
                        if (item.type === 'appointment') {
                          const apt = item.data
                          const statusColor = STATUS_COLORS[apt.appointment_status] || 'bg-gray-500'
                          
                          return (
                            <div
                              key={apt.id || index}
                              onClick={() => onAppointmentClick?.(apt)}
                              className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-all"
                            >
                              <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                              
                              <div className="flex-1 space-y-1">
                                {/* 第一行：主要資訊 */}
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-400" />
                                    <span className="text-white font-semibold text-base">
                                      {apt.customer_name || '未命名'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-300 font-medium">
                                      {apt.treatment_item || '-'}
                                    </span>
                                  </div>
                                  
                                  <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                                    {apt.appointment_status || '尚未報到'}
                                  </Badge>
                                </div>
                                
                                {/* 第二行：詳細資訊 */}
                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-gray-300">{apt.room_used || '未指定房間'}</span>
                                  </div>
                                  
                                  {apt.attending_physician && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">👨‍⚕️</span>
                                      <span className="text-purple-300">{apt.attending_physician}</span>
                                    </div>
                                  )}
                                  
                                  {apt.consultant && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">💬</span>
                                      <span className="text-cyan-300">{apt.consultant}</span>
                                    </div>
                                  )}
                                  
                                  {apt.contact_phone && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">📞</span>
                                      <span className="text-gray-400">{apt.contact_phone}</span>
                                    </div>
                                  )}
                                  
                                  {apt.equipment_used && apt.equipment_used !== '無' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">⚙️</span>
                                      <span className="text-orange-300">{apt.equipment_used}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        } else {
                          // 空格
                          return (
                            <div
                              key={`empty-${index}`}
                              onClick={() => onAppointmentClick?.({ date: dateString, time: slot.time })}
                              className="flex items-center gap-3 p-3 bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700/30 hover:border-blue-500 cursor-pointer transition-all group"
                            >
                              <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                              <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                                點擊新增預約
                              </span>
                            </div>
                          )
                        }
                      })}
                      
                      {isOverbooked && (
                        <div className="flex items-center gap-3 p-3 bg-purple-800/70 rounded-lg text-white text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-300" />
                          <span>⚠️ 注意: 本小時預約數已超額 ({hourCount} 個)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  } catch (error) {
    console.error('TimeSlotView錯誤:', error)
    return (
      <div className="text-white p-4">
        <p>時段視圖載入失敗</p>
        <p className="text-sm text-red-300">{error.message}</p>
      </div>
    )
  }
}
