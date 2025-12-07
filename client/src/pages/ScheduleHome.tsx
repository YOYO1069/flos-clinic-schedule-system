import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, ArrowRight, ArrowLeft, Fingerprint, Monitor } from "lucide-react";
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { doctorScheduleClient } from "@/lib/supabase";

// 本週排班卡片組件
function WeeklyScheduleCard({ setLocation }: { setLocation: (path: string) => void }) {
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklySchedules();
  }, []);

  const loadWeeklySchedules = async () => {
    try {
      // 獲取今天開始的 7 天
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

  // 按日期分組
  const schedulesByDate = weeklySchedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, any[]>);

  // 獲取星期幾
  const getDayOfWeek = (dateStr: string) => {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return `${date.getMonth() + 1}/${date.getDate()} (${getDayOfWeek(dateStr)})`;
  };

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">本週醫師排班</CardTitle>
              <CardDescription className="text-slate-600">快速查看本週排班狀況</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300 font-semibold"
            onClick={() => setLocation('/doctor-schedule')}
          >
            查看完整排班
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            載入中...
          </div>
        ) : Object.keys(schedulesByDate).length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-slate-600">
              本週無排班資料
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(schedulesByDate).map(([date, schedules]) => (
              <div key={date} className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                <div className="font-semibold text-teal-900 mb-2">
                  {formatDate(date)}
                </div>
                <div className="space-y-2">
                  {schedules.map((schedule, idx) => (
                    <div key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="font-medium">{schedule.doctor_name}</span>
                      <span className="text-slate-500">
                        {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ScheduleHome() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 動態背景層 */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-transparent"></div>
      
      {/* 裝飾性圖形 */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* 內容層 */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 返回按鈕 */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
              className="bg-white/90 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一頁
            </Button>
          </div>
          
          {/* 標題區域 */}
          <div className="text-center space-y-6">
            <div className="inline-block">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-2xl">
                FLOS 曜診所
              </h1>
              <div className="h-1.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-semibold drop-shadow-lg">排班管理系統</p>
            
            {/* 主要操作按鈕 */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button 
                size="lg"
                onClick={() => setLocation('/attendance')}
                className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 px-10 py-7 text-xl font-bold rounded-2xl border-2 border-white/30 hover:scale-110 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <Fingerprint className="h-8 w-8 mr-3 relative z-10" />
                <span className="relative z-10">員工打卡</span>
              </Button>
              {permissions.canAccessAttendanceDashboard && (
              <Button 
                size="lg"
                onClick={() => setLocation('/attendance-dashboard')}
                className="group relative bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 px-10 py-7 text-xl font-bold rounded-2xl border-2 border-white/30 hover:scale-110 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <Monitor className="h-8 w-8 mr-3 relative z-10" />
                <span className="relative z-10">電子看板</span>
              </Button>
              )}
            </div>
          </div>

          {/* 功能卡片區域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* 醫師排班卡片 */}
            <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-teal-500/30 transition-all duration-500 hover:-translate-y-3 hover:scale-105">
              {/* 卡片背景裝飾 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-teal-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl group-hover:shadow-teal-500/50 group-hover:scale-110 transition-all duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">醫師排班</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">管理醫師值班時間</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button 
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  onClick={() => setLocation('/doctor-schedule')}
                >
                  進入醫師排班管理
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* 員工排班卡片 */}
            {permissions.canAccessLeaveCalendar && (
            <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-3 hover:scale-105">
              {/* 卡片背景裝飾 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">員工排班</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">管理員工請假與排班</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  onClick={() => setLocation('/leave-calendar')}
                >
                  進入員工排班管理
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
            )}
          </div>

          {/* 本週排班預覽 */}
          <div className="mt-8">
            <WeeklyScheduleCard setLocation={setLocation} />
          </div>
        </div>
      </div>
    </div>
  );
}
