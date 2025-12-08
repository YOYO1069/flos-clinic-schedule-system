import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Eye, EyeOff, Search, Download } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { canModifyUser } from "@/lib/roleHierarchy";

interface UserAccount {
  employee_id: string;
  name: string;
  position: string;
  role: string;
  password: string;
  created_at: string;
}

export default function AccountManagement() {
  const [, setLocation] = useLocation();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    if (!permissions.canAccessAccountManagement) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }
    loadAccounts();
  }, [currentUser, permissions.canAccessAccountManagement, setLocation]);

  useEffect(() => {
    let filtered = accounts;
    
    // 角色層級篩選 - 只顯示可管理的員工
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(account => 
        canModifyUser(currentUser.role as UserRole, account.role as UserRole)
      );
    }
    
    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.includes(searchTerm) ||
        account.employee_id.includes(searchTerm) ||
        account.position.includes(searchTerm)
      );
    }
    
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, currentUser]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id, name, position, role, password, created_at')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
      setFilteredAccounts(data || []);
    } catch (error) {
      console.error('載入帳號資料失敗:', error);
      toast.error("載入帳號資料失敗");
    } finally {
      setLoading(false);
    }
  }

  function togglePasswordVisibility(employeeId: string) {
    setShowPasswords(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  }

  function exportToCSV() {
    if (filteredAccounts.length === 0) {
      toast.error("沒有資料可以匯出");
      return;
    }

    const headers = ['員工編號', '姓名', '職位', '權限', '密碼', '建立日期'];
    const csvData = filteredAccounts.map(account => [
      account.employee_id,
      account.name,
      account.position,
      getRoleLabel(account.role),
      account.password,
      account.created_at.split('T')[0]
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `員工帳號密碼_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success("匯出成功");
  }

  function getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      admin: '管理者',
      senior_supervisor: '高階主管',
      supervisor: '一般主管',
      staff: '員工',
    };
    return roleLabels[role] || role;
  }

  function getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      senior_supervisor: 'bg-orange-100 text-orange-800',
      supervisor: 'bg-yellow-100 text-yellow-800',
      staff: 'bg-green-100 text-green-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  }

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
                <h1 className="text-2xl font-bold text-gray-900">員工帳號密碼管理</h1>
                <p className="text-sm text-gray-600">查看所有員工的帳號和密碼資訊</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 篩選區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>篩選條件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜尋員工
                </label>
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
              </div>
              <div className="flex items-end">
                <Button onClick={exportToCSV} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  匯出 CSV
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              顯示 {filteredAccounts.length} 筆帳號 (共 {accounts.length} 筆)
            </div>
          </CardContent>
        </Card>

        {/* 帳號列表 */}
        <Card>
          <CardContent className="p-0">
            {filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">員工編號</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">姓名</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">職位</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">權限</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">密碼</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">建立日期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAccounts.map((account) => (
                      <tr key={account.employee_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {account.employee_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {account.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {account.position}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(account.role)}`}>
                            {getRoleLabel(account.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {showPasswords[account.employee_id] ? account.password : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(account.employee_id)}
                            >
                              {showPasswords[account.employee_id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {account.created_at.split('T')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? '沒有符合條件的帳號' : '沒有帳號資料'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">安全提示</h3>
                <p className="text-sm text-yellow-800">
                  此頁面顯示所有員工的帳號和密碼資訊，請妥善保管，切勿外洩。
                  建議定期更換密碼以確保帳號安全。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
