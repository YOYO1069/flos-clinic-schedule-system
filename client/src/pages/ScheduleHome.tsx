import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ModernPageLayout, ModernCard, ModernButton } from "@/components/ModernPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, ArrowRight, Fingerprint, Monitor } from "lucide-react";
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
    <ModernCard hover={false}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                本週醫師排班
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium text-base">
                快速查看本週排班狀況
              </CardDescription>
            </div>
          </div>
          <ModernButton 
            variant="secondary"
            size="md"
            onClick={() => setLocation('/doctor-schedule')}
          >
            查看完整排班
            <ArrowRight className="ml-2 h-4 w-4" />
          </ModernButton>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 font-medium">載入中...</p>
          </div>
        ) : Object.keys(schedulesByDate).length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">📅</div>
            <p className="text-slate-600 text-lg font-medium">本週無排班資料</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(schedulesByDate).map(([date, schedules]) => (
              <div 
                key={date} 
                className="p-5 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl border-2 border-teal-100/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="font-bold text-teal-900 mb-3 text-lg flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                  {formatDate(date)}
                </div>
                <div className="space-y-2.5">
                  {schedules.map((schedule, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-white/80 rounded-lg hover:bg-white transition-colors"
                    >
                      <div className="w-2.5 h-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full shadow-sm"></div>
                      <span className="font-semibold text-slate-800">{schedule.doctor_name}</span>
                      <span className="text-slate-500 font-medium ml-auto">
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
    </ModernCard>
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
    <ModernPageLayout
      title="FLOS 曜診所"
      subtitle="排班管理系統"
      showBackButton={true}
      onBack={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
    >
      {/* 主要操作按鈕區域 */}
      <div className="flex flex-wrap justify-center gap-6 py-4">
        <ModernButton 
          variant="success"
          size="lg"
          onClick={() => setLocation('/attendance')}
          className="min-w-[200px]"
        >
          <Fingerprint className="h-7 w-7 mr-3" />
          員工打卡
        </ModernButton>
        
        {permissions.canAccessAttendanceDashboard && (
          <ModernButton 
            variant="primary"
            size="lg"
            onClick={() => setLocation('/attendance-dashboard')}
            className="min-w-[200px]"
          >
            <Monitor className="h-7 w-7 mr-3" />
            電子看板
          </ModernButton>
        )}
      </div>

      {/* 功能卡片區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* 醫師排班卡片 */}
        <ModernCard>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl group-hover:shadow-teal-500/50 group-hover:scale-110 transition-all duration-300">
                <Calendar className="h-9 w-9 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  醫師排班
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium text-base mt-1">
                  管理醫師值班時間
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ModernButton 
              variant="secondary"
              size="lg"
              onClick={() => setLocation('/doctor-schedule')}
              className="w-full"
            >
              進入醫師排班管理
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </ModernButton>
          </CardContent>
        </ModernCard>

        {/* 員工排班卡片 */}
        {permissions.canAccessLeaveCalendar && (
          <ModernCard>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-9 w-9 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    員工排班
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium text-base mt-1">
                    管理員工請假與排班
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ModernButton 
                variant="primary"
                size="lg"
                onClick={() => setLocation('/leave-calendar')}
                className="w-full"
              >
                進入員工排班管理
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </ModernButton>
            </CardContent>
          </ModernCard>
        )}
      </div>

      {/* 本週排班預覽 */}
      <div className="mt-8">
        <WeeklyScheduleCard setLocation={setLocation} />
      </div>
    </ModernPageLayout>
  );
}
