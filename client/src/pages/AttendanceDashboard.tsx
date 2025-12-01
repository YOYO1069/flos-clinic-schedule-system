import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, RefreshCw, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';
import { utcToTaiwanTime } from '@/lib/timezone';

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_date: string;
  check_in_method?: string;
}

interface EmployeeStatus {
  employee_id: string;
  employee_name: string;
  position: string;
  status: 'checked_in' | 'checked_out' | 'not_checked_in';
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_method?: string;
}

export default function AttendanceDashboard() {
  const [, navigate] = useLocation();
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 載入員工打卡狀況
  const loadAttendanceStatus = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      // 1. 獲取所有員工
      const { data: employees, error: employeesError } = await supabase
        .from('users')
        .select('employee_id, name, position')
        .in('role', ['staff', 'supervisor', 'senior_supervisor'])
        .order('name');

      if (employeesError) throw employeesError;

      // 2. 獲取今日打卡記錄
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('work_date', today);

      if (recordsError) throw recordsError;

      // 3. 合併資料
      const statuses: EmployeeStatus[] = (employees || []).map(emp => {
        const record = (records || []).find((r: AttendanceRecord) => r.employee_id === emp.employee_id);
        
        let status: 'checked_in' | 'checked_out' | 'not_checked_in' = 'not_checked_in';
        if (record) {
          if (record.check_out_time) {
            status = 'checked_out';
          } else if (record.check_in_time) {
            status = 'checked_in';
          }
        }

        return {
          employee_id: emp.employee_id,
          employee_name: emp.name,
          position: emp.position || '員工',
          status,
          check_in_time: record?.check_in_time || null,
          check_out_time: record?.check_out_time || null,
          check_in_method: record?.check_in_method
        };
      });

      setEmployeeStatuses(statuses);
    } catch (error: any) {
      console.error('載入打卡狀況失敗:', error);
      toast.error('載入打卡狀況失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceStatus();

    // 每30秒自動刷新
    const interval = setInterval(loadAttendanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // 統計資料
  const stats = {
    total: employeeStatuses.length,
    checkedIn: employeeStatuses.filter(e => e.status === 'checked_in').length,
    checkedOut: employeeStatuses.filter(e => e.status === 'checked_out').length,
    notCheckedIn: employeeStatuses.filter(e => e.status === 'not_checked_in').length
  };

  // 取得狀態顯示
  const getStatusDisplay = (status: EmployeeStatus) => {
    switch (status.status) {
      case 'checked_in':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: '已上班',
          color: 'bg-green-50 border-green-200',
          time: status.check_in_time ? format(utcToTaiwanTime(status.check_in_time), 'HH:mm:ss') : ''
        };
      case 'checked_out':
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
          text: '已下班',
          color: 'bg-blue-50 border-blue-200',
          time: status.check_out_time ? format(utcToTaiwanTime(status.check_out_time), 'HH:mm:ss') : ''
        };
      default:
        return {
          icon: <XCircle className="w-5 h-5 text-gray-400" />,
          text: '未打卡',
          color: 'bg-gray-50 border-gray-200',
          time: ''
        };
    }
  };

  // 取得打卡方式顯示
  const getMethodDisplay = (method?: string) => {
    switch (method) {
      case 'gps':
        return '📍 GPS';
      case 'manual':
        return '✍️ 手動';
      case 'quick':
        return '⚡ 快速';
      case 'bluetooth':
        return '🔵 藍牙';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              電子看板
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAttendanceStatus}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* 當前時間 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-lg text-gray-600">
                {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                總員工數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50/80 backdrop-blur border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已上班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/80 backdrop-blur border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已下班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.checkedOut}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50/80 backdrop-blur border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                未打卡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.notCheckedIn}</div>
            </CardContent>
          </Card>
        </div>

        {/* 員工打卡狀況列表 */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>今日打卡狀況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employeeStatuses.map((emp) => {
                const display = getStatusDisplay(emp);
                return (
                  <div
                    key={emp.employee_id}
                    className={`p-4 rounded-lg border-2 ${display.color} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{emp.employee_name}</div>
                        <div className="text-sm text-gray-500">{emp.position}</div>
                      </div>
                      {display.icon}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{display.text}</span>
                      {display.time && (
                        <span className="text-sm text-gray-600">{display.time}</span>
                      )}
                    </div>
                    {emp.check_in_method && (
                      <div className="mt-2 text-xs text-gray-500">
                        {getMethodDisplay(emp.check_in_method)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-500">
                載入中...
              </div>
            )}

            {!loading && employeeStatuses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暫無員工資料
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
