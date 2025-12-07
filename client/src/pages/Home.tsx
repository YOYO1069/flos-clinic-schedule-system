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
      color: 'from-orange-500 to-orange-600',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: ClipboardList,
      label: '打卡記錄',
      description: '查看全員工打卡記錄',
      color: 'from-green-500 to-green-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Calendar,
      label: '休假月曆',
      description: '查看員工假期與排班',
      color: 'from-blue-500 to-blue-600',
      path: '/leave-calendar',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: CheckSquare,
      label: '請假管理',
      description: '申請請假申請',
      color: 'from-purple-500 to-purple-600',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: Users,
      label: '員工管理',
      description: '新增、編輯、管理員工資料',
      color: 'from-blue-500 to-indigo-600',
      path: '/employee-management',
      show: permissions.canAccessEmployeeManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      description: '審核員工請假申請',
      color: 'from-purple-500 to-indigo-600',
      path: '/leave-approval',
      show: permissions.canAccessLeaveApproval
    },
    {
      icon: FileText,
      label: '打卡記錄管理',
      description: '管理全員工打卡記錄',
      color: 'from-teal-500 to-cyan-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement && user?.role === 'admin'
    },
    {
      icon: Monitor,
      label: '電子看板',
      description: '即時顯示員工考勤狀態',
      color: 'from-purple-500 to-pink-600',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Key,
      label: '帳號密碼管理',
      description: '管理帳號與重置密碼',
      color: 'from-red-500 to-rose-600',
      path: '/admin',
      show: permissions.canAccessAccountManagement
    },
    {
      icon: Shield,
      label: '權限分配',
      description: '管理員工權限等級',
      color: 'from-purple-500 to-purple-600',
      path: '/permission-management',
      show: permissions.canAccessPermissionManagement
    },
    {
      icon: Settings,
      label: '打卡設定',
      description: '管理打卡系統設定',
      color: 'from-gray-500 to-gray-600',
      path: '/attendance-settings',
      show: permissions.canAccessAttendanceSettings
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* 頭部 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                歡迎回來,{user?.name || '黃柏翰'}!
              </h1>
              <p className="text-gray-500 mt-1">
                {user?.position || '請選擇您要的功能'}
              </p>
            </div>
            <div className="flex gap-3">
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
        </div>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {/* 圖標容器 */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                
                {/* 文字 */}
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.description}
                </p>
                
                {/* 進入功能按鈕 */}
                <div className={`mt-4 py-2 px-4 rounded-lg bg-gradient-to-r ${item.color} text-white font-medium text-sm shadow-md group-hover:shadow-lg transition-all duration-300`}>
                  進入功能
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
