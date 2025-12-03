import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Download, Search } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
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
  created_at: string;
}

// 轉換 UTC 時間為台灣時間 (UTC+8)
function convertToTaiwanTime(utcTimeStr: string | null): Date | null {
  if (!utcTimeStr) return null;
  const utcDate = new Date(utcTimeStr);
  // 加上 8 小時
  return new Date(utcDate.getTime() + (8 * 60 * 60 * 1000));
}

export default function AttendanceManagement() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 檢查登入狀態
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);
    loadRecords();
  }, [selectedDate]);

  useEffect(() => {
    // 過濾記錄
    if (searchTerm) {
      const filtered = records.filter(record =>
        record.employee_name.includes(searchTerm) ||
        record.employee_id.includes(searchTerm)
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [searchTerm, records]);

  async function loadRecords() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('work_date', selectedDate)
        .order('check_in_time', { ascending: true });

      if (error) throw error;

      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error('載入打卡記錄失敗:', error);
      toast.error("載入打卡記錄失敗");
    } finally {
      setLoading(false);
    }
  }

  function formatTime(timeStr: string | null): string {
    if (!timeStr) return '-';
    try {
      const taiwanTime = convertToTaiwanTime(timeStr);
      if (!taiwanTime) return '-';
      return format(taiwanTime, 'HH:mm:ss');
    } catch {
      return '-';
    }
  }

  function exportToCSV() {
    if (filteredRecords.length === 0) {
      toast.error("沒有資料可以匯出");
      return;
    }

    const headers = ['員工編號', '姓名', '日期', '上班時間', '下班時間', '工作時數', '打卡方式'];
    const csvData = filteredRecords.map(record => [
      record.employee_id,
      record.employee_name,
      record.work_date,
      formatTime(record.check_in_time),
      formatTime(record.check_out_time),
      record.total_hours ? `${record.total_hours.toFixed(2)}` : '-',
      record.check_in_method === 'gps' ? 'GPS' : record.check_in_method === 'bluetooth' ? '藍牙' : '快速'
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `打卡記錄_${selectedDate}.csv`;
    link.click();

    toast.success("匯出成功");
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
                <h1 className="text-2xl font-bold text-gray-900">員工打卡紀錄管理</h1>
                <p className="text-sm text-gray-600">查看和管理所有員工的打卡記錄</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇日期
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜尋員工
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="輸入姓名或員工編號"
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
          </CardContent>
        </Card>

        {/* 統計資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                總打卡人數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredRecords.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                已下班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {filteredRecords.filter(r => r.check_out_time).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                尚未下班
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {filteredRecords.filter(r => !r.check_out_time).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                平均工時
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {filteredRecords.filter(r => r.total_hours).length > 0
                  ? (filteredRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0) / 
                     filteredRecords.filter(r => r.total_hours).length).toFixed(1)
                  : '0.0'}h
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 打卡記錄表格 */}
        <Card>
          <CardHeader>
            <CardTitle>打卡記錄</CardTitle>
            <CardDescription>
              {format(new Date(selectedDate), 'yyyy年MM月dd日 EEEE', { locale: zhTW })} 的打卡記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">員工編號</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">姓名</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">上班時間</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">下班時間</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">工作時數</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">打卡方式</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{record.employee_id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{record.employee_name}</td>
                        <td className="px-4 py-3 text-sm">{formatTime(record.check_in_time)}</td>
                        <td className="px-4 py-3 text-sm">{formatTime(record.check_out_time)}</td>
                        <td className="px-4 py-3 text-sm">
                          {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.check_in_method === 'gps' && '📍 GPS'}
                          {record.check_in_method === 'bluetooth' && '📶 藍牙'}
                          {record.check_in_method === 'quick' && '⚡ 快速'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.check_out_time ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              已下班
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              上班中
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? '沒有符合條件的記錄' : '當天沒有打卡記錄'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
