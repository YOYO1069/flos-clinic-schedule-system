import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole, ROLE_LABELS } from "@/lib/permissions";
import { supabase, doctorScheduleClient } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Clock, 
  Users, 
  FileText, 
  Monitor, 
  Calendar, 
  Settings,
  CheckSquare,
  LogOut,
  Key,
  Shield,
  ClipboardList,
  CalendarDays,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Award,
  MessageSquare,
  BookOpen,
  Gift,
  Heart,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('使用者資料:', userData);
      console.log('使用者角色:', userData.role);
      setUser(userData);
    }
    loadWeeklySchedules();
  }, []);

  // 載入本週醫師排班
  const loadWeeklySchedules = async () => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 6);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log('查詢排班日期範圍:', startDateStr, '到', endDateStr);

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
        console.log('載入排班成功:', data?.length, '筆資料');
        setWeeklySchedules(data || []);
      }
    } catch (err) {
      console.error('載入排班錯誤:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // 按日期分組排班
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
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLocation('/login');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('請填寫所有欄位');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密碼與確認密碼不一致');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('密碼長度至少需要 6 個字元');
      return;
    }

    setIsChangingPassword(true);
    try {
      const crypto = await import('crypto');
      const hashPassword = (password: string) => {
        return crypto.createHash('sha256').update(password).digest('hex');
      };

      const currentPasswordHash = hashPassword(passwordForm.currentPassword);
      const newPasswordHash = hashPassword(passwordForm.newPassword);

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('employee_id', user.employee_id)
        .single();

      if (fetchError) throw fetchError;

      if (userData.password !== currentPasswordHash) {
        toast.error('當前密碼錯誤');
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPasswordHash })
        .eq('employee_id', user.employee_id);

      if (updateError) throw updateError;

      toast.success('密碼修改成功!請使用新密碼重新登入');
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (error: any) {
      console.error('修改密碼失敗:', error);
      toast.error('修改密碼失敗,請稍後再試');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 時尚配色功能選單（現有功能）
  const menuItems = useMemo(() => [
    {
      icon: Clock,
      label: '我的打卡',
      description: '查看打卡記錄',
      bgColor: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500',
      path: '/attendance',
      show: permissions.canAccessAttendance,
      isNew: false
    },
    {
      icon: FileText,
      label: '請假管理',
      description: '申請請假申請',
      bgColor: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement,
      isNew: false
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      description: '審核員工請假申請',
      bgColor: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval,
      isNew: false
    },
    {
      icon: Calendar,
      label: '休假月曆',
      description: '員工休假表',
      bgColor: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-500',
      path: '/leave-calendar',
      show: permissions.canAccessLeaveCalendar,
      isNew: false
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      description: '查看全員工打卡記錄',
      bgColor: 'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement,
      isNew: false
    },
    {
      icon: Users,
      label: '員工管理',
      description: '管理員工資料',
      bgColor: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement,
      isNew: false
    },
    {
      icon: Monitor,
      label: '電子看板',
      description: '即時顯示員工考勤狀態',
      bgColor: 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard,
      isNew: false
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      description: '管理使用者帳號',
      bgColor: 'bg-gradient-to-br from-indigo-400 via-blue-600 to-violet-600',
      path: '/admin',
      show: permissions.canAccessAccountManagement,
      isNew: false
    },
    {
      icon: Shield,
      label: '權限分配',
      description: '設定使用者權限',
      bgColor: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement,
      isNew: false
    },
    {
      icon: Settings,
      label: '打卡設定',
      description: '設定打卡規則',
      bgColor: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-500',
      path: '/attendance-settings',
      show: permissions.canAccessAttendanceSettings,
      isNew: false
    }
  ].filter(item => item.show), [permissions]);

  // 新增功能卡片（未實裝，顯示「功能開發中」）
  const upcomingFeatures = [
    {
      icon: DollarSign,
      label: '薪資查詢',
      description: '查看薪資明細與歷史記錄',
      bgColor: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
      comingSoon: true
    },
    {
      icon: TrendingUp,
      label: '績效考核',
      description: '查看個人績效與目標達成',
      bgColor: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-sky-600',
      comingSoon: true
    },
    {
      icon: Award,
      label: '獎懲記錄',
      description: '查看獎勵與懲處記錄',
      bgColor: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
      comingSoon: true
    },
    {
      icon: MessageSquare,
      label: '內部公告',
      description: '查看公司最新消息與公告',
      bgColor: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600',
      comingSoon: true
    },
    {
      icon: BookOpen,
      label: '教育訓練',
      description: '線上課程與訓練記錄',
      bgColor: 'bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600',
      comingSoon: true
    },
    {
      icon: Gift,
      label: '福利專區',
      description: '員工福利與優惠資訊',
      bgColor: 'bg-gradient-to-br from-rose-400 via-pink-500 to-red-500',
      comingSoon: true
    },
    {
      icon: Heart,
      label: '健康管理',
      description: '健康檢查與體檢記錄',
      bgColor: 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-500',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 頭部 */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              FLOS 曜診所
            </h1>
            <Sparkles className="h-8 w-8 text-pink-500" />
          </div>
          <p className="text-lg text-slate-700 mb-1 font-medium">
            歡迎回來，{user?.name || '貴賓殿嬈'}
          </p>
          {user?.role && (
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
              {ROLE_LABELS[user?.role as UserRole] || '員工'}
            </Badge>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="text-sm text-slate-600 hover:text-purple-600 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Key className="h-4 w-4" />
              修改密碼
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-rose-600 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>

        {/* 功能選單區域 */}
        <div className="space-y-8">
          {/* 本週醫師排班 - 大卡片 */}
          {permissions.canAccessDoctorSchedule && (
            <button
              onClick={() => setLocation('/doctor-schedule')}
              className="w-full bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl p-8 shadow-2xl hover:shadow-3xl 
                transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]
                border-2 border-white/20 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm
                    flex items-center justify-center shadow-lg">
                    <CalendarDays className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">本週醫師排班</h3>
                    <p className="text-sm text-white/80">查看本週排班表</p>
                  </div>
                </div>
                <ChevronRight className="h-8 w-8 text-white/80" />
              </div>
              
              {loadingSchedules ? (
                <p className="text-sm text-white/80">載入中...</p>
              ) : Object.keys(schedulesByDate).length === 0 ? (
                <p className="text-sm text-white/80">本週暫無排班</p>
              ) : (
                <div className="text-left space-y-3">
                  {Object.entries(schedulesByDate).slice(0, 3).map(([date, schedules]) => (
                    <div key={date} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <span className="font-semibold text-white text-base">
                        {formatDate(date)} (週{getDayOfWeek(date)})
                      </span>
                      <div className="text-white/90 mt-2 flex flex-wrap gap-2">
                        {schedules.slice(0, 3).map((s, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-white/30">
                            {s.doctor_name}
                          </Badge>
                        ))}
                        {schedules.length > 3 && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            +{schedules.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </button>
          )}

          {/* 現有功能卡片 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              常用功能
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setLocation(item.path)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl
                      transition-all duration-300 hover:-translate-y-2 hover:scale-105
                      border border-slate-100 flex flex-col items-center justify-center gap-4 min-h-[180px]
                      group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className={`w-16 h-16 rounded-2xl ${item.bgColor} 
                      flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-center relative z-10">
                      <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 即將推出功能 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
              即將推出
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcomingFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => toast.info('功能開發中，敬請期待！', {
                      description: `${item.label} 功能即將上線`,
                      duration: 3000
                    })}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl
                      border border-slate-100 flex flex-col items-center justify-center gap-4 min-h-[180px]
                      relative overflow-hidden opacity-75 hover:opacity-90 cursor-pointer
                      transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 text-xs">
                        開發中
                      </Badge>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl ${item.bgColor} 
                      flex items-center justify-center shadow-lg opacity-60`}>
                      <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold text-slate-600 mb-1">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部標註 */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" />
            FLOS 曜診所排班系統
            <Sparkles className="h-4 w-4 text-purple-400" />
          </p>
        </div>
      </div>

      {/* 修改密碼對話框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              修改密碼
            </DialogTitle>
            <DialogDescription>
              請輸入當前密碼和新密碼
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">當前密碼</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-password">新密碼</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">確認新密碼</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={isChangingPassword}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isChangingPassword ? '修改中...' : '確認修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
