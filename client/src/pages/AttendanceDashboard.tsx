import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle, XCircle, Users, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_date: string;
  total_hours: number | null;
  status: string;
  check_in_method: string;
}

interface User {
  id: number;
  employee_id: string;
  name: string;
  role: string;
}

export default function AttendanceDashboard() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { permissions } = usePermissions(currentUser?.role as UserRole);

  // 檢查權限
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
    if (!permissions.canAccessAttendanceDashboard) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }
  }, [currentUser, permissions.canAccessAttendanceDashboard, setLocation]);

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 載入資料
  useEffect(() => {
    loadData();
    // 每30秒自動重新載入
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // 載入所有員工
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'staff')
        .order('name', { ascending: true });

      if (usersError) throw usersError;

      // 載入今日打卡記錄
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('work_date', today);

      if (recordsError) throw recordsError;

      setAllUsers(usersData || []);
      setTodayRecords(recordsData || []);
    } catch (error) {
      console.error('載入資料失敗:', error);
    } finally {
      setLoading(false);
    }
  }

  // 統計資料
  const totalStaff = allUsers.length;
  const checkedIn = todayRecords.filter(r => r.check_in_time && !r.check_out_time).length;
  const checkedOut = todayRecords.filter(r => r.check_out_time).length;
  const notCheckedIn = totalStaff - todayRecords.length;

  // 取得員工的打卡記錄
  function getEmployeeRecord(employeeId: string): AttendanceRecord | null {
    return todayRecords.find(r => r.employee_id === employeeId) || null;
  }

  // 格式化時間顯示
  function formatTime(timeStr: string | null): string {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return format(date, 'HH:mm:ss');
    } catch {
      return '-';
    }
  }

  // 取得狀態樣式
  function getStatusStyle(record: AttendanceRecord | null) {
    if (!record || !record.check_in_time) {
      return 'bg-gray-100 border-gray-300';
    }
    if (record.check_out_time) {
      return 'bg-blue-50 border-blue-300';
    }
    return 'bg-green-50 border-green-300';
  }

  // 取得狀態圖示
  function getStatusIcon(record: AttendanceRecord | null) {
    if (!record || !record.check_in_time) {
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    if (record.check_out_time) {
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  }

  // 取得狀態文字
  function getStatusText(record: AttendanceRecord | null) {
    if (!record || !record.check_in_time) {
      return '未打卡';
    }
    if (record.check_out_time) {
      return '已下班';
    }
    return '已上班';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-xl">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一頁
            </Button>
            <h1 className="text-4xl font-bold text-gray-800">電子看板</h1>
          </div>
        </div>

        {/* 當前時間卡片 */}
        <Card className="mb-6 bg-white/90 backdrop-blur shadow-lg">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-2xl text-gray-700">
                {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                總員工數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStaff}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已上班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{checkedIn}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已下班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{checkedOut}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                未打卡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-700">{notCheckedIn}</div>
            </CardContent>
          </Card>
        </div>

        {/* 今日卡班狀況 */}
        <Card className="bg-white/90 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">今日卡班狀況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map((user) => {
                const record = getEmployeeRecord(user.employee_id);
                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border-2 ${getStatusStyle(record)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record)}
                        <div>
                          <div className="font-semibold text-lg">{user.name}</div>
                          <div className="text-xs text-gray-600">{user.employee_id}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {getStatusText(record)}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">上班:</span>
                        <span className="font-medium">
                          {formatTime(record?.check_in_time || null)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">下班:</span>
                        <span className="font-medium">
                          {formatTime(record?.check_out_time || null)}
                        </span>
                      </div>
                      {record?.check_in_method && (
                        <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                          <span className="text-gray-600">打卡方式:</span>
                          <span className="text-xs px-2 py-1 bg-white rounded">
                            {record.check_in_method === 'gps' && '📍 GPS'}
                            {record.check_in_method === 'bluetooth' && '📶 藍牙'}
                            {record.check_in_method === 'quick' && '⚡ 快速'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
