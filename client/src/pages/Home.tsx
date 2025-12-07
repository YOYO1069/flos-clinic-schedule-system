import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";
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

// 醫師 ID 對應表
const DOCTOR_NAMES: Record<number, string> = {
  1: '黃柏翰',
  2: '陳昱廷',
  3: '劉哲軒',
};

// 時段對應表
const SHIFT_LABELS: Record<string, string> = {
  'morning': '早班',
  'afternoon': '午班',
  'evening': '晚班',
  'night': '夜班',
};

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

      const { data, error } = await supabase
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

  // 日系風格功能選單 - 小卡片設計
  const menuItems = [
    {
      icon: Clock,
      label: '我的打卡',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Calendar,
      label: '休假月曆',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/schedule-overview',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: CheckSquare,
      label: '請假管理',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: Users,
      label: '員工管理',
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval
    },
    {
      icon: FileText,
      label: '打卡記錄管理',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement && user?.role === 'admin'
    },
    {
      icon: Monitor,
      label: '電子看板',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      path: '/admin',
      show: permissions.canAccessAccountManagement
    },
    {
      icon: Shield,
      label: '權限分配',
      bgColor: 'bg-violet-100',
      iconColor: 'text-violet-600',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement
    },
    {
      icon: Settings,
      label: '打卡設定',
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
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

        {/* 本週醫師排班卡片 */}
        <Card className="mb-6 shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg">本週醫師排班</CardTitle>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                className="text-xs text-teal-600 hover:text-teal-700"
                onClick={() => setLocation('/doctor-schedule')}
              >
                查看完整排班
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSchedules ? (
              <p className="text-sm text-slate-500 text-center py-4">載入中...</p>
            ) : Object.keys(schedulesByDate).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">本週暫無排班</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(schedulesByDate).map(([date, schedules]) => (
                  <div key={date} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-sm font-semibold text-slate-700">
                        {formatDate(date)}
                      </div>
                      <div className="text-xs text-slate-500">
                        週{getDayOfWeek(date)}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {schedules.map((schedule, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          <span className="font-medium">{DOCTOR_NAMES[schedule.doctor_id] || '未知醫師'}</span>
                          <span className="text-slate-500 mx-1">·</span>
                          <span className="text-slate-600">{SHIFT_LABELS[schedule.shift] || schedule.shift}</span>
                          <span className="text-slate-400 text-xs ml-1">
                            ({schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)})
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

        {/* 功能選單 - 日系小卡片網格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className={`
                  ${item.bgColor} rounded-2xl p-4
                  shadow-sm hover:shadow-md
                  transition-all duration-200 hover:-translate-y-1
                  border border-white/50
                  flex flex-col items-center justify-center gap-3
                  min-h-[140px]
                `}
              >
                {/* 圖標 */}
                <div className={`
                  w-14 h-14 rounded-full bg-white
                  flex items-center justify-center
                  shadow-sm
                `}>
                  <Icon className={`w-7 h-7 ${item.iconColor}`} strokeWidth={2} />
                </div>
                
                {/* 文字 */}
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </h3>
                </div>
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
