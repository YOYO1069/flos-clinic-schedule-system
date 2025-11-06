import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pencil, Trash2, Clock, User, Stethoscope } from 'lucide-react'
import { getAppointmentColor, getStatusBadgeColor } from '@/lib/appointmentColors'

/**
 * 日期預約懸停窗組件
 * 用於顯示某日期的所有預約列表，並提供編輯和刪除功能
 */
export function DateAppointmentPopover({ 
  dateString, 
  appointments, 
  onEdit, 
  onDelete, 
  children 
}) {
  if (!appointments || appointments.length === 0) {
    return children
  }

  // 按時間排序預約
  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = a.time || a.appointment_time || '00:00'
    const timeB = b.time || b.appointment_time || '00:00'
    return timeA.localeCompare(timeB)
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[90vw] sm:w-[400px] max-w-[min(400px,90vw)] p-0 bg-gradient-to-br from-blue-900/98 to-indigo-900/98 backdrop-blur-xl border-2 border-blue-500/30 shadow-2xl z-50" 
        align="center"
        side="top"
        sideOffset={12}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={{top: 20, right: 20, bottom: 20, left: 20}}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader className="pb-3 border-b border-blue-700/30">
            <CardTitle className="text-white text-lg flex items-center justify-between">
              <span>{dateString} 預約列表</span>
              <span className="text-sm font-normal text-blue-300">
                共 {sortedAppointments.length} 筆
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] sm:h-[400px] max-h-[70vh]">
              <div className="p-4 space-y-2">
                {sortedAppointments.map((apt, index) => {
                  const colorStyle = getAppointmentColor(apt)
                  const statusColor = getStatusBadgeColor(apt.status || apt.appointment_status)
                  
                  return (
                    <div
                      key={apt.id || index}
                      className="bg-blue-800/40 border border-blue-700/30 rounded-lg p-3 hover:bg-blue-700/50 transition-all group"
                    >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-300" />
                          <span className="text-white font-semibold">
                            {(apt.time_24h || apt.time || apt.appointment_time)?.substring(0, 5) || '--:--'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                            {apt.status || apt.appointment_status || '未知'}
                          </span>
                          {colorStyle.label !== '預約' && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorStyle.bgClass}`}>
                              {colorStyle.label}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-4 h-4 text-blue-300" />
                          <span className="text-white font-medium">
                            {apt.user_name || apt.patient_name || apt.customer_name || '未命名'}
                          </span>
                        </div>

                        <div className="text-sm text-blue-200 space-y-1">
                          {(apt.treatment_item || apt.appointment_item || apt.treatment) && (
                            <div>💉 {apt.treatment_item || apt.appointment_item || apt.treatment}</div>
                          )}
                          {(apt.attending_physician || apt.on_duty_doctor || apt.executor) && (
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="w-3 h-3" />
                              <span>{apt.attending_physician || apt.on_duty_doctor || apt.executor}</span>
                            </div>
                          )}
                          {(apt.room_used || apt.room) && (
                            <div>🏠 {apt.room_used || apt.room}</div>
                          )}
                          {(apt.contact_phone || apt.phone) && (
                            <div>📞 {apt.contact_phone || apt.phone}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-300 hover:text-white hover:bg-blue-600/50"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(apt)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-300 hover:text-white hover:bg-red-600/50"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`確定要刪除 ${apt.user_name || apt.patient_name || apt.customer_name} 的預約嗎？`)) {
                              onDelete?.(apt.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
