import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, tables } from "@/lib/supabase";
import { MapPin, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  check_in_time: string;
  check_out_time?: string;
  check_in_location_lat?: number;
  check_in_location_lng?: number;
  check_out_location_lat?: number;
  check_out_location_lng?: number;
  status: string;
  work_hours?: number;
  notes?: string;
  created_at: string;
}

export default function Attendance() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 模擬員工 ID (實際應從登入系統取得)
  const employeeId = 1;

  // 更新當前時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 載入今日打卡記錄
  useEffect(() => {
    loadTodayRecord();
    loadRecentRecords();
  }, []);

  // 取得GPS定位
  const getLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('瀏覽器不支援定位功能'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          resolve(loc);
        },
        (error) => {
          reject(new Error('無法取得定位: ' + error.message));
        }
      );
    });
  };

  // 載入今日打卡記錄
  async function loadTodayRecord() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from(tables.attendanceRecords)
        .select('*')
        .eq('employee_id', employeeId)
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single();

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
    try {
      const { data, error } = await supabase
        .from(tables.attendanceRecords)
        .select('*')
        .eq('employee_id', employeeId)
        .order('check_in_time', { ascending: false })
        .limit(10);

      if (error) {
        console.error('載入記錄失敗:', error);
      } else {
        setRecentRecords(data || []);
      }
    } catch (err) {
      console.error('載入記錄錯誤:', err);
    }
  }

  // 上班打卡
  async function checkIn() {
    setLoading(true);
    try {
      const loc = await getLocation();
      
      const { error } = await supabase
        .from(tables.attendanceRecords)
        .insert([{
          employee_id: employeeId,
          check_in_time: new Date().toISOString(),
          check_in_location_lat: loc.lat,
          check_in_location_lng: loc.lng,
          status: 'normal'
        }]);

      if (error) throw error;

      alert('✅ 上班打卡成功!');
      await loadTodayRecord();
      await loadRecentRecords();
    } catch (err: any) {
      alert('❌ 打卡失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 下班打卡
  async function checkOut() {
    if (!todayRecord) {
      alert('❌ 請先上班打卡');
      return;
    }

    setLoading(true);
    try {
      const loc = await getLocation();
      const checkInTime = new Date(todayRecord.check_in_time);
      const checkOutTime = new Date();
      const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from(tables.attendanceRecords)
        .update({
          check_out_time: checkOutTime.toISOString(),
          check_out_location_lat: loc.lat,
          check_out_location_lng: loc.lng,
          work_hours: Math.round(workHours * 100) / 100
        })
        .eq('id', todayRecord.id);

      if (error) throw error;

      alert(`✅ 下班打卡成功! 工作時數: ${Math.round(workHours * 100) / 100} 小時`);
      await loadTodayRecord();
      await loadRecentRecords();
    } catch (err: any) {
      alert('❌ 打卡失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const hasCheckedIn = todayRecord && !todayRecord.check_out_time;
  const hasCheckedOut = todayRecord && todayRecord.check_out_time;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            員工打卡系統
          </h1>
          <p className="text-gray-600 mt-2">GPS 定位打卡 · 自動計算工時</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 打卡區 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-600" />
                即時打卡
              </CardTitle>
              <CardDescription>
                {format(currentTime, 'yyyy年MM月dd日 EEEE HH:mm:ss', { locale: zhTW })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 今日狀態 */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-gray-700">今日狀態</h3>
                {!todayRecord && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <XCircle className="w-5 h-5" />
                    <span>尚未打卡</span>
                  </div>
                )}
                {hasCheckedIn && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>已上班打卡</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      上班時間: {format(new Date(todayRecord.check_in_time), 'HH:mm:ss')}
                    </p>
                  </div>
                )}
                {hasCheckedOut && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>已下班打卡</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      上班: {format(new Date(todayRecord.check_in_time), 'HH:mm')} → 
                      下班: {format(new Date(todayRecord.check_out_time!), 'HH:mm')}
                    </p>
                    <p className="text-sm font-semibold text-pink-600">
                      工作時數: {todayRecord.work_hours} 小時
                    </p>
                  </div>
                )}
              </div>

              {/* GPS 定位狀態 */}
              {location && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700">GPS 定位成功</p>
                    <p className="text-xs mt-1">
                      緯度: {location.lat.toFixed(6)}, 經度: {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              {/* 打卡按鈕 */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-20 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={checkIn}
                  disabled={loading || hasCheckedIn || hasCheckedOut}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="w-6 h-6" />
                    <span>上班打卡</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  className="h-20 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={checkOut}
                  disabled={loading || !hasCheckedIn || hasCheckedOut}
                >
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="w-6 h-6" />
                    <span>下班打卡</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 最近打卡記錄 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                最近打卡記錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentRecords.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">尚無打卡記錄</p>
                ) : (
                  recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-700">
                          {format(new Date(record.check_in_time), 'yyyy/MM/dd (EEE)', { locale: zhTW })}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          record.status === 'normal' ? 'bg-green-100 text-green-700' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status === 'normal' ? '正常' :
                           record.status === 'late' ? '遲到' :
                           record.status === 'early_leave' ? '早退' : '異常'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">上班:</span>
                          <span>{format(new Date(record.check_in_time), 'HH:mm:ss')}</span>
                        </div>
                        {record.check_out_time && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">下班:</span>
                              <span>{format(new Date(record.check_out_time), 'HH:mm:ss')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600">工時:</span>
                              <span className="font-semibold">{record.work_hours} 小時</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
