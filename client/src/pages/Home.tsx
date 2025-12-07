import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  ChevronRight
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

  // 彩色圓角方塊風格功能選單
  const menuItems = [
    {
      icon: Clock,
      label: '我的打卡',
      description: '查看打卡記錄',
      bgColor: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: FileText,
      label: '請假管理',
      description: '申請請假申請',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-500',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      description: '審核員工請假申請',
      bgColor: 'bg-gradient-to-br from-green-400 to-green-500',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval
    },
    {
      icon: Calendar,
      label: '排班月曆',
      description: '員工排班表',
      bgColor: 'bg-gradient-to-br from-pink-400 to-pink-500',
      path: '/schedule-overview',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      description: '查看全員工打卡記錄',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-500',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Users,
      label: '員工管理',
      description: '管理員工資料',
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement
    },
    {
      icon: Monitor,
      label: '電子看板',
      description: '即時顯示員工考勤狀態',
      bgColor: 'bg-gradient-to-br from-rose-400 to-rose-500',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      description: '管理使用者帳號',
      bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
      path: '/admin',
      show: permissions.canAccessAccountManagement
    },
    {
      icon: Shield,
      label: '權限分配',
      description: '設定使用者權限',
      bgColor: 'bg-gradient-to-br from-violet-400 to-violet-500',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement
    },
    {
      icon: Settings,
      label: '打卡設定',
      description: '設定打卡規則',
      bgColor: 'bg-gradient-to-br from-slate-400 to-slate-500',
      path: '/attendance-settings',
      show: permissions.canAccessAttendanceSettings
    }
  ].filter(item => item.show);

  // 記錄過濾後的功能數量
  console.log('使用者權限:', permissions);
  console.log('可見功能數量:', menuItems.length);
  console.log('可見功能:', menuItems.map(item => item.label));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 頭部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            員工功能選單
          </h1>
          <p className="text-base text-slate-600 mb-1">
            歡迎回來,{user?.name || '貴賓殿嬈'}
          </p>
          {user?.role === 'admin' && (
            <p className="text-sm text-slate-500 mb-4">
              {ROLE_LABELS[user?.role as UserRole] || '員工'}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <Key className="h-4 w-4" />
              修改密碼
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>

        {/* 彩色圓角方塊功能選單 - 不規則網格 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {/* 本週醫師排班 - 大卡片 (所有人都可以看) */}
          {permissions.canAccessDoctorSchedule && (
            <button
              onClick={() => setLocation('/doctor-schedule')}
              className="col-span-2 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl 
                transition-all duration-300 hover:-translate-y-1
                border border-slate-100 flex flex-col gap-4 min-h-[180px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 
                    flex items-center justify-center shadow-md">
                    <CalendarDays className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-800">本週醫師排班</h3>
                    <p className="text-xs text-slate-500">查看本週排班表</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-400" />
              </div>
              
              {loadingSchedules ? (
                <p className="text-sm text-slate-500">載入中...</p>
              ) : Object.keys(schedulesByDate).length === 0 ? (
                <p className="text-sm text-slate-500">本週暫無排班</p>
              ) : (
                <div className="text-left space-y-2 overflow-hidden">
                  {Object.entries(schedulesByDate).slice(0, 2).map(([date, schedules]) => (
                    <div key={date} className="text-sm bg-slate-50 rounded-lg p-2">
                      <span className="font-semibold text-slate-700">
                        {formatDate(date)} (週{getDayOfWeek(date)})
                      </span>
                      <div className="text-slate-600 mt-1">
                        {schedules.slice(0, 2).map((s, idx) => (
                          <span key={idx}>
                            {s.doctor_name}
                            {idx < Math.min(schedules.length, 2) - 1 && ', '}
                          </span>
                        ))}
                        {schedules.length > 2 && '...'}
                      </div>
                    </div>
                  ))}
                  {Object.keys(schedulesByDate).length > 2 && (
                    <p className="text-xs text-slate-500 text-center">
                      ...還有 {Object.keys(schedulesByDate).length - 2} 天
                    </p>
                  )}
                </div>
              )}
            </button>
          )}

          {/* 其他功能卡片 - 彩色圓角方塊 */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:-translate-y-1
                  border border-slate-100 flex flex-col items-center justify-center gap-4 min-h-[180px]"
              >
                <div className={`w-16 h-16 rounded-2xl ${item.bgColor} 
                  flex items-center justify-center shadow-md`}>
                  <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-800 mb-1">
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

        {/* 底部標註 */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">
            FLOS 曜診所排班系統
          </p>
        </div>
      </div>

      {/* 修改密碼對話框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密碼</DialogTitle>
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
              />
            </div>
            <div>
              <Label htmlFor="new-password">新密碼</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">確認新密碼</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              取消
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? '修改中...' : '確認修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
