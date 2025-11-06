import React, { useState, useMemo } from 'react';
import { format, addDays, subDays, parseISO, isBefore } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, List, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import EnhancedTimeSlotView from '@/components/EnhancedTimeSlotView';
import EnhancedAppointmentDialog from '@/components/EnhancedAppointmentDialog';

const AppointmentsPageEnhanced = () => {
  const { appointments, loading, refresh } = useAppointments();
  const [view, setView] = useState('calendar'); // 'calendar', 'list', 'timeslot'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('edit'); // 'edit' or 'create'

  // 歷史預約分界日期
  const HISTORY_CUTOFF_DATE = '2025-10-29';

  // 檢查是否為歷史預約
  const isHistoricalAppointment = (date) => {
    return isBefore(parseISO(date), parseISO(HISTORY_CUTOFF_DATE));
  };

  // 獲取療程分類顏色
  const getCategoryColor = (category) => {
    const categoryColors = {
      '雷射': 'bg-blue-100 border-blue-300',
      '保養': 'bg-orange-100 border-orange-300',
      '未分類': 'bg-purple-100 border-purple-300',
      '行銷合作': 'bg-gray-100 border-gray-300',
      '話調': 'bg-yellow-100 border-yellow-300',
      '針劑': 'bg-pink-100 border-pink-300',
      '水光': 'bg-green-100 border-green-300',
      '音波': 'bg-yellow-100 border-yellow-300',
    };
    return categoryColors[category] || 'bg-white border-gray-200';
  };

  // 獲取預約狀態顏色
  const getStatusColor = (status, date) => {
    // 10/29之前的已報到預約使用特殊顏色
    if (status === '已報到' && isHistoricalAppointment(date)) {
      return 'bg-teal-200 text-teal-900 border-teal-400';
    }
    
    const statusColors = {
      '尚未報到': 'bg-gray-100 text-gray-800',
      '已報到': 'bg-blue-100 text-blue-800',
      '進行中': 'bg-green-100 text-green-800',
      '已完成': 'bg-purple-100 text-purple-800',
      '已取消': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
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

  // 按日期分組預約
  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    appointments.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    
    // 對每個日期的預約按時間排序
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });
    
    return grouped;
  }, [appointments]);

  // 獲取當前月份的所有日期
  const currentMonthDates = useMemo(() => {
    const dates = [];
    const year = parseInt(selectedDate.split('-')[0]);
    const month = parseInt(selectedDate.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(date);
    }
    
    return dates;
  }, [selectedDate]);

  const handleAppointmentClick = (apt) => {
    setSelectedAppointment(apt);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleDateChange = (days) => {
    const newDate = days > 0 
      ? addDays(parseISO(selectedDate), days)
      : subDays(parseISO(selectedDate), Math.abs(days));
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // 渲染月曆視圖
  const renderCalendarView = () => (
    <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
      {/* 星期標題 */}
      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
        <div key={day} className="text-center font-semibold text-gray-600 py-2">
          {day}
        </div>
      ))}
      
      {/* 日期格子 */}
      {currentMonthDates.map(date => {
        const dayAppointments = appointmentsByDate[date] || [];
        const isToday = date === new Date().toISOString().split('T')[0];
        const isSelected = date === selectedDate;
        const historical = isHistoricalAppointment(date);
        
        return (
          <Card
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`
              p-1 sm:p-2 md:p-3 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] cursor-pointer transition-all 
              hover:shadow-xl hover:scale-105 hover:border-blue-400 hover:z-10
              ${isToday ? 'ring-2 ring-blue-500' : ''}
              ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
              ${historical ? 'bg-gray-50' : ''}
            `}
          >
            <div className="text-sm font-semibold mb-1">
              {parseInt(date.split('-')[2])}
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((apt, index) => {
                const categoryColor = getCategoryColor(apt.category);
                const longDuration = isLongDuration(apt);
                const blocked = isBlocked(apt);
                const historicalCheckedIn = apt.status === '已報到' && historical;
                
                return (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppointmentClick(apt);
                    }}
                    className={`
                      text-xs p-1 rounded border cursor-pointer 
                      hover:shadow-lg hover:scale-105 hover:z-10 transition-all
                      ${historicalCheckedIn ? 'bg-teal-200 border-teal-400 text-teal-900' : categoryColor}
                      ${longDuration ? 'border-red-400 border-2' : ''}
                      ${blocked ? 'border-gray-600 bg-gray-200' : ''}
                      ${historical && !historicalCheckedIn ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="font-semibold truncate">
                      {apt.time?.substring(0, 5)} {apt.patient_name}
                    </div>
                    <div className="truncate text-gray-600">
                      {apt.treatment}
                    </div>
                  </div>
                );
              })}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{dayAppointments.length - 3} 更多
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  // 渲染列表視圖
  const renderListView = () => {
    const selectedDateAppointments = appointmentsByDate[selectedDate] || [];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {format(parseISO(selectedDate), 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              今天
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDateChange(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedDateAppointments.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            此日期沒有預約
          </Card>
        ) : (
          selectedDateAppointments.map((apt, index) => {
            const categoryColor = getCategoryColor(apt.category);
            const historical = isHistoricalAppointment(apt.date);
            const longDuration = isLongDuration(apt);
            const blocked = isBlocked(apt);
            
            return (
              <Card
                key={index}
                onClick={() => handleAppointmentClick(apt)}
                className={`
                  p-4 cursor-pointer transition-all hover:shadow-md border-l-4
                  ${categoryColor}
                  ${historical ? 'opacity-60' : ''}
                  ${longDuration ? 'border-l-red-500' : ''}
                  ${blocked ? 'bg-gray-100' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold">{apt.patient_name}</span>
                      <Badge className={getStatusColor(apt.status, apt.date)}>
                        {apt.status || '未報到'}
                      </Badge>
                      {historical && (
                        <Badge variant="outline" className="bg-gray-100">
                          歷史預約
                        </Badge>
                      )}
                      {longDuration && (
                        <Badge variant="outline" className="bg-red-100">
                          長時療程 ({apt.duration}h)
                        </Badge>
                      )}
                      {blocked && (
                        <Badge variant="destructive">
                          占用/上課
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>⏰ {apt.time}</div>
                      <div>💊 {apt.treatment}</div>
                      <div>📍 {apt.room || '未指定'}</div>
                      <div>👤 {apt.staff || '未指定'}</div>
                      {apt.consultant && <div>💬 諮詢師：{apt.consultant}</div>}
                      {apt.source && <div>📊 來源：{apt.source}</div>}
                    </div>
                    {apt.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        📝 {apt.notes}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-3xl font-bold">預約管理</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            月曆
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4 mr-2" />
            列表
          </Button>
          <Button
            variant={view === 'timeslot' ? 'default' : 'outline'}
            onClick={() => setView('timeslot')}
          >
            <Clock className="w-4 h-4 mr-2" />
            時段
          </Button>
          <Button onClick={handleCreateAppointment}>
            <Plus className="w-4 h-4 mr-2" />
            新增預約
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : (
        <>
          {view === 'calendar' && renderCalendarView()}
          {view === 'list' && renderListView()}
          {view === 'timeslot' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    今天
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDateChange(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <EnhancedTimeSlotView
                appointments={appointments}
                selectedDate={selectedDate}
                onAppointmentClick={handleAppointmentClick}
              />
            </div>
          )}
        </>
      )}

      <EnhancedAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
        mode={dialogMode}
        onSuccess={refresh}
      />
    </div>
  );
};

export default AppointmentsPageEnhanced;

