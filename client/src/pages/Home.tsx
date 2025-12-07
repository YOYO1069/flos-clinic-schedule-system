import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernPageLayout, ModernCard, ModernButton } from "@/components/ModernPageLayout";
import { APP_TITLE } from "@/const";
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
  DollarSign, 
  Settings,
  CheckSquare,
  LogOut,
  UserCog,
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
    } catch (error) {
      console.error('修改密碼失敗:', error);
      toast.error('修改密碼失敗，請稍後再試');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 功能卡片資料
  const featureCards = [
    {
      id: 'my-attendance',
      title: '我的打卡',
      description: '查看個人打卡記錄',
      icon: Clock,
      variant: 'success' as const,
      onClick: () => setLocation('/attendance'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'attendance-history',
      title: '打卡記錄',
      description: '查詢歷史打卡明細',
      icon: FileText,
      variant: 'secondary' as const,
      onClick: () => setLocation('/attendance-history'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'leave-calendar',
      title: '休假月曆',
      description: '查看員工休假狀況',
      icon: Calendar,
      variant: 'primary' as const,
      onClick: () => setLocation('/leave-calendar'),
      show: permissions.canAccessLeaveCalendar,
    },
    {
      id: 'leave-request',
      title: '請假管理',
      description: '提交請假申請',
      icon: CheckSquare,
      variant: 'primary' as const,
      onClick: () => setLocation('/leave'),
      show: permissions.canAccessLeaveManagement,
    },
    {
      id: 'operation-fee',
      title: '操作費計算',
      description: '計算個人操作費用',
      icon: DollarSign,
      variant: 'danger' as const,
      onClick: () => setLocation('/operation-fee'),
      show: user?.position === '美容師' || user?.position === '護理師',
    },
    {
      id: 'employee-management',
      title: '員工管理',
      description: '新增、編輯、管理員工資料',
      icon: Users,
      variant: 'secondary' as const,
      onClick: () => setLocation('/employee-management'),
      show: permissions.canManageStaffSchedule,
    },
    {
      id: 'leave-approval',
      title: '請假審核',
      description: '審核員工請假申請',
      icon: CheckSquare,
      variant: 'primary' as const,
      onClick: () => setLocation('/approval'),
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'attendance-management',
      title: '打卡記錄管理',
      description: '管理全體員工打卡記錄',
      icon: FileText,
      variant: 'secondary' as const,
      onClick: () => {
        if (user?.role === 'admin') {
          setLocation('/attendance-management');
        } else {
          setLocation('/simple-attendance');
        }
      },
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'dashboard',
      title: '電子看板',
      description: '即時顯示今日打卡狀況',
      icon: Monitor,
      variant: 'primary' as const,
      onClick: () => setLocation('/attendance-dashboard'),
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'account-management',
      title: '帳號密碼管理',
      description: '查看所有員工帳號密碼',
      icon: Key,
      variant: 'danger' as const,
      onClick: () => setLocation('/account-management'),
      show: user?.role === 'admin',
    },
    {
      id: 'permission-management',
      title: '權限分配',
      description: '管理員工權限等級',
      icon: Shield,
      variant: 'primary' as const,
      onClick: () => setLocation('/permission-management'),
      show: user?.role === 'admin',
    },
    {
      id: 'attendance-settings',
      title: '打卡設定',
      description: '管理打卡系統設定',
      icon: Settings,
      variant: 'secondary' as const,
      onClick: () => setLocation('/attendance-settings'),
      show: user?.role === 'admin' || user?.role === 'super_admin',
    },
  ];

  const visibleCards = featureCards.filter(card => card.show);

  return (
    <ModernPageLayout
      title={`歡迎回來,${user?.name || ''}!`}
      subtitle={`${user?.position || '員工'} • 請選擇您需要的功能`}
      showBackButton={false}
      headerActions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordDialog(true)}
            className="bg-white/90 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
          >
            <Key className="w-4 h-4 mr-2" />
            修改密碼
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white/90 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </Button>
        </div>
      }
    >
      {/* 功能卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <ModernCard key={card.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium mt-1">
                      {card.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ModernButton
                  variant={card.variant}
                  size="lg"
                  onClick={card.onClick}
                  className="w-full"
                >
                  進入功能
                </ModernButton>
              </CardContent>
            </ModernCard>
          );
        })}
      </div>

      {/* 使用說明 */}
      <div className="mt-8">
        <ModernCard hover={false}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                使用說明
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <strong className="text-slate-800">我的打卡:</strong>
                <span className="text-slate-600 ml-2">點擊「電子看板」即時查看今日打卡狀況,或在「打卡記錄」查看歷史明細</span>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <strong className="text-slate-800">休假管理:</strong>
                <span className="text-slate-600 ml-2">在「休假月曆」查看所有員工休假狀況,在「請假管理」提交請假申請</span>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <strong className="text-slate-800">操作費計算:</strong>
                <span className="text-slate-600 ml-2">護理師和美容師可使用此功能計算個人操作費用</span>
              </div>
            </div>
            {(user?.role === 'supervisor' || user?.role === 'senior_supervisor' || user?.role === 'admin' || user?.role === 'super_admin') && (
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  4
                </div>
                <div className="flex-1">
                  <strong className="text-slate-800">主管功能:</strong>
                  <span className="text-slate-600 ml-2">您可以管理員工資料、審核請假申請,並查看電子看板</span>
                </div>
              </div>
            )}
          </CardContent>
        </ModernCard>
      </div>

      {/* 頁尾 */}
      <div className="mt-8 text-center">
        <div className="inline-block bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl">
          <p className="text-slate-700 font-semibold">FLOS 曜診所 | 診所管理系統</p>
          <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('zh-TW')}</p>
        </div>
      </div>

      {/* 修改密碼對話框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              修改密碼
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              請輸入當前密碼和新密碼
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-700 font-semibold">當前密碼</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="請輸入當前密碼"
                className="border-2 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700 font-semibold">新密碼</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="請輸入新密碼 (至少6個字元)"
                className="border-2 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">確認新密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="請再次輸入新密碼"
                className="border-2 focus:border-purple-500"
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
              disabled={isChangingPassword}
              className="border-2"
            >
              取消
            </Button>
            <ModernButton
              variant="primary"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? '處理中...' : '確認修改'}
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModernPageLayout>
  );
}
