import { useState, useEffect } from "react";
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
  Shield
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
      toast.error('修改密碼失敗，請稍後再試');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const menuItems = [
    {
      icon: Clock,
      label: '我的打卡',
      description: '查看打卡記錄',
      color: 'from-teal-500 to-cyan-600',
      path: '/attendance',
      show: permissions.canAccessAttendance
    },
    {
      icon: FileText,
      label: '請假管理',
      description: '申請與查詢',
      color: 'from-blue-500 to-indigo-600',
      path: '/leave-management',
      show: permissions.canAccessLeaveManagement
    },
    {
      icon: CheckSquare,
      label: '請假審核',
      description: '審核請假申請',
      color: 'from-emerald-500 to-teal-600',
      path: '/leave-approval',
      show: permissions.canApproveLeave
    },
    {
      icon: Users,
      label: '打卡管理',
      description: '管理員工打卡',
      color: 'from-violet-500 to-purple-600',
      path: '/attendance-management',
      show: permissions.canAccessAttendanceManagement
    },
    {
      icon: Monitor,
      label: '電子看板',
      description: '即時顯示',
      color: 'from-amber-500 to-orange-600',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Calendar,
      label: '排班月曆',
      description: '員工排班',
      color: 'from-rose-500 to-pink-600',
      path: '/leave-calendar',
      show: permissions.canAccessLeaveCalendar
    },

    {
      icon: Shield,
      label: '管理者面板',
      description: '系統管理',
      color: 'from-indigo-500 to-blue-600',
      path: '/admin',
      show: permissions.canAccessAdminPanel
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* 頭部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            員工功能選單
          </h1>
          {user && (
            <div className="mt-3">
              <p className="text-slate-600 font-medium">
                歡迎回來，<span className="font-bold text-slate-800">{user.name}</span>
              </p>
              <p className="text-sm text-slate-500">{user.position || '員工'}</p>
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <Key className="w-4 h-4" />
              修改密碼
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </div>

        {/* 圖文選單 - 響應式網格 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLastRow = index >= menuItems.length - (menuItems.length % 4 || 4);
              const isLastInRow = (index + 1) % 4 === 0;
              const isLastInMdRow = (index + 1) % 3 === 0;
              const isLastInSmRow = (index + 1) % 2 === 0;
              
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className={`
                    group relative aspect-square p-6 
                    flex flex-col items-center justify-center gap-3
                    border-r border-b border-slate-200
                    hover:bg-slate-50 transition-all duration-300
                    ${isLastInRow ? 'lg:border-r-0' : ''}
                    ${isLastInMdRow ? 'md:border-r-0 lg:border-r' : ''}
                    ${isLastInSmRow ? 'border-r-0 md:border-r' : ''}
                    ${isLastRow ? 'border-b-0' : ''}
                  `}
                >
                  {/* 圖標容器 */}
                  <div className={`
                    w-16 h-16 rounded-2xl 
                    bg-gradient-to-br ${item.color}
                    flex items-center justify-center
                    transform group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                    shadow-lg group-hover:shadow-xl
                  `}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* 文字標籤 */}
                  <div className="text-center">
                    <div className="text-slate-700 font-bold text-base group-hover:text-slate-900 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>

                  {/* 懸停效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 text-center text-xs text-slate-400">
          FLOS 曜診所排班管理系統
        </div>
      </div>

      {/* 修改密碼對話框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密碼</DialogTitle>
            <DialogDescription>
              請輸入當前密碼和新密碼。密碼長度至少需要 6 個字元。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">當前密碼</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密碼</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
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
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? '修改中...' : '確認修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
