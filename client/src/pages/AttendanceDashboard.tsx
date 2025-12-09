import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle, XCircle, Users, ArrowLeft, RefreshCw } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

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

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  role: string;
}

export default function AttendanceDashboard() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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
    // 每15秒自動重新載入
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // 載入所有員工（從 users 表）
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, employee_id, name, role')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;

      // 載入今日打卡記錄
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('work_date', today);

      if (recordsError) throw recordsError;

      setAllEmployees(employeesData || []);
      setTodayRecords(recordsData || []);
    } catch (error) {
      console.error('載入資料失敗:', error);
    } finally {
      setLoading(false);
    }
  }

  // 統計資料
  const checkedInCount = todayRecords.filter(r => r.check_in_time && !r.check_out_time).length;
  const checkedOutCount = todayRecords.filter(r => r.check_out_time).length;
  const notCheckedInCount = allEmployees.length - todayRecords.length;

  // 獲取員工狀態
  function getEmployeeStatus(employeeId: string): { status: string; color: string; time: string } {
    const record = todayRecords.find(r => r.employee_id === employeeId);
    
    if (!record) {
      return { status: '未打卡', color: 'bg-gray-100 text-gray-700', time: '-' };
    }
    
    if (record.check_out_time) {
      return { 
        status: '已下班', 
        color: 'bg-blue-100 text-blue-700',
        time: format(new Date(record.check_out_time), 'HH:mm', { locale: zhTW })
      };
    }
    
    if (record.check_in_time) {
      return { 
        status: '上班中', 
        color: 'bg-green-100 text-green-700',
        time: format(new Date(record.check_in_time), 'HH:mm', { locale: zhTW })
      };
    }
    
    return { status: '未打卡', color: 'bg-gray-100 text-gray-700', time: '-' };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 標題區 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首頁
            </Button>
            <Button 
              variant="outline" 
              onClick={loadData}
              className="mb-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重新整理
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">員工上班狀態看板</h1>
              <p className="text-lg text-gray-600 mt-1">
                {format(currentTime, 'yyyy年MM月dd日 HH:mm:ss EEEE', { locale: zhTW })}
              </p>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">總員工數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900">{allEmployees.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">上班中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold text-gray-900">{checkedInCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">已下班</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900">{checkedOutCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">未打卡</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-8 h-8 text-gray-500" />
                <span className="text-3xl font-bold text-gray-900">{notCheckedInCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 員工狀態列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">員工即時狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEmployees.map((employee) => {
                const { status, color, time } = getEmployeeStatus(employee.employee_id);
                return (
                  <div 
                    key={employee.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-500">{employee.employee_id}</p>
                      </div>
                      <Badge className={color}>
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
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
