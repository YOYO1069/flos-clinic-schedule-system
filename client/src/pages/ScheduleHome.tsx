import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Users, Clock, ArrowRight, Fingerprint } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { doctorScheduleClient } from "@/lib/supabase";

export default function ScheduleHome() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    loadWeeklySchedules();
  }, []);

  const loadWeeklySchedules = async () => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 6);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await doctorScheduleClient
        .from('doctor_shift_schedules')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('載入排班失敗:', error);
      } else {
        setWeeklySchedules(data || []);
      }
    } catch (err) {
      console.error('載入排班錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const schedulesByDate = weeklySchedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, any[]>);

  const getDayOfWeek = (dateStr: string) => {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return `${date.getMonth() + 1}/${date.getDate()} (${getDayOfWeek(dateStr)})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent"></div>
      
      {/* 動態光球 */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* 主要內容 */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* 頭部 */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
            className="px-6 py-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            ← 上一頁
          </button>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl">
              FLOS 曜診所
            </h1>
            <p className="text-white/90 text-lg mt-2 font-medium">排班管理系統</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* 員工打卡按鈕 - 超大顯眼 */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => setLocation('/attendance')}
            className="group relative px-12 py-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative flex items-center gap-4">
              <Fingerprint className="w-10 h-10 text-white" />
              <span className="text-3xl font-bold text-white">員工打卡</span>
            </div>
          </button>
        </div>

        {/* 功能區域 - 簡潔的兩列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 醫師排班 */}
          <button
            onClick={() => setLocation('/doctor-schedule')}
            className="group p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">醫師排班</h3>
                  <p className="text-white/70 text-sm">管理醫師值班時間</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* 員工排班 */}
          {permissions.canAccessLeaveCalendar && (
            <button
              onClick={() => setLocation('/leave-calendar')}
              className="group p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">員工排班</h3>
                    <p className="text-white/70 text-sm">管理員工請假與排班</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          )}
        </div>

        {/* 本週排班 - 精簡設計 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">本週醫師排班</h3>
            </div>
            <button
              onClick={() => setLocation('/doctor-schedule')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              查看完整排班 →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
              <p className="mt-3 text-white/70">載入中...</p>
            </div>
          ) : Object.keys(schedulesByDate).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 text-lg">本週無排班資料</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(schedulesByDate).map(([date, schedules]) => (
                <div key={date} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-white font-bold mb-2.5 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></div>
                    {formatDate(date)}
                  </div>
                  <div className="space-y-1.5">
                    {schedules.map((schedule, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                          <span className="text-white font-medium">{schedule.doctor_name}</span>
                        </div>
                        <span className="text-white/60 text-sm">
                          {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
