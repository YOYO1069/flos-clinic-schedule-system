import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";
import { 
  Clock, 
  Users, 
  FileText, 
  Monitor, 
  Calendar, 
  CheckSquare,
  LogOut,
  Fingerprint,
  Key,
  CalendarDays,
  Stethoscope,
  GraduationCap,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface DoctorSchedule {
  date: string;
  doctor_name: string;
  shift_start: string;
  shift_end: string;
}

export default function NewDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weekSchedules, setWeekSchedules] = useState<DoctorSchedule[]>([]);
  const { permissions } = usePermissions(user?.role as UserRole);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 載入本週醫師排班
  useEffect(() => {
    loadWeekSchedules();
  }, []);

  async function loadWeekSchedules() {
    try {
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate = format(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

      // 這裡需要使用醫師排班資料庫
      // 暫時使用空陣列，稍後會實作
      setWeekSchedules([]);
    } catch (error) {
      console.error('載入醫師排班失敗:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLocation('/login');
  };

  // 職能專區卡片
  const specialtyCards = [
    {
      id: 'student',
      title: '學生專區',
      description: '用於學生年度重工資',
      icon: GraduationCap,
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-50',
      onClick: () => setLocation('/student-portal'),
    },
    {
      id: 'nurse',
      title: '護理師守則',
      description: '護理師基本護理守則',
      icon: HeartPulse,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/nurse-sop'),
    },
    {
      id: 'beautician',
      title: '美容師守則',
      description: '美容師操作護理流程',
      icon: Sparkles,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => setLocation('/beautician-sop'),
    },
  ];

  // 常用功能 - 排班系統
  const scheduleFeatures = [
    {
      id: 'doctor-schedule',
      title: '醫師排班',
      description: '查看醫師排班表',
      icon: Stethoscope,
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      onClick: () => setLocation('/doctor-schedule'),
      show: true,
    },
    {
      id: 'leave-calendar',
      title: '休假日曆',
      description: '查看工作與休假',
      icon: CalendarDays,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/leave-calendar'),
      show: permissions.canAccessLeaveCalendar,
    },
  ];

  // 常用功能 - 員工管理
  const employeeFeatures = [
    {
      id: 'attendance',
      title: '我的打卡',
      description: '查看打卡記錄',
      icon: Clock,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      onClick: () => setLocation('/attendance'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'leave',
      title: '請假管理',
      description: '申請與查看請假',
      icon: FileText,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => setLocation('/leave'),
      show: permissions.canAccessLeaveManagement,
    },
    {
      id: 'attendance-management',
      title: '打卡記錄',
      description: '查看全部打卡記錄',
      icon: FileText,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => setLocation('/attendance-management'),
      show: ['admin', 'super_admin', 'senior_supervisor', 'supervisor'].includes(user?.role),
    },
    {
      id: 'approval',
      title: '請假審核',
      description: '審核員工請假申請',
      icon: CheckSquare,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/approval'),
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'dashboard',
      title: '電子看板',
      description: '即時顯示今日打卡',
      icon: Monitor,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/attendance-dashboard'),
      show: permissions.canAccessLeaveApproval,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 頂部導航 */}
      <div className="bg-white/80 backdrop-blur shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  FLOS 曜診所
                </h1>
                <p className="text-xs text-gray-500">
                  Employee Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-3 hidden md:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">flos{user?.employee_id}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setLocation('/attendance')}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Fingerprint className="w-4 h-4" />
                <span className="hidden sm:inline">快速打卡</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/change-password')}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">修改密碼</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">登出</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 歡迎區塊 */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  今天也要加油喔！
                </h2>
                <p className="text-purple-100 text-sm">
                  歡迎回來，{user?.name} • {user?.position || '美好時光'}
                </p>
              </div>
              <div className="text-right">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLocation('/doctor-schedule')}
                  className="gap-2 mb-2"
                >
                  <Calendar className="w-4 h-4" />
                  查詢每週醫師時間表
                </Button>
                <p className="text-sm text-purple-100">
                  {format(currentTime, 'HH:mm:ss', { locale: zhTW })}
                </p>
                <p className="text-xs text-purple-200">
                  {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本週醫師排班 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              本週醫師排班
            </h3>
            <Button
              variant="link"
              size="sm"
              onClick={() => setLocation('/doctor-schedule')}
              className="text-teal-600"
            >
              查看更多 →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {weekSchedules.length > 0 ? (
              weekSchedules.map((schedule, index) => (
                <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-teal-600">
                      {format(new Date(schedule.date), 'M/d (EEE)', { locale: zhTW })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-xs text-gray-600">{schedule.shift_start} - {schedule.shift_end}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>暫無本週排班資料</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setLocation('/doctor-schedule')}
                    className="mt-2"
                  >
                    前往查看完整排班
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 職能專區 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-800">職能專區</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              查看更多
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {specialtyCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.id}
                  className={`${card.bgColor} border-2 hover:shadow-lg transition-all cursor-pointer group`}
                  onClick={card.onClick}
                >
                  <CardHeader>
                    <div className="flex items-center justify-center mb-3">
                      <div className={`p-3 rounded-full bg-gradient-to-br ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-lg">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-center text-xs">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 常用功能 */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">常用功能</h3>
          
          {/* 排班系統 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              排班系統
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {scheduleFeatures.filter(f => f.show).map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className={`${feature.bgColor} border hover:shadow-md transition-all cursor-pointer group`}
                    onClick={feature.onClick}
                  >
                    <CardContent className="py-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-800">{feature.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 員工管理 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              員工管理
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {employeeFeatures.filter(f => f.show).map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className={`${feature.bgColor} border hover:shadow-md transition-all cursor-pointer group`}
                    onClick={feature.onClick}
                  >
                    <CardContent className="py-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-800">{feature.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* 頁尾 */}
        <div className="mt-8 text-center text-sm text-gray-500 py-4">
          <p>FLOS 曜診所 | 診所管理系統</p>
          <p className="mt-1">{format(new Date(), 'yyyy年MM月dd日', { locale: zhTW })}</p>
        </div>
      </div>
    </div>
  );
}
