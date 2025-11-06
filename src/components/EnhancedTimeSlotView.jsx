import React, { useMemo } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';

const EnhancedTimeSlotView = ({ appointments, selectedDate, onAppointmentClick }) => {
  // 營業時間：10:30 - 21:00
  const BUSINESS_START = 10.5; // 10:30
  const BUSINESS_END = 21; // 21:00
  const SLOT_DURATION = 0.5; // 30分鐘
  const MAX_APPOINTMENTS_PER_HOUR = 3; // 每小時最多3個預約
  
  // 歷史預約分界日期
  const HISTORY_CUTOFF_DATE = '2025-10-29';

  // 生成時段列表
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = BUSINESS_START; hour < BUSINESS_END; hour += SLOT_DURATION) {
      const hourInt = Math.floor(hour);
      const minutes = (hour % 1) * 60;
      slots.push({
        time: hour,
        label: `${String(hourInt).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      });
    }
    return slots;
  }, []);

  // 將預約分配到時段
  const slotAppointments = useMemo(() => {
    const slotMap = {};
    
    timeSlots.forEach(slot => {
      slotMap[slot.label] = [];
    });

    appointments
      .filter(apt => apt.date === selectedDate)
      .forEach(apt => {
        const time = apt.time?.substring(0, 5); // HH:MM
        if (slotMap[time]) {
          slotMap[time].push(apt);
        }
      });

    return slotMap;
  }, [appointments, selectedDate, timeSlots]);

  // 檢查是否為歷史預約
  const isHistoricalAppointment = (date) => {
    return isBefore(parseISO(date), parseISO(HISTORY_CUTOFF_DATE));
  };

  // 獲取預約狀態顏色
  const getStatusColor = (status) => {
    const statusColors = {
      '尚未報到': 'bg-gray-100 text-gray-800',
      '已報到': 'bg-blue-100 text-blue-800',
      '進行中': 'bg-green-100 text-green-800',
      '已完成': 'bg-purple-100 text-purple-800',
      '已取消': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // 獲取療程分類顏色
  const getCategoryColor = (category) => {
    const categoryColors = {
      '雷射': 'bg-blue-50 border-blue-200',
      '保養': 'bg-orange-50 border-orange-200',
      '未分類': 'bg-purple-50 border-purple-200',
      '行銷合作': 'bg-gray-50 border-gray-200',
      '話調': 'bg-yellow-50 border-yellow-200',
      '針劑': 'bg-pink-50 border-pink-200',
      '水光': 'bg-green-50 border-green-200',
      '音波': 'bg-yellow-50 border-yellow-200',
    };
    return categoryColors[category] || 'bg-white border-gray-200';
  };

  // 檢查時段是否超額
  const isOverbooked = (appointments) => {
    // 計算該小時內的總預約數
    return appointments.length > MAX_APPOINTMENTS_PER_HOUR;
  };

  // 檢查預約是否超時（療程時間 > 1小時）
  const isLongDuration = (apt) => {
    return apt.duration && parseFloat(apt.duration) > 1.0;
  };

  // 檢查是否為占用時間或上課
  const isBlocked = (apt) => {
    const treatment = apt.treatment?.toLowerCase() || '';
    return treatment.includes('占用') || treatment.includes('上課') || treatment.includes('休息');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(parseISO(selectedDate), 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
        </h3>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="bg-yellow-50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            超額預約
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            <Clock className="w-3 h-3 mr-1" />
            長時療程
          </Badge>
          <Badge variant="outline" className="bg-gray-100">
            <Users className="w-3 h-3 mr-1" />
            歷史預約
          </Badge>
        </div>
      </div>

      {timeSlots.map(slot => {
        const aptsInSlot = slotAppointments[slot.label] || [];
        const overbooked = isOverbooked(aptsInSlot);

        return (
          <div key={slot.label} className="flex gap-2">
            {/* 時間標籤 */}
            <div className="w-20 flex-shrink-0 font-medium text-gray-600 pt-2">
              {slot.label}
            </div>

            {/* 預約格子區域 */}
            <div className="flex-1 grid grid-cols-3 gap-2">
              {[0, 1, 2].map(index => {
                const apt = aptsInSlot[index];
                
                if (!apt) {
                  return (
                    <Card 
                      key={index}
                      className="p-2 bg-gray-50 border-dashed border-gray-200 min-h-[60px] flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-400">無預約</span>
                    </Card>
                  );
                }

                const historical = isHistoricalAppointment(apt.date);
                const longDuration = isLongDuration(apt);
                const blocked = isBlocked(apt);
                const categoryColor = getCategoryColor(apt.category);

                return (
                  <Card
                    key={index}
                    onClick={() => onAppointmentClick(apt)}
                    className={`
                      p-2 cursor-pointer transition-all hover:shadow-md border-2
                      ${categoryColor}
                      ${historical ? 'opacity-60' : ''}
                      ${longDuration ? 'border-red-400 bg-red-50' : ''}
                      ${blocked ? 'border-gray-600 bg-gray-200' : ''}
                      ${overbooked ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    <div className="space-y-1">
                      {/* 姓名和狀態 */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">
                          {apt.patient_name}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(apt.status)}`}
                        >
                          {apt.status || '未報到'}
                        </Badge>
                      </div>

                      {/* 療程 */}
                      <div className="text-xs text-gray-700 truncate">
                        {apt.treatment}
                      </div>

                      {/* 房間 */}
                      {apt.room && (
                        <div className="text-xs text-gray-500 truncate">
                          📍 {apt.room}
                        </div>
                      )}

                      {/* 警告標記 */}
                      <div className="flex gap-1 mt-1">
                        {blocked && (
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ 占用
                          </Badge>
                        )}
                        {longDuration && (
                          <Badge variant="outline" className="text-xs bg-red-100">
                            ⏱️ {apt.duration}h
                          </Badge>
                        )}
                        {historical && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            📅 歷史
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 超額預約警告 */}
      {Object.values(slotAppointments).some(apts => isOverbooked(apts)) && (
        <Alert className="mt-4 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            部分時段預約數量超過建議上限（每小時3個），請注意調整排程。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedTimeSlotView;

