import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Shield, Search, Save } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ROLE_LABELS, ROLE_COLORS, UserRole } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";

interface UserPermission {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  role: string;
  created_at: string;
}

export default function PermissionManagement() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingRoles, setEditingRoles] = useState<Record<number, string>>({});
  const { permissions } = usePermissions(currentUser?.role as UserRole);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
  }, [setLocation]);

  useEffect(() => {
    if (!currentUser) return;
    
    // 使用 permissions.ts 檢查權限
    if (!permissions.canAccessPermissionManagement) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }
    loadUsers();
  }, [currentUser, permissions.canAccessPermissionManagement, setLocation]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.includes(searchTerm) ||
        user.employee_id.includes(searchTerm) ||
        user.position.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, employee_id, name, position, role, created_at')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
      
      // 初始化編輯狀態
      const initialRoles: Record<number, string> = {};
      (data || []).forEach(user => {
        initialRoles[user.id] = user.role;
      });
      setEditingRoles(initialRoles);
    } catch (error) {
      console.error('載入使用者資料失敗:', error);
      toast.error("載入使用者資料失敗");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleChange(userId: number, newRole: string) {
    setEditingRoles(prev => ({
      ...prev,
      [userId]: newRole
    }));
  }

  async function handleSaveRole(user: UserPermission) {
    const newRole = editingRoles[user.id];
    if (newRole === user.role) {
      toast.info("權限未變更");
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`已更新 ${user.name} 的權限為 ${ROLE_LABELS[newRole as keyof typeof ROLE_LABELS]}`);
      
      // 如果是當前使用者，更新 localStorage 並提示重新登入
      if (currentUser && user.employee_id === currentUser.employee_id) {
        const updatedUser = { ...currentUser, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.info("您的權限已變更，請重新登入以套用新權限", { duration: 5000 });
      }
      
      loadUsers();
    } catch (error) {
      console.error('更新權限失敗:', error);
      toast.error("更新權限失敗");
    }
  }

  function getRoleStats() {
    const stats = {
      admin: 0,
      senior_supervisor: 0,
      supervisor: 0,
      staff: 0,
    };

    users.forEach(user => {
      if (user.role in stats) {
        stats[user.role as keyof typeof stats]++;
      }
    });

    return stats;
  }

  const stats = getRoleStats();

  if (loading) {
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">權限分配管理</h1>
                <p className="text-sm text-gray-600">管理員工的權限等級</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">管理者</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.admin}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">高階主管</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.senior_supervisor}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">一般主管</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.supervisor}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">員工</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.staff}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜尋區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>搜尋員工</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="輸入姓名、員工編號或職位"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              顯示 {filteredUsers.length} 位員工 (共 {users.length} 位)
            </div>
          </CardContent>
        </Card>

        {/* 權限列表 */}
        <Card>
          <CardContent className="p-0">
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">員工編號</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">姓名</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">職位</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">當前權限</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">變更權限</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {user.employee_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.position}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}`}>
                            {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <select
                            value={editingRoles[user.id] || user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="admin">管理者</option>
                            <option value="senior_supervisor">高階主管</option>
                            <option value="supervisor">一般主管</option>
                            <option value="staff">員工</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            onClick={() => handleSaveRole(user)}
                            disabled={editingRoles[user.id] === user.role}
                            className="gap-2"
                          >
                            <Save className="w-4 h-4" />
                            儲存
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? '沒有符合條件的員工' : '沒有員工資料'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 權限說明 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900 mb-2">權限等級說明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div>
                  <span className="font-semibold">🔴 管理者：</span>
                  完整系統權限，可管理所有功能和查看所有資料
                </div>
                <div>
                  <span className="font-semibold">🟠 高階主管：</span>
                  可審核請假、管理排班、查看業績報表
                </div>
                <div>
                  <span className="font-semibold">🟡 一般主管：</span>
                  可審核請假、管理排班、查看自己的業績
                </div>
                <div>
                  <span className="font-semibold">🟢 員工：</span>
                  可打卡、請假、查看自己的資料
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
