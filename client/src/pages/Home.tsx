import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      // 使用 crypto 加密密碼
      const crypto = await import('crypto');
      const hashPassword = (password: string) => {
        return crypto.createHash('sha256').update(password).digest('hex');
      };

      const currentPasswordHash = hashPassword(passwordForm.currentPassword);
      const newPasswordHash = hashPassword(passwordForm.newPassword);

      // 驗證當前密碼
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

      // 更新密碼
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPasswordHash })
        .eq('employee_id', user.employee_id);

      if (updateError) throw updateError;

      toast.success('密碼修改成功！請使用新密碼重新登入');
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // 登出並跳轉到登入頁
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
    // 所有員工都可以使用的功能
    {
      id: 'my-attendance',
      title: '我的打卡',
      description: '查看個人打卡記錄',
      icon: Clock,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => setLocation('/attendance'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'attendance-history',
      title: '打卡記錄',
      description: '查詢歷史打卡明細',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      onClick: () => setLocation('/attendance-history'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'leave-calendar',
      title: '休假月曆',
      description: '查看員工休假狀況',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/leave-calendar'),
      show: permissions.canAccessLeaveCalendar,
    },
    {
      id: 'leave-request',
      title: '請假管理',
      description: '提交請假申請',
      icon: CheckSquare,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/leave'),
      show: permissions.canAccessLeaveManagement,
    },
    // 護理師和美容師專用
    {
      id: 'operation-fee',
      title: '操作費計算',
      description: '計算個人操作費用',
      icon: DollarSign,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => setLocation('/operation-fee'),
      show: user?.position === '美容師' || user?.position === '護理師',
    },
    // 主管以上權限
    {
      id: 'employee-management',
      title: '員工管理',
      description: '新增、編輯、管理員工資料',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/employee-management'),
      show: permissions.canManageStaffSchedule,
    },
    {
      id: 'leave-approval',
      title: '請假審核',
      description: '審核員工請假申請',
      icon: CheckSquare,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => setLocation('/approval'),
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'attendance-management',
      title: '打卡記錄管理',
      description: '管理全體員工打卡記錄',
      icon: FileText,
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
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
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/attendance-dashboard'),
      show: permissions.canAccessLeaveApproval,
    },
    // 管理員專用
    {
      id: 'account-management',
      title: '帳號密碼管理',
      description: '查看所有員工帳號密碼',
      icon: Key,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      onClick: () => setLocation('/account-management'),
      show: user?.role === 'admin',
    },
    {
      id: 'permission-management',
      title: '權限分配',
      description: '管理員工權限等級',
      icon: Shield,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/permission-management'),
      show: user?.role === 'admin',
    },
    {
      id: 'attendance-settings',
      title: '打卡設定',
      description: '管理打卡系統設定',
      icon: Settings,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      onClick: () => setLocation('/attendance-settings'),
      show: user?.role === 'admin' || user?.role === 'super_admin',
    },
  ];

  const visibleCards = featureCards.filter(card => card.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 頂部導航 */}
      <div className="bg-white/80 backdrop-blur shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🏥 {APP_TITLE}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.name} ({user?.position || '員工'})
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                修改密碼
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎訊息 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            歡迎回來，{user?.name}！
          </h2>
          <p className="text-gray-600">
            請選擇您需要的功能
          </p>
        </div>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className={`${card.bgColor} border-2 hover:shadow-xl transition-all cursor-pointer group`}
                onClick={card.onClick}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full bg-gradient-to-r ${card.color} text-white group-hover:scale-105 transition-transform`}
                  >
                    進入功能
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 使用說明 */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                使用說明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <strong>我的打卡：</strong>點擊「電子看板」即時查看今日打卡狀況，或在「打卡記錄」查看歷史明細
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <strong>休假管理：</strong>在「休假月曆」查看所有員工休假狀況，在「請假管理」提交請假申請
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <strong>操作費計算：</strong>護理師和美容師可使用此功能計算個人操作費用
                </div>
              </div>
              {(user?.role === 'supervisor' || user?.role === 'senior_supervisor' || user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <strong>主管功能：</strong>您可以管理員工資料、審核請假申請，並查看電子看板
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 頁尾 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>FLOS 曜診所 | 診所管理系統</p>
          <p className="mt-1">{new Date().toLocaleDateString('zh-TW')}</p>
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">當前密碼</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="請輸入當前密碼"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密碼</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="請輸入新密碼 (至少6個字元)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認新密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="請再次輸入新密碼"
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
            >
              取消
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? '處理中...' : '確認修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
