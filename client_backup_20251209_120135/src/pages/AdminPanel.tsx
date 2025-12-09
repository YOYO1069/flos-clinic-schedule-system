import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCog, Key, Search, ArrowLeft, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    
    // 只有 admin 可以訪問
    if (user.role !== 'admin') {
      toast.error('您沒有權限訪問此頁面');
      setLocation('/');
      return;
    }
    
    setCurrentUser(user);
    loadEmployees();
  }, [setLocation]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('載入員工資料失敗:', error);
      toast.error('載入員工資料失敗');
    }
  };

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    if (!confirm(`確定要將此員工的角色變更為「${getRoleName(newRole)}」嗎？`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ role: newRole })
        .eq('employee_id', employeeId);

      if (error) throw error;

      toast.success('權限更新成功');
      loadEmployees();
    } catch (error: any) {
      console.error('更新權限失敗:', error);
      toast.error('更新權限失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedEmployee) {
      toast.error('請選擇要重設密碼的員工');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('密碼長度至少需要 6 個字元');
      return;
    }

    setLoading(true);
    try {
      // 在前端使用 bcryptjs 加密密碼
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新資料庫
      const { error } = await supabase
        .from('employees')
        .update({ 
          password: hashedPassword,
          password_changed: true
        })
        .eq('employee_id', selectedEmployee.employee_id);

      if (error) throw error;

      toast.success(`已成功重設「${selectedEmployee.name}」的密碼\n新密碼：${newPassword}`, {
        duration: 5000
      });
      setNewPassword('');
      setSelectedEmployee(null);
      setShowResetDialog(false);
    } catch (error: any) {
      console.error('重設密碼失敗:', error);
      toast.error('重設密碼失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': '管理員',
      'senior_supervisor': '高階主管',
      'supervisor': '一般主管',
      'staff': '一般員工'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-700 border-red-300',
      'senior_supervisor': 'bg-purple-100 text-purple-700 border-purple-300',
      'supervisor': 'bg-blue-100 text-blue-700 border-blue-300',
      'staff': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首頁
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">管理員面板</h1>
                  <p className="text-sm text-gray-500">權限分配與帳號管理</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              管理員：<span className="font-semibold text-gray-900">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="permissions" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <UserCog className="w-4 h-4" />
              權限分配
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
              <Key className="w-4 h-4" />
              帳號管理
            </TabsTrigger>
          </TabsList>

          {/* 權限分配 Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="p-6 shadow-sm border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-600" />
                      員工權限管理
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      管理員工的系統權限等級（共 {employees.length} 位員工）
                    </p>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="搜尋員工姓名或編號..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">員工編號</TableHead>
                        <TableHead className="font-semibold text-gray-700">姓名</TableHead>
                        <TableHead className="font-semibold text-gray-700">職位</TableHead>
                        <TableHead className="font-semibold text-gray-700">目前權限</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">變更權限</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-mono text-sm text-gray-600">
                            {employee.employee_id}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {employee.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {employee.position || '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(employee.role)}`}>
                              {getRoleName(employee.role)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Select
                              value={employee.role}
                              onValueChange={(value) => handleRoleChange(employee.employee_id, value)}
                              disabled={loading || employee.employee_id === currentUser?.employee_id}
                            >
                              <SelectTrigger className="w-40 mx-auto border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">一般員工</SelectItem>
                                <SelectItem value="supervisor">一般主管</SelectItem>
                                <SelectItem value="senior_supervisor">高階主管</SelectItem>
                                <SelectItem value="admin">管理員</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>找不到符合條件的員工</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* 帳號管理 Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card className="p-6 shadow-sm border-gray-200">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-violet-600" />
                    密碼重設
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    為員工重設登入密碼
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="搜尋員工..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>

                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">員工編號</TableHead>
                        <TableHead className="font-semibold text-gray-700">姓名</TableHead>
                        <TableHead className="font-semibold text-gray-700">角色</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-mono text-sm text-gray-600">
                            {employee.employee_id}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {employee.name}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(employee.role)}`}>
                              {getRoleName(employee.role)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowResetDialog(true);
                              }}
                              className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              重設密碼
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>找不到符合條件的員工</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 重設密碼對話框 */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-600" />
              重設密碼
            </DialogTitle>
            <DialogDescription>
              為「{selectedEmployee?.name}」設定新的登入密碼
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="text-sm text-violet-700 font-medium mb-1">
                選定員工
              </div>
              <div className="text-lg font-semibold text-violet-900">
                {selectedEmployee?.name}
              </div>
              <div className="text-sm text-violet-600 font-mono mt-1">
                {selectedEmployee?.employee_id}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700">新密碼</Label>
              <Input
                id="newPassword"
                type="text"
                placeholder="請輸入新密碼（至少 6 個字元）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-mono border-gray-300"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                建議使用包含數字和字母的組合，長度至少 8 個字元
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <div className="text-amber-600 mt-0.5">⚠️</div>
                <div className="text-sm text-amber-700">
                  <div className="font-medium mb-1">注意事項</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>員工下次登入時需使用新密碼</li>
                    <li>建議通知員工盡快修改密碼</li>
                    <li>請妥善保管密碼，勿透過不安全管道傳送</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleResetPassword}
                disabled={loading || !newPassword}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {loading ? '處理中...' : '確認重設'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setSelectedEmployee(null);
                  setNewPassword('');
                }}
                disabled={loading}
                className="border-gray-300"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
