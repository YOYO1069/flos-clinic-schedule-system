import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, ArrowRight, ArrowLeft, Fingerprint } from "lucide-react";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-teal-600" />
            <CardTitle>本週醫師排班</CardTitle>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
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
            <Button 
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={() => setLocation('/doctor-schedule')}
            >
              查看完整排班表
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(schedulesByDate).map(([date, schedules]) => (
              <div key={date} className="border-l-4 border-teal-400 pl-4 py-3 bg-gradient-to-r from-teal-50/50 to-transparent rounded-r-lg">
                <div className="font-semibold text-teal-900 mb-2">
                  {formatDate(date)}
                </div>
                <div className="space-y-1">
                  {schedules.map((schedule, idx) => (
                    <div key={idx} className="text-sm text-slate-600">
                      <span className="font-medium text-teal-700">{schedule.doctor_name}</span>
                      <span className="mx-2">•</span>
                      <span>{schedule.start_time} - {schedule.end_time}</span>
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

export default function Dashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-blue-50/20 to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 返回主網站按鈕 */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回主網站
          </Button>
        </div>
        
        {/* 標題 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            FLOS 曜診所排班系統
          </h1>
          <p className="text-slate-600">管理員儀表板</p>
          
          {/* 員工打卡按鈕 - 顯眼位置 */}
          <div className="flex justify-center pt-2">
            <Button 
              size="lg"
              onClick={() => setLocation('/attendance')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-2xl"
            >
              <Fingerprint className="h-6 w-6 mr-3" />
              員工打卡
            </Button>
          </div>
        </div>

        {/* 主要功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 醫師排班 */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-teal-100/50 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200/50 rounded-xl shadow-sm">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">醫師排班</CardTitle>
                  <CardDescription>管理醫師值班時間</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => setLocation('/doctor-schedule')}
              >
                進入醫師排班管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* 員工排班 - 只有主管以上可以看到 */}
          {permissions.canAccessLeaveCalendar && (
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-teal-100/50 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl shadow-sm">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">員工排班</CardTitle>
                  <CardDescription>管理員工請假與排班</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation('/leave-calendar')}
              >
                進入員工排班管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          )}
        </div>

        {/* 本週醫師排班 */}
        <WeeklyScheduleCard setLocation={setLocation} />
      </div>
    </div>
  );
}
