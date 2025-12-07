import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Users, Clock, Fingerprint, Monitor, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 頭部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
            className="px-5 py-2 bg-white rounded-full text-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-purple-200"
          >
            ← 上一頁
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              FLOS 曜診所
            </h1>
            <p className="text-slate-600 text-sm mt-1 font-medium">排班管理系統</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* 卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 員工打卡卡片 - 最大最顯眼 */}
          <div className="md:col-span-2 lg:col-span-3">
            <button
              onClick={() => setLocation('/attendance')}
              className="w-full group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-8"
            >
              {/* 背景圓點紋理 */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              <div className="relative flex items-center justify-center gap-6">
                <div className="p-6 bg-white/30 rounded-2xl backdrop-blur-sm">
                  <Fingerprint className="w-16 h-16 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2">員工打卡</h2>
                  <p className="text-white/90 text-lg font-medium">快速便捷的考勤管理</p>
                </div>
                <ChevronRight className="w-12 h-12 text-white/70 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>

          {/* 電子看板卡片 */}
          {permissions.canAccessAttendanceDashboard && (
            <div className="md:col-span-2 lg:col-span-3">
              <button
                onClick={() => setLocation('/attendance-dashboard')}
                className="w-full group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6"
              >
                {/* 背景圓點紋理 */}
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px'
                }}></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-white/30 rounded-2xl backdrop-blur-sm">
                      <Monitor className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-3xl font-black text-white mb-1">電子看板</h3>
                      <p className="text-white/80 font-medium">即時顯示今日打卡狀況</p>
                    </div>
                  </div>
                  <ChevronRight className="w-10 h-10 text-white/60 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* 醫師排班卡片 */}
          <div className="md:col-span-1">
            <button
              onClick={() => setLocation('/doctor-schedule')}
              className="w-full h-full group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-400 to-cyan-500 p-6"
            >
              {/* 背景圓點紋理 */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}></div>
              
              <div className="relative h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-5 bg-white/30 rounded-2xl backdrop-blur-sm">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">醫師排班</h3>
                  <p className="text-white/80 text-sm font-medium">管理醫師值班時間</p>
                </div>
                <ChevronRight className="w-8 h-8 text-white/60 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* 員工排班卡片 */}
          {permissions.canAccessLeaveCalendar && (
            <div className="md:col-span-1">
              <button
                onClick={() => setLocation('/leave-calendar')}
                className="w-full h-full group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-rose-400 to-pink-500 p-6"
              >
                {/* 背景圓點紋理 */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}></div>
                
                <div className="relative h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-5 bg-white/30 rounded-2xl backdrop-blur-sm">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">員工排班</h3>
                    <p className="text-white/80 text-sm font-medium">管理員工請假與排班</p>
                  </div>
                  <ChevronRight className="w-8 h-8 text-white/60 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* 本週排班卡片 */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6">
              {/* 背景圓點紋理 */}
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px'
              }}></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-xl backdrop-blur-sm">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white">本週醫師排班</h3>
                  </div>
                  <button
                    onClick={() => setLocation('/doctor-schedule')}
                    className="px-4 py-2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    查看完整
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                    <p className="mt-3 text-white font-medium">載入中...</p>
                  </div>
                ) : Object.keys(schedulesByDate).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white text-lg font-medium">本週無排班資料</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(schedulesByDate).slice(0, 6).map(([date, schedules]) => (
                      <div key={date} className="bg-white/25 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                        <div className="text-white font-bold mb-2.5 text-sm">
                          {formatDate(date)}
                        </div>
                        <div className="space-y-1.5">
                          {schedules.map((schedule, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-white/20 rounded-lg text-sm">
                              <span className="text-white font-semibold truncate">{schedule.doctor_name}</span>
                              <span className="text-white/80 text-xs whitespace-nowrap ml-2">
                                {schedule.start_time.slice(0, 5)}-{schedule.end_time.slice(0, 5)}
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
        </div>
      </div>
    </div>
  );
}
