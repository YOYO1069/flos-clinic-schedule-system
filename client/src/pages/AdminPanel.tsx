import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { LogOut, Users, Calendar, Clock, FileText, Shield, Eye, EyeOff, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  employee_id: string;
  name: string;
  password: string;
  role: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  admin: { label: '管理者', color: 'bg-red-100 text-red-800', icon: '🔴' },
  senior_supervisor: { label: '高階主管', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  supervisor: { label: '一般主管', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  staff: { label: '員工', color: 'bg-green-100 text-green-800', icon: '🟢' }
};

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // 在組件頂層調用 usePermissions Hook
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { permissions: userPermissions } = usePermissions(user?.role as UserRole);

  useEffect(() => {
    // 檢查登入狀態
    if (!userStr || !user) {
      setLocation('/login');
      return;
    }
    
    // 檢查權限
    if (!userPermissions.canAccessAccountManagement) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }

    setCurrentUser(user);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('載入使用者失敗:', error);
      toast.error("載入使用者失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("已登出");
    setLocation('/login');
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleResetPassword = async (user: User) => {
    if (!newPassword) {
      toast.error("請輸入新密碼");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("密碼至少需要 6 個字元");
      return;
    }

    setIsResetting(true);

    try {
      // 使用 crypto 加密密碼
      const crypto = await import('crypto');
      const hashPassword = (password: string) => {
        return crypto.createHash('sha256').update(password).digest('hex');
      };

      const hashedPassword = hashPassword(newPassword);

      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`✅ 已重設 ${user.name} 的密碼\n新密碼: ${newPassword}`);
      setResetPasswordUserId(null);
      setNewPassword("");
      loadUsers();
    } catch (error) {
      console.error('重設密碼失敗:', error);
      toast.error("重設密碼失敗");
    } finally {
      setIsResetting(false);
    }
  };

  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">管理者主控台</h1>
                <p className="text-sm text-gray-600">歡迎回來,{currentUser?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation('/')}>
                <Calendar className="w-4 h-4 mr-2" />
                休假月曆
              </Button>
              <Button variant="outline" onClick={() => setLocation('/calendar')}>
                <Calendar className="w-4 h-4 mr-2" />
                員工排班月曆
              </Button>
              <Button variant="outline" onClick={() => setLocation('/staff-management')}>
                <Users className="w-4 h-4 mr-2" />
                員工管理
              </Button>
              <Button variant="outline" onClick={() => setLocation('/staff-leave')}>
                <Calendar className="w-4 h-4 mr-2" />
                員工休假月曆
              </Button>
              <Button variant="outline" onClick={() => setLocation('/attendance')}>
                <Clock className="w-4 h-4 mr-2" />
                員工打卡
              </Button>
              <Button variant="outline" onClick={() => setLocation('/leave')}>
                <FileText className="w-4 h-4 mr-2" />
                請假管理
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>員工帳號管理</CardTitle>
            <CardDescription>
              查看所有員工的登入資訊和權限設定 (共 {users.length} 位員工)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedUsers).map(([role, roleUsers]) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ROLE_LABELS[role]?.icon}</span>
                  <h3 className="text-lg font-semibold">{ROLE_LABELS[role]?.label} ({roleUsers.length}位)</h3>
                </div>
                
                <div className="grid gap-3">
                  {roleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">員工編號: {user.employee_id} | 帳號: {user.employee_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog open={resetPasswordUserId === user.id} onOpenChange={(open) => {
                            if (!open) {
                              setResetPasswordUserId(null);
                              setNewPassword("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResetPasswordUserId(user.id)}
                              >
                                <KeyRound className="w-4 h-4 mr-1" />
                                重設密碼
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>重設密碼</DialogTitle>
                                <DialogDescription>
                                  為 {user.name} ({user.employee_id}) 設定新密碼
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="newPassword">新密碼</Label>
                                  <Input
                                    id="newPassword"
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="請輸入新密碼(至少 6 個字元)"
                                    disabled={isResetting}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleResetPassword(user)}
                                    disabled={isResetting}
                                    className="flex-1"
                                  >
                                    {isResetting ? "處理中..." : "確認重設"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setResetPasswordUserId(null);
                                      setNewPassword("");
                                    }}
                                    disabled={isResetting}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
