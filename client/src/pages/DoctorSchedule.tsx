import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// 醫師資料
const doctors = [
  { id: 1, name: '伍詠聰', color: '#FF6B6B' },
  { id: 2, name: '何逸群', color: '#4ECDC4' },
  { id: 3, name: '宋昀翰', color: '#45B7D1' },
  { id: 4, name: '林思宇', color: '#96CEB4' },
  { id: 5, name: '王昱淞', color: '#FFEAA7' },
  { id: 6, name: '蔡秉遑', color: '#DFE6E9' },
  { id: 7, name: '藍子軒', color: '#74B9FF' },
  { id: 8, name: '郭昌浩', color: '#A29BFE' },
  { id: 9, name: '郭昌濬', color: '#FD79A8' },
  { id: 10, name: '鍾曜任', color: '#FDCB6E' },
  { id: 11, name: '黃俊堯', color: '#6C5CE7' },
  { id: 12, name: '龍勤莉', color: '#00B894' }
];

interface Schedule {
  id?: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'ON' | 'OFF';
  created_at?: string;
}

export default function DoctorSchedule() {
  const [, setLocation] = useLocation();
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(11);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入排班資料
  useEffect(() => {
    loadSchedules();
  }, [currentYear, currentMonth]);

  async function loadSchedules() {
    setLoading(true);
    try {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;
      
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('載入排班資料失敗:', error);
        toast.error('載入排班資料失敗');
      } else {
        setSchedules(data || []);
      }
    } catch (err) {
      console.error('載入排班資料錯誤:', err);
      toast.error('載入資料時發生錯誤');
    }
    setLoading(false);
  }

  // 切換排班狀態
  async function toggleSchedule(doctorName: string, doctorId: string, date: string) {
    const existing = schedules.find(
      s => s.doctor_name === doctorName && s.date === date
    );

    try {
      if (existing) {
        // 刪除排班
        const { error } = await supabase
          .from('doctor_schedules')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        toast.success('已取消排班');
      } else {
        // 新增排班
        const { error } = await supabase
          .from('doctor_schedules')
          .insert([{
            doctor_id: doctorId,
            doctor_name: doctorName,
            date: date,
            start_time: '09:00',
            end_time: '18:00',
          }]);

        if (error) throw error;
        toast.success('已新增排班');
      }

      // 重新載入
      await loadSchedules();
    } catch (err) {
      console.error('更新排班失敗:', err);
      toast.error('更新排班失敗');
    }
  }

  // 取得該日期的排班狀態
  function getScheduleStatus(doctorName: string, date: string): 'ON' | 'OFF' {
    const schedule = schedules.find(
      s => s.doctor_name === doctorName && s.date === date
    );
    return schedule ? 'ON' : 'OFF';
  }

  // 取得該月份的天數
  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  // 取得星期幾
  function getDayOfWeek(year: number, month: number, day: number): string {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  }

  // 上個月
  const previousMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 下個月
  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 標題區 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-pink-600">🏥 FLOS 曜診所 - 醫師排班</h1>
              <p className="text-gray-600 mt-1">醫師排班管理 - {currentYear}年{currentMonth}月</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setLocation('/admin')}>
                <Home className="w-4 h-4 mr-2" />
                返回主控台
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-2 bg-white border rounded-lg min-w-[120px] text-center">
                  {currentYear}年{currentMonth}月
                </div>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 醫師陣容 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👨‍⚕️ 醫師陣容 (12位)</h2>
          <p className="text-sm text-gray-600 mb-4">
            點擊排班狀態按鈕切換ON/OFF,週日自動休診
          </p>
          <div className="grid grid-cols-4 gap-4">
            {doctors.map(doctor => (
              <div 
                key={doctor.id}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: doctor.color }}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: doctor.color }}
                />
                <span className="font-medium">{doctor.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 排班表 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            📅 {currentYear}年{currentMonth}月 醫師排班表
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            點擊格子切換排班狀態：OFF → ON → OFF,週日自動休診
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left font-medium sticky left-0 bg-gray-50 z-10">
                      醫師 / 日期
                    </th>
                    {dates.map(day => {
                      const dayOfWeek = getDayOfWeek(currentYear, currentMonth, day);
                      const isWeekend = dayOfWeek === '週六' || dayOfWeek === '週日';
                      return (
                        <th 
                          key={day}
                          className={`border p-2 text-center text-sm ${
                            isWeekend ? 'bg-red-50' : ''
                          }`}
                        >
                          <div>{day}</div>
                          <div className="text-xs text-gray-500">{dayOfWeek}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td className="border p-2 font-medium sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: doctor.color }}
                          />
                          {doctor.name}
                        </div>
                      </td>
                      {dates.map(day => {
                        const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const status = getScheduleStatus(doctor.name, date);
                        const dayOfWeek = getDayOfWeek(currentYear, currentMonth, day);
                        const isSunday = dayOfWeek === '週日';
                        
                        return (
                          <td 
                            key={day}
                            className={`border p-1 text-center ${
                              isSunday ? 'bg-gray-100' : ''
                            }`}
                          >
                            <Button
                              size="sm"
                              variant={status === 'ON' ? 'default' : 'outline'}
                              className={`w-full text-xs ${
                                status === 'ON' 
                                  ? 'text-white' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                              style={status === 'ON' ? { backgroundColor: doctor.color } : {}}
                              onClick={() => toggleSchedule(doctor.name, doctor.id.toString(), date)}
                              disabled={isSunday}
                            >
                              {isSunday ? '休' : status}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 頁尾 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>FLOS 曜診所 | 診所管理系統</p>
          <p className="mt-1">本排班表由系統自動生成 - {new Date().toLocaleDateString('zh-TW')}</p>
        </div>
      </div>
    </div>
  );
}
