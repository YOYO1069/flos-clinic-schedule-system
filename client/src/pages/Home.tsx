import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
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
      setUser(JSON.parse(userStr));
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

  // LINE 風格功能選單
  const menuItems = [
    {
      icon: Clock,
      label: '我的打卡',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Calendar,
      label: '休假月曆',
      path: '/schedule-overview',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: CheckSquare,
      label: '請假管理',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: Users,
      label: '員工管理',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval
    },
    {
      icon: FileText,
      label: '打卡記錄管理',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement && user?.role === 'admin'
    },
    {
      icon: Monitor,
      label: '電子看板',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      path: '/admin',
      show: permissions.canAccessAccountManagement
    },
    {
      icon: Shield,
      label: '權限分配',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement
    },
    {
      icon: Settings,
      label: '打卡設定',
      path: '/attendance-settings',
      show: permissions.canAccessAttendanceSettings
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 頭部 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            歡迎回來,{user?.name || '使用者'}!
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            {user?.position || '請選擇您需要的功能'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              className="text-xs"
            >
              <Key className="h-3 w-3 mr-1" />
              修改密碼
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              登出
            </Button>
          </div>
        </div>

        {/* LINE 風格功能選單 - 不規則網格 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          {/* 本週醫師排班 - 大卡片 (手機橫跨2列,桌面橫跨2列) */}
          <button
            onClick={() => setLocation('/doctor-schedule')}
            className="col-span-2 bg-white border-2 border-gray-800 rounded-xl p-4 
              shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
              flex flex-col gap-3 min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-gray-800" strokeWidth={1.5} />
                <h3 className="text-base font-bold text-gray-800">本週醫師排班</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </div>
            
            {loadingSchedules ? (
              <p className="text-sm text-gray-500">載入中...</p>
            ) : Object.keys(schedulesByDate).length === 0 ? (
              <p className="text-sm text-gray-500">本週暫無排班</p>
            ) : (
              <div className="text-left space-y-1.5 overflow-hidden">
                {Object.entries(schedulesByDate).slice(0, 2).map(([date, schedules]) => (
                  <div key={date} className="text-sm">
                    <span className="font-semibold text-gray-700">
                      {formatDate(date)} (週{getDayOfWeek(date)})
                    </span>
                    <span className="text-gray-600 ml-2">
                      {schedules.slice(0, 2).map(s => s.doctor_name).join(', ')}
                      {schedules.length > 2 && '...'}
                    </span>
                  </div>
                ))}
                {Object.keys(schedulesByDate).length > 2 && (
                  <p className="text-xs text-gray-500">...還有 {Object.keys(schedulesByDate).length - 2} 天</p>
                )}
              </div>
            )}
          </button>

          {/* 其他功能卡片 - 小卡片 */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className="bg-white border-2 border-gray-800 rounded-xl p-4
                  shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
                  flex flex-col items-center justify-center gap-3 min-h-[140px]"
              >
                <Icon className="h-8 w-8 text-gray-800" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-gray-800 text-center">
                  {item.label}
                </h3>
              </button>
            );
          })}
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
