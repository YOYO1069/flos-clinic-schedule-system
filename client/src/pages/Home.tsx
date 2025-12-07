import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  ClipboardList
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
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

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

      toast.success('密碼修改成功！請使用新密碼重新登入');
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

  // 根據管理員介面圖片配置的功能選單
  const menuItems = [
    {
      icon: Clock,
      label: '我的打卡',
      description: '查看個人打卡記錄',
      bgColor: 'bg-orange-50',
      iconColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      buttonColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      description: '查看全員工打卡記錄',
      bgColor: 'bg-green-50',
      iconColor: 'bg-gradient-to-br from-green-500 to-green-600',
      buttonColor: 'bg-gradient-to-r from-green-500 to-green-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Calendar,
      label: '休假月曆',
      description: '查看員工假期與排班',
      bgColor: 'bg-blue-50',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      buttonColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      path: '/schedule-overview',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: CheckSquare,
      label: '請假管理',
      description: '申請請假申請',
      bgColor: 'bg-purple-50',
      iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: Users,
      label: '員工管理',
      description: '新增、編輯、管理員工資料',
      bgColor: 'bg-blue-50',
      iconColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      buttonColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      description: '審核員工請假申請',
      bgColor: 'bg-purple-50',
      iconColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval
    },
    {
      icon: FileText,
      label: '打卡記錄管理',
      description: '管理全員工打卡記錄',
      bgColor: 'bg-teal-50',
      iconColor: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      buttonColor: 'bg-gradient-to-r from-teal-500 to-cyan-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement && user?.role === 'admin'
    },
    {
      icon: Monitor,
      label: '電子看板',
      description: '即時顯示員工考勤狀態',
      bgColor: 'bg-purple-50',
      iconColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      description: '管理帳號與重置密碼',
      bgColor: 'bg-red-50',
      iconColor: 'bg-gradient-to-br from-red-500 to-rose-600',
      buttonColor: 'bg-gradient-to-r from-red-500 to-rose-600',
      path: '/admin',
      show: permissions.canAccessAccountManagement
    },
    {
      icon: Shield,
      label: '權限分配',
      description: '管理員工權限等級',
      bgColor: 'bg-purple-50',
      iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement
    },
    {
      icon: Settings,
      label: '打卡設定',
      description: '管理打卡系統設定',
      bgColor: 'bg-gray-50',
      iconColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
      buttonColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
      path: '/attendance-settings',
      show: permissions.canAccessAttendanceSettings
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* 頭部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            歡迎回來，{user?.name || '黃柏翰'}！
          </h1>
          <p className="text-slate-600 font-medium mb-6">
            {user?.position || '請選擇您需要的功能'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              修改密碼
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              登出
            </Button>
          </div>
        </div>

        {/* 功能卡片網格 - 宮格點選模式 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className={`
                  group relative ${item.bgColor} rounded-3xl p-8 
                  shadow-lg hover:shadow-2xl 
                  transition-all duration-300 hover:-translate-y-2
                  border-2 border-white/50
                `}
              >
                {/* 圖標容器 */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className={`
                    w-24 h-24 rounded-full ${item.iconColor}
                    flex items-center justify-center
                    shadow-xl
                    transform group-hover:scale-110 group-hover:rotate-6
                    transition-all duration-300
                  `}>
                    <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* 文字 */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* 進入功能按鈕 */}
                <div className={`
                  w-full py-3 px-6 rounded-xl 
                  ${item.buttonColor}
                  text-white font-bold text-base
                  shadow-lg group-hover:shadow-xl
                  transform group-hover:scale-105
                  transition-all duration-300
                `}>
                  進入功能
                </div>

                {/* 懸停光暈效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl pointer-events-none transition-opacity duration-300"></div>
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
