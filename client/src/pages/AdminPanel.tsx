import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { LogOut, Users, Calendar, Clock, FileText, Shield, Eye, EyeOff } from "lucide-react";

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

  useEffect(() => {
    // 檢查登入狀態
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
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
              <Button variant="outline" onClick={() => setLocation('/schedule')}>
                <Users className="w-4 h-4 mr-2" />
                排班系統
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
                            <span className={`px-2 py-1 text-xs rounded-full ${ROLE_LABELS[user.role]?.color}`}>
                              {ROLE_LABELS[user.role]?.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">員工編號: {user.employee_id} | 帳號: {user.employee_id}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">預設密碼</p>
                            <p className="font-mono text-sm">
                              {showPasswords[user.id] ? user.password : '••••••••'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(user.id)}
                          >
                            {showPasswords[user.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 權限說明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>權限說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔴</span>
                  <h4 className="font-semibold">管理者</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-8">
                  <li>• 管理所有主管和員工</li>
                  <li>• 審核所有請假</li>
                  <li>• 查看所有人密碼</li>
                  <li>• 完整系統管理權限</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🟠</span>
                  <h4 className="font-semibold">高階主管</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-8">
                  <li>• 完整系統管理</li>
                  <li>• 審核出勤和請假</li>
                  <li>• 匯出報表</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🟡</span>
                  <h4 className="font-semibold">一般主管</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-8">
                  <li>• 審核出勤和請假</li>
                  <li>• 匯出報表</li>
                  <li>• 低於高階主管權限</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🟢</span>
                  <h4 className="font-semibold">員工</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 ml-8">
                  <li>• 上班/下班打卡</li>
                  <li>• 查看自己的出勤記錄</li>
                  <li>• 請假申請</li>
                  <li>• 查看自己的排班</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
