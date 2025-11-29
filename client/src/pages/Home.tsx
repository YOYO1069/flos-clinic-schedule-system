import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase, doctors } from "@/lib/supabase";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";

interface Schedule {
  id?: number;
  doctor_name: string;
  date: string;
  status: 'ON' | 'OFF';
  created_at?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(10);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'doctor' | 'staff'>('doctor');

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
        .from('flos_schedules')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('載入排班資料失敗:', error);
      } else {
        setSchedules(data || []);
      }
    } catch (err) {
      console.error('載入排班資料錯誤:', err);
    }
    setLoading(false);
  }

  // 切換排班狀態
  async function toggleSchedule(doctorName: string, date: string) {
    const existing = schedules.find(
      s => s.doctor_name === doctorName && s.date === date
    );

    try {
      if (existing) {
        // 切換狀態
        const newStatus = existing.status === 'ON' ? 'OFF' : 'ON';
        const { error } = await supabase
          .from('flos_schedules')
          .update({ status: newStatus })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // 新增排班
        const { error } = await supabase
          .from('flos_schedules')
          .insert([{
            doctor_name: doctorName,
            date: date,
            status: 'ON'
          }]);

        if (error) throw error;
      }

      // 重新載入
      await loadSchedules();
    } catch (err) {
      console.error('更新排班失敗:', err);
    }
  }

  // 取得該日期的排班狀態
  function getScheduleStatus(doctorName: string, date: string): 'ON' | 'OFF' {
    const schedule = schedules.find(
      s => s.doctor_name === doctorName && s.date === date
    );
    return schedule?.status || 'OFF';
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

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 標題區 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-pink-600">🏥 {APP_TITLE}</h1>
              <p className="text-gray-600 mt-1">醫師與員工排班管理 - {currentYear}年{currentMonth}月</p>
            </div>
            <div className="flex gap-4">
              <select 
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value={2025}>2025年</option>
                <option value={2026}>2026年</option>
              </select>
              <select 
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 功能選單 */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setLocation('/')}
          >
            🏠 返回首頁
          </Button>
          
          {permissions.canManageDoctorSchedule && (
            <Button 
              onClick={() => setActiveTab('doctor')}
              variant={activeTab === 'doctor' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              👨‍⚕️ 醫師排班
            </Button>
          )}
          
          {permissions.canManageStaffSchedule && (
            <Button 
              onClick={() => setActiveTab('staff')}
              variant={activeTab === 'staff' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              👥 員工排班
            </Button>
          )}
          
          {permissions.canAccessLeaveCalendar && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setLocation('/leave-calendar')}
            >
              📅 休假月曆
            </Button>
          )}
          
          {permissions.canAccessAttendance && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setLocation('/attendance')}
            >
              ⏰ 員工打卡
            </Button>
          )}
          
          {permissions.canAccessLeaveManagement && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setLocation('/leave')}
            >
              📝 請假管理
            </Button>
          )}
          
          {permissions.canAccessLeaveApproval && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setLocation('/approval')}
            >
              ✅ 請假審核
            </Button>
          )}
          
          {(user?.position === '美容師' || user?.position === '護理師') && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100"
              onClick={() => setLocation('/operation-fee')}
            >
              💰 操作費計算
            </Button>
          )}
          
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
              onClick={() => setLocation('/attendance-settings')}
            >
              ⚙️ 打卡設定
            </Button>
          )}
        </div>

        {/* 醫師陣容 */}
        {activeTab === 'doctor' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">👨‍⚕️ 醫師陣容 (8位)</h2>
            <p className="text-sm text-gray-600 mb-4">
              點擊排班狀態按鈕切換ON/OFF，系統已根據診所營業時間預設排班
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
        )}

        {/* 排班表 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            📅 {currentYear}年{currentMonth}月 排班表
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            點擊格子切換排班狀態：OFF → ON → OFF，不提供半天班選項
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
                              onClick={() => toggleSchedule(doctor.name, date)}
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

