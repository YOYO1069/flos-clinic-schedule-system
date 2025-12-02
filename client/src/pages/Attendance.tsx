import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle, XCircle, Calendar, LogOut, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useLocation } from "wouter";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
  attendance_date: string;
  source: string;
  created_at: string;
}

export default function Attendance() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);

  // 檢查登入狀態
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    setUser(JSON.parse(userStr));
  }, []);

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 載入今日打卡記錄
  useEffect(() => {
    if (user) {
      loadTodayRecord();
      loadRecentRecords();
    }
  }, [user]);

  // 載入今日打卡記錄
  async function loadTodayRecord() {
    if (!user) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', user.employee_id)
        .eq('attendance_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('載入今日記錄失敗:', error);
      } else {
        setTodayRecord(data);
      }
    } catch (err) {
      console.error('載入今日記錄錯誤:', err);
    }
  }

  // 載入最近打卡記錄
  async function loadRecentRecords() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('attendance_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) {
        console.error('載入最近記錄失敗:', error);
      } else {
        setRecentRecords(data || []);
      }
    } catch (err) {
      console.error('載入最近記錄錯誤:', err);
    }
  }

  // 上班打卡
  async function handleCheckIn() {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      
      // 檢查今天是否已經上班打卡
      if (todayRecord && todayRecord.check_in_time) {
        toast.error('您今天已經打卡上班了');
        setLoading(false);
        return;
      }

      // 轉換為台灣時區 (UTC+8)
      const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: user.employee_id,
          employee_name: user.name,
          check_in_time: taiwanTime.toISOString().replace('Z', ''),
          attendance_date: today,
          source: 'web'
        })
        .select()
        .single();

      if (error) {
        console.error('上班打卡失敗:', error);
        toast.error('上班打卡失敗');
      } else {
        setTodayRecord(data);
        toast.success(`✅ 上班打卡成功!時間:${format(now, 'HH:mm')}`);
        await loadRecentRecords();
      }
    } catch (err) {
      console.error('上班打卡錯誤:', err);
      toast.error('上班打卡失敗');
    } finally {
      setLoading(false);
    }
  }

  // 下班打卡
  async function handleCheckOut() {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      
      // 檢查今天是否已經上班打卡
      if (!todayRecord || !todayRecord.check_in_time) {
        toast.error('您今天尚未打卡上班');
        setLoading(false);
        return;
      }

      // 檢查是否已經下班打卡
      if (todayRecord.check_out_time) {
        toast.error('您今天已經打卡下班了');
        setLoading(false);
        return;
      }

      // 計算工時
      const checkInTime = new Date(todayRecord.check_in_time);
      const workHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      // 轉換為台灣時區 (UTC+8)
      const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: taiwanTime.toISOString().replace('Z', ''),
          work_hours: Math.round(workHours * 100) / 100
        })
        .eq('id', todayRecord.id)
        .select()
        .single();

      if (error) {
        console.error('下班打卡失敗:', error);
        toast.error('下班打卡失敗');
      } else {
        setTodayRecord(data);
        const hours = Math.floor(workHours);
        const minutes = Math.round((workHours - hours) * 60);
        toast.success(`✅ 下班打卡成功!工時:${hours} 小時 ${minutes} 分鐘`);
        await loadRecentRecords();
      }
    } catch (err) {
      console.error('下班打卡錯誤:', err);
      toast.error('下班打卡失敗');
    } finally {
      setLoading(false);
    }
  }

  // 登出
  function handleLogout() {
    localStorage.removeItem('user');
    setLocation('/login');
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">員工打卡系統</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </Button>
        </div>

        {/* 當前時間 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              當前時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-indigo-600">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-center text-gray-600 mt-2">
              {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              員工:{user.name} ({user.employee_id})
            </div>
          </CardContent>
        </Card>

        {/* 打卡按鈕 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            size="lg"
            className="h-32 text-xl bg-green-500 hover:bg-green-600"
            onClick={handleCheckIn}
            disabled={loading || (todayRecord && todayRecord.check_in_time !== null)}
          >
            <CheckCircle className="w-8 h-8 mr-2" />
            上班打卡
          </Button>
          <Button
            size="lg"
            className="h-32 text-xl bg-blue-500 hover:bg-blue-600"
            onClick={handleCheckOut}
            disabled={loading || !todayRecord || !todayRecord.check_in_time || todayRecord.check_out_time !== null}
          >
            <XCircle className="w-8 h-8 mr-2" />
            下班打卡
          </Button>
        </div>

        {/* 今日打卡狀態 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              今日打卡狀態
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">上班時間:</span>
                  <span className="font-semibold">
                    {todayRecord.check_in_time ? format(new Date(todayRecord.check_in_time), 'HH:mm:ss') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">下班時間:</span>
                  <span className="font-semibold">
                    {todayRecord.check_out_time ? format(new Date(todayRecord.check_out_time), 'HH:mm:ss') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">工作時數:</span>
                  <span className="font-semibold">
                    {todayRecord.work_hours ? `${Math.floor(todayRecord.work_hours)} 小時 ${Math.round((todayRecord.work_hours - Math.floor(todayRecord.work_hours)) * 60)} 分鐘` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">打卡方式:</span>
                  <span className="font-semibold">
                    {todayRecord.source === 'web' ? '網頁打卡' : 'LINE 打卡'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                今日尚未打卡
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近打卡記錄 */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>最近打卡記錄</CardTitle>
            <CardDescription>顯示最近 7 天的打卡記錄</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">
                        {format(new Date(record.attendance_date), 'yyyy-MM-dd EEEE', { locale: zhTW })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.source === 'web' ? '網頁' : 'LINE'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">上班:</span>
                        <span className="ml-1 font-medium">
                          {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">下班:</span>
                        <span className="ml-1 font-medium">
                          {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">工時:</span>
                        <span className="ml-1 font-medium">
                          {record.work_hours ? `${record.work_hours.toFixed(1)}h` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                暫無打卡記錄
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
