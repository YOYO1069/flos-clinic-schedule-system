import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  UserCog, 
  Key, 
  Search, 
  ArrowLeft, 
  Shield, 
  Users, 
  Clock, 
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  role: string;
  position?: string;
  phone?: string;
  employment_status?: string;
  created_at?: string;
}

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  work_date: string;
  check_in_time?: string;
  check_out_time?: string;
  work_hours?: number;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  created_at: string;
}

export default function CompleteAdminPanel() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // 員工管理
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  // 新增/編輯員工
  const [employeeForm, setEmployeeForm] = useState({
    employee_id: "",
    name: "",
    role: "staff",
    position: "",
    phone: "",
    password: ""
  });
  
  // 打卡記錄
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceEmployeeFilter, setAttendanceEmployeeFilter] = useState("");
  
  // 請假記錄
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("all");
  
  const [loading, setLoading] = useState(false);

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
    loadAttendanceRecords();
    loadLeaveRequests();
  }, [setLocation]);

  // ==================== 員工管理 ====================
  
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

  const handleAddEmployee = () => {
    setEmployeeForm({
      employee_id: "",
      name: "",
      role: "staff",
      position: "",
      phone: "",
      password: ""
    });
    setSelectedEmployee(null);
    setShowEmployeeDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeForm({
      employee_id: employee.employee_id,
      name: employee.name,
      role: employee.role,
      position: employee.position || "",
      phone: employee.phone || "",
      password: ""
    });
    setSelectedEmployee(employee);
    setShowEmployeeDialog(true);
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.employee_id || !employeeForm.name) {
      toast.error('請填寫員工編號和姓名');
      return;
    }

    setLoading(true);
    try {
      if (selectedEmployee) {
        // 編輯現有員工
        const updateData: any = {
          name: employeeForm.name,
          role: employeeForm.role,
          position: employeeForm.position,
          phone: employeeForm.phone
        };

        // 如果有輸入新密碼，才更新密碼
        if (employeeForm.password) {
          updateData.password = await hashPassword(employeeForm.password);
        }

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', selectedEmployee.id);

        if (error) throw error;
        toast.success('員工資料更新成功');
      } else {
        // 新增員工
        if (!employeeForm.password) {
          toast.error('新增員工時必須設定密碼');
          return;
        }

        const { error } = await supabase
          .from('employees')
          .insert({
            employee_id: employeeForm.employee_id,
            name: employeeForm.name,
            role: employeeForm.role,
            position: employeeForm.position,
            phone: employeeForm.phone,
            password: await hashPassword(employeeForm.password),
            employment_status: 'active'
          });

        if (error) throw error;
        toast.success('員工新增成功');
      }

      setShowEmployeeDialog(false);
      loadEmployees();
    } catch (error: any) {
      console.error('儲存員工資料失敗:', error);
      toast.error('儲存失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    const newStatus = employee.employment_status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '啟用' : '停用';
    
    if (!confirm(`確定要${action}「${employee.name}」嗎？`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          employment_status: newStatus,
          resignation_date: newStatus === 'inactive' ? new Date().toISOString() : null
        })
        .eq('id', employee.id);

      if (error) throw error;
      toast.success(`${action}成功`);
      loadEmployees();
    } catch (error: any) {
      console.error(`${action}失敗:`, error);
      toast.error(`${action}失敗：` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedEmployee || !newPassword) {
      toast.error('請輸入新密碼');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('密碼長度至少需要 6 個字元');
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const { error } = await supabase
        .from('employees')
        .update({ 
          password: hashedPassword,
          password_changed: false
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast.success(`已重設「${selectedEmployee.name}」的密碼\n新密碼：${newPassword}`, {
        duration: 5000
      });
      setNewPassword('');
      setSelectedEmployee(null);
      setShowPasswordDialog(false);
    } catch (error: any) {
      console.error('重設密碼失敗:', error);
      toast.error('重設密碼失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (employeeId: number, newRole: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ role: newRole })
        .eq('id', employeeId);

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

  // ==================== 打卡記錄管理 ====================
  
  const loadAttendanceRecords = async () => {
    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('work_date', { ascending: false })
        .order('check_in_time', { ascending: false });

      if (attendanceDateFilter) {
        query = query.eq('work_date', attendanceDateFilter);
      }

      if (attendanceEmployeeFilter) {
        query = query.eq('employee_id', attendanceEmployeeFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error: any) {
      console.error('載入打卡記錄失敗:', error);
      toast.error('載入打卡記錄失敗');
    }
  };

  const handleExportAttendance = () => {
    if (attendanceRecords.length === 0) {
      toast.error('沒有資料可匯出');
      return;
    }

    const csv = [
      ['日期', '員工姓名', '上班時間', '下班時間', '工時', '上班定位', '下班定位'].join(','),
      ...attendanceRecords.map(record => [
        record.work_date,
        record.employee_name,
        record.check_in_time || '',
        record.check_out_time || '',
        record.work_hours || '',
        record.check_in_latitude && record.check_in_longitude 
          ? `${record.check_in_latitude},${record.check_in_longitude}` 
          : '',
        record.check_out_latitude && record.check_out_longitude 
          ? `${record.check_out_latitude},${record.check_out_longitude}` 
          : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `打卡記錄_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('匯出成功');
  };

  // ==================== 請假管理 ====================
  
  const loadLeaveRequests = async () => {
    try {
      let query = supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (leaveStatusFilter !== 'all') {
        query = query.eq('status', leaveStatusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error: any) {
      console.error('載入請假記錄失敗:', error);
      toast.error('載入請假記錄失敗');
    }
  };

  const handleApproveLeave = async (leaveId: number) => {
    if (!confirm('確定要批准此請假申請嗎？')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', leaveId);

      if (error) throw error;
      toast.success('已批准請假');
      loadLeaveRequests();
    } catch (error: any) {
      console.error('批准失敗:', error);
      toast.error('批准失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId: number, reason: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', leaveId);

      if (error) throw error;
      toast.success('已拒絕請假');
      loadLeaveRequests();
    } catch (error: any) {
      console.error('拒絕失敗:', error);
      toast.error('拒絕失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 輔助函數 ====================
  
  const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': '管理員',
      'senior_supervisor': '資深主管',
      'supervisor': '一般主管',
      'staff': '一般員工'
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      'pending': { text: '待審核', color: 'bg-yellow-100 text-yellow-800' },
      'approved': { text: '已批准', color: 'bg-green-100 text-green-800' },
      'rejected': { text: '已拒絕', color: 'bg-red-100 text-red-800' }
    };
    const s = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded text-xs ${s.color}`}>{s.text}</span>;
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                管理員控制台
              </h1>
              <p className="text-gray-600 mt-1">系統管理與監控</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">管理員</p>
            <p className="font-semibold">{currentUser?.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              員工管理
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              打卡記錄
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              請假管理
            </TabsTrigger>
          </TabsList>

          {/* 員工管理 Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>員工管理</CardTitle>
                    <CardDescription>管理所有員工資料和權限</CardDescription>
                  </div>
                  <Button onClick={handleAddEmployee}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增員工
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜尋員工姓名或編號..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>員工編號</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>職位</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono text-sm">
                            {employee.employee_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={employee.role}
                              onValueChange={(value) => handleRoleChange(employee.id, value)}
                              disabled={loading}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">一般員工</SelectItem>
                                <SelectItem value="supervisor">一般主管</SelectItem>
                                <SelectItem value="senior_supervisor">資深主管</SelectItem>
                                <SelectItem value="admin">管理員</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{employee.position || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              employee.employment_status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {employee.employment_status === 'active' ? '在職' : '離職'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowPasswordDialog(true);
                              }}
                            >
                              <Key className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleEmployeeStatus(employee)}
                            >
                              {employee.employment_status === 'active' ? (
                                <XCircle className="h-3 w-3 text-red-600" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 打卡記錄 Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>打卡記錄</CardTitle>
                    <CardDescription>查看和管理所有員工打卡記錄</CardDescription>
                  </div>
                  <Button onClick={handleExportAttendance}>
                    <Download className="h-4 w-4 mr-2" />
                    匯出 CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>日期篩選</Label>
                    <Input
                      type="date"
                      value={attendanceDateFilter}
                      onChange={(e) => {
                        setAttendanceDateFilter(e.target.value);
                        loadAttendanceRecords();
                      }}
                    />
                  </div>
                  <div>
                    <Label>員工篩選</Label>
                    <Select
                      value={attendanceEmployeeFilter}
                      onValueChange={(value) => {
                        setAttendanceEmployeeFilter(value);
                        loadAttendanceRecords();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="所有員工" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">所有員工</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAttendanceDateFilter('');
                        setAttendanceEmployeeFilter('');
                        loadAttendanceRecords();
                      }}
                    >
                      清除篩選
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>員工</TableHead>
                        <TableHead>上班時間</TableHead>
                        <TableHead>下班時間</TableHead>
                        <TableHead>工時</TableHead>
                        <TableHead>定位</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500">
                            暫無打卡記錄
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.work_date}</TableCell>
                            <TableCell>{record.employee_name}</TableCell>
                            <TableCell>
                              {record.check_in_time 
                                ? new Date(record.check_in_time).toLocaleTimeString('zh-TW', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {record.check_out_time 
                                ? new Date(record.check_out_time).toLocaleTimeString('zh-TW', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {record.work_hours ? `${record.work_hours.toFixed(1)} 小時` : '-'}
                            </TableCell>
                            <TableCell>
                              {record.check_in_latitude && record.check_in_longitude ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    window.open(
                                      `https://www.google.com/maps?q=${record.check_in_latitude},${record.check_in_longitude}`,
                                      '_blank'
                                    );
                                  }}
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  查看
                                </Button>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 請假管理 Tab */}
          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>請假管理</CardTitle>
                    <CardDescription>審核和管理所有請假申請</CardDescription>
                  </div>
                  <Select
                    value={leaveStatusFilter}
                    onValueChange={(value) => {
                      setLeaveStatusFilter(value);
                      loadLeaveRequests();
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="pending">待審核</SelectItem>
                      <SelectItem value="approved">已批准</SelectItem>
                      <SelectItem value="rejected">已拒絕</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>申請日期</TableHead>
                        <TableHead>員工</TableHead>
                        <TableHead>假別</TableHead>
                        <TableHead>開始日期</TableHead>
                        <TableHead>結束日期</TableHead>
                        <TableHead>天數</TableHead>
                        <TableHead>原因</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-gray-500">
                            暫無請假記錄
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>
                              {new Date(leave.created_at).toLocaleDateString('zh-TW')}
                            </TableCell>
                            <TableCell>
                              {employees.find(e => e.id === leave.employee_id)?.name || '-'}
                            </TableCell>
                            <TableCell>{leave.leave_type}</TableCell>
                            <TableCell>{leave.start_date}</TableCell>
                            <TableCell>{leave.end_date}</TableCell>
                            <TableCell>{leave.days} 天</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {leave.reason}
                            </TableCell>
                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              {leave.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => handleApproveLeave(leave.id)}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    批准
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => {
                                      const reason = prompt('請輸入拒絕原因：');
                                      if (reason) {
                                        handleRejectLeave(leave.id, reason);
                                      }
                                    }}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    拒絕
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 新增/編輯員工對話框 */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? '編輯員工' : '新增員工'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee ? '修改員工資料' : '建立新的員工帳號'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>員工編號 *</Label>
              <Input
                value={employeeForm.employee_id}
                onChange={(e) => setEmployeeForm({ ...employeeForm, employee_id: e.target.value })}
                disabled={!!selectedEmployee}
                placeholder="例如：flosXXX001"
              />
            </div>
            <div>
              <Label>姓名 *</Label>
              <Input
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                placeholder="員工姓名"
              />
            </div>
            <div>
              <Label>角色</Label>
              <Select
                value={employeeForm.role}
                onValueChange={(value) => setEmployeeForm({ ...employeeForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">一般員工</SelectItem>
                  <SelectItem value="supervisor">一般主管</SelectItem>
                  <SelectItem value="senior_supervisor">資深主管</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>職位</Label>
              <Input
                value={employeeForm.position}
                onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                placeholder="例如：護理師、美容師"
              />
            </div>
            <div>
              <Label>電話</Label>
              <Input
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                placeholder="聯絡電話"
              />
            </div>
            <div>
              <Label>
                密碼 {selectedEmployee ? '(留空表示不修改)' : '*'}
              </Label>
              <Input
                type="password"
                value={employeeForm.password}
                onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                placeholder="至少 6 個字元"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEmployee} disabled={loading}>
              {loading ? '儲存中...' : '儲存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重設密碼對話框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重設密碼</DialogTitle>
            <DialogDescription>
              為「{selectedEmployee?.name}」設定新密碼
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>新密碼</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少 6 個字元"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordDialog(false);
              setNewPassword('');
            }}>
              取消
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? '重設中...' : '確認重設'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
