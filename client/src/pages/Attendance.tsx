import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle, XCircle, Calendar, LogOut, ArrowLeft, History, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useLocation } from "wouter";
import { toast } from "sonner";
import { utcToTaiwanTime, getTaiwanNow, taiwanTimeToUTC } from '@/lib/timezone';

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  check_in_address: string | null;
  check_out_address: string | null;
  work_hours: number | null;
  work_date: string;
  source: string;
  created_at: string;
}

export default function Attendance() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  
  // 打卡方式設定
  const [checkInMode, setCheckInMode] = useState<'gps' | 'manual' | 'quick' | 'bluetooth'>('gps');
  const [manualLocation, setManualLocation] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState('');

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
      loadSettings();
    }
  }, [user]);

  // 載入打卡設定
  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('attendance_settings')
        .select('*');

      if (error) {
        console.error('載入設定失敗:', error);
      } else {
        const settingsObj: any = {};
        data?.forEach(item => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        setSettings(settingsObj);
      }
    } catch (err) {
      console.error('載入設定錯誤:', err);
    }
  }

  // 載入今日打卡記錄
  async function loadTodayRecord() {
    if (!user) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', user.employee_id)
        .eq('work_date', today)
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
        .order('work_date', { ascending: false })
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

  // 獲取GPS定位
  async function getLocation(): Promise<{ latitude: number; longitude: number; address: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('瀏覽器不支援定位,跳過定位功能');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (精度: ${Math.round(accuracy)}m)`;
          resolve({ latitude, longitude, address });
        },
        (error) => {
          console.log('定位失敗(非致命錯誤):', error.code, error.message);
          // 静默失敗,不顯示錯誤訊息,讓打卡繼續
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // 上班打卡
  async function handleCheckIn() {
    if (!user) return;
    
    setLoading(true);
    try {
      // 取得台灣時間
      const taiwanNow = getTaiwanNow();
      // 轉換為 UTC 儲存到資料庫
      const utcNow = taiwanTimeToUTC(taiwanNow);
      const today = format(taiwanNow, 'yyyy-MM-dd');
      
      // 檢查今天是否已經上班打卡
      if (todayRecord && todayRecord.check_in_time) {
        toast.error('您今天已經打卡上班了');
        setLoading(false);
        return;
      }

      const recordData: any = {
        employee_id: user.employee_id,
        employee_name: user.name,
        check_in_time: utcNow,
        work_date: today
      };

      // 根據打卡模式處理
      if (checkInMode === 'gps') {
        // GPS 打卡
        recordData.check_in_method = 'gps';
        const location = await getLocation();
        if (location) {
          recordData.check_in_latitude = location.latitude;
          recordData.check_in_longitude = location.longitude;
          recordData.check_in_address = location.address;
        } else if (settings.require_gps === 'true') {
          toast.error('無法取得GPS定位，請使用其他打卡方式');
          setLoading(false);
          return;
        }
      } else if (checkInMode === 'manual') {
        // 手動輸入地點
        recordData.check_in_method = 'manual';
        if (!manualLocation.trim()) {
          toast.error('請輸入打卡地點');
          setLoading(false);
          return;
        }
        recordData.check_in_address = manualLocation;
      } else if (checkInMode === 'bluetooth') {
        // 藍牙打卡
        recordData.check_in_method = 'bluetooth';
        if (!bluetoothDeviceName.trim()) {
          toast.error('請輸入藍牙裝置名稱');
          setLoading(false);
          return;
        }
        recordData.bluetooth_device_name = bluetoothDeviceName;
        recordData.check_in_address = `藍牙裝置: ${bluetoothDeviceName}`;
      } else if (checkInMode === 'quick') {
        // 快速打卡
        recordData.check_in_method = 'quick';
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .insert(recordData)
        .select()
        .single();

      if (error) {
        console.error('上班打卡失敗:', error);
        toast.error('上班打卡失敗');
      } else {
        setTodayRecord(data);
        let successMsg = `✅ 上班打卡成功!\n⏰ 時間: ${format(now, 'HH:mm')}`;
        if (checkInMode === 'gps' && recordData.check_in_address) {
          successMsg += `\n📍 地點: ${recordData.check_in_address}`;
        } else if (checkInMode === 'manual') {
          successMsg += `\n📍 地點: ${manualLocation}`;
        } else if (checkInMode === 'bluetooth') {
          successMsg += `\n🔵 裝置: ${bluetoothDeviceName}`;
        }
        toast.success(successMsg);
        setManualLocation(''); // 清空手動輸入
        setBluetoothDeviceName(''); // 清空藍牙裝置
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
      // 取得台灣時間
      const taiwanNow = getTaiwanNow();
      // 轉換為 UTC 儲存到資料庫
      const utcNow = taiwanTimeToUTC(taiwanNow);
      
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

      // 計算工時 (使用 UTC 時間計算)
      const checkInTime = new Date(todayRecord.check_in_time);
      const checkOutTime = new Date(utcNow);
      const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const updateData: any = {
        check_out_time: utcNow,
        total_hours: Math.round(workHours * 100) / 100
      };

      // 根據打卡模式處理
      if (checkInMode === 'gps') {
        const location = await getLocation();
        if (location) {
          updateData.check_out_latitude = location.latitude;
          updateData.check_out_longitude = location.longitude;
          updateData.check_out_address = location.address;
        } else if (settings.require_gps === 'true') {
          toast.error('無法取得GPS定位，請使用其他打卡方式');
          setLoading(false);
          return;
        }
      } else if (checkInMode === 'manual') {
        if (!manualLocation.trim()) {
          toast.error('請輸入打卡地點');
          setLoading(false);
          return;
        }
        updateData.check_out_address = manualLocation;
      } else if (checkInMode === 'bluetooth') {
        if (!bluetoothDeviceName.trim()) {
          toast.error('請輸入藍牙裝置名稱');
          setLoading(false);
          return;
        }
        updateData.check_out_address = `藍牙裝置: ${bluetoothDeviceName}`;
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .update(updateData)
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
        let successMsg = `✅ 下班打卡成功!\n⏱️ 工時: ${hours} 小時 ${minutes} 分鐘`;
        if (checkInMode === 'gps' && updateData.check_out_address) {
          successMsg += `\n📍 地點: ${updateData.check_out_address}`;
        } else if (checkInMode === 'manual') {
          successMsg += `\n📍 地點: ${manualLocation}`;
        } else if (checkInMode === 'bluetooth') {
          successMsg += `\n🔵 裝置: ${bluetoothDeviceName}`;
        }
        toast.success(successMsg);
        setManualLocation(''); // 清空手動輸入
        setBluetoothDeviceName(''); // 清空藍牙裝置
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

  // 載入歷史打卡記錄
  async function loadHistoryRecords() {
    if (!user) return;
    
    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('work_date', { ascending: false })
        .order('created_at', { ascending: false });

      // 如果有開始日期
      if (startDate) {
        query = query.gte('work_date', startDate);
      }

      // 如果有結束日期
      if (endDate) {
        query = query.lte('work_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('載入歷史記錄失敗:', error);
        toast.error('載入歷史記錄失敗');
      } else {
        setHistoryRecords(data || []);
      }
    } catch (err) {
      console.error('載入歷史記錄錯誤:', err);
      toast.error('載入歷史記錄失敗');
    }
  }

  // 匯出 Excel
  function exportToExcel() {
    if (historyRecords.length === 0) {
      toast.error('沒有資料可匯出');
      return;
    }

    // 準備匯出資料
    const exportData = historyRecords.map(record => ({
      '日期': record.work_date,
      '上班時間': record.check_in_time ? format(utcToTaiwanTime(record.check_in_time), 'HH:mm:ss') : '-',
      '下班時間': record.check_out_time ? format(utcToTaiwanTime(record.check_out_time), 'HH:mm:ss') : '-',
      '工時': record.work_hours ? `${record.work_hours.toFixed(2)}` : '-',
      '上班地點': record.check_in_address || '-',
      '下班地點': record.check_out_address || '-',
      '打卡方式': record.source === 'web' ? '網頁打卡' : 'LINE打卡'
    }));

    // 建立 CSV內容
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // 下載檔案
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `打卡記錄_${user.name}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('匯出成功！');
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

        {/* 打卡方式選擇 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>選擇打卡方式</CardTitle>
            <CardDescription>根據您的需求選擇不同的打卡方式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Button
                variant={checkInMode === 'gps' ? 'default' : 'outline'}
                onClick={() => setCheckInMode('gps')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">📍</span>
                <span className="text-sm">GPS打卡</span>
              </Button>
              <Button
                variant={checkInMode === 'quick' ? 'default' : 'outline'}
                onClick={() => setCheckInMode('quick')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">⚡</span>
                <span className="text-sm">快速打卡</span>
              </Button>
              <Button
                variant={checkInMode === 'bluetooth' ? 'default' : 'outline'}
                onClick={() => setCheckInMode('bluetooth')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">🔵</span>
                <span className="text-sm">藍牙打卡</span>
              </Button>
            </div>



            {/* 藍牙裝置名稱 */}
            {checkInMode === 'bluetooth' && (
              <div className="mt-4">
                <Label htmlFor="bluetoothDevice">藍牙裝置名稱</Label>
                <Input
                  id="bluetoothDevice"
                  placeholder="例如：iPhone 13 Pro"
                  value={bluetoothDeviceName}
                  onChange={(e) => setBluetoothDeviceName(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  請輸入您的藍牙裝置名稱，系統將自動記錄您的打卡記錄。
                </p>
              </div>
            )}

            {/* 打卡方式說明 */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              {checkInMode === 'gps' && (
                <p>📍 <strong>GPS打卡</strong>：系統將自動取得您的GPS定位資訊。如果定位失敗，{settings.require_gps === 'true' ? '將無法打卡' : '仍可正常打卡'}。</p>
              )}
              {checkInMode === 'quick' && (
                <p>⚡ <strong>快速打卡</strong>：快速打卡不需要任何地點資訊，適合快速記錄時間。</p>
              )}
              {checkInMode === 'bluetooth' && (
                <p>🔵 <strong>藍牙打卡</strong>：系統將記錄您的藍牙裝置名稱，適合配合Windows監控程式使用。</p>
              )}
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
                    {todayRecord.check_in_time ? format(utcToTaiwanTime(todayRecord.check_in_time), 'HH:mm:ss') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">下班時間:</span>
                  <span className="font-semibold">
                    {todayRecord.check_out_time ? format(utcToTaiwanTime(todayRecord.check_out_time), 'HH:mm:ss') : '-'}
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
                {todayRecord.check_in_address && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <span className="text-gray-600 text-sm">📍 上班打卡地點:</span>
                    <span className="text-sm text-gray-700">{todayRecord.check_in_address}</span>
                  </div>
                )}
                {todayRecord.check_out_address && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <span className="text-gray-600 text-sm">📍 下班打卡地點:</span>
                    <span className="text-sm text-gray-700">{todayRecord.check_out_address}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                今日尚未打卡
              </div>
            )}
          </CardContent>
        </Card>

        {/* 歷史打卡明細按鈕 */}
        <div className="mb-6">
          <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-14 text-lg bg-purple-500 hover:bg-purple-600"
                onClick={() => {
                  setHistoryDialogOpen(true);
                  loadHistoryRecords();
                }}
              >
                <History className="w-6 h-6 mr-2" />
                歷史打卡明細
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>歷史打卡明細</DialogTitle>
                <DialogDescription>
                  查看和匯出您的歷史打卡記錄
                </DialogDescription>
              </DialogHeader>
              
              {/* 日期篩選 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="startDate">開始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">結束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* 查詢和匯出按鈕 */}
              <div className="flex gap-2 mb-4">
                <Button onClick={loadHistoryRecords} className="flex-1">
                  <History className="w-4 h-4 mr-2" />
                  查詢
                </Button>
                <Button onClick={exportToExcel} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  匯出 Excel
                </Button>
              </div>

              {/* 記錄列表 */}
              <div className="space-y-3">
                {historyRecords.length > 0 ? (
                  historyRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-semibold text-gray-800">
                          {format(new Date(record.work_date), 'yyyy-MM-dd EEEE', { locale: zhTW })}
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {record.source === 'web' ? '網頁打卡' : 'LINE打卡'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">上班:</span>
                          <div className="font-medium mt-1">
                            {record.check_in_time ? format(utcToTaiwanTime(record.check_in_time), 'HH:mm:ss') : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">下班:</span>
                          <div className="font-medium mt-1">
                            {record.check_out_time ? format(utcToTaiwanTime(record.check_out_time), 'HH:mm:ss') : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">工時:</span>
                          <div className="font-medium mt-1">
                            {record.work_hours ? `${record.work_hours.toFixed(1)} 小時` : '-'}
                          </div>
                        </div>
                      </div>

                      {(record.check_in_address || record.check_out_address) && (
                        <div className="border-t pt-3 space-y-2">
                          {record.check_in_address && (
                            <div className="text-xs">
                              <span className="text-gray-600">📍 上班地點:</span>
                              <div className="text-gray-700 mt-1">{record.check_in_address}</div>
                            </div>
                          )}
                          {record.check_out_address && (
                            <div className="text-xs">
                              <span className="text-gray-600">📍 下班地點:</span>
                              <div className="text-gray-700 mt-1">{record.check_out_address}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    沒有符合條件的打卡記錄
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
                        {format(new Date(record.work_date), 'yyyy-MM-dd EEEE', { locale: zhTW })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.source === 'web' ? '網頁' : 'LINE'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">上班:</span>
                        <span className="ml-1 font-medium">
                          {record.check_in_time ? format(utcToTaiwanTime(record.check_in_time), 'HH:mm') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">下班:</span>
                        <span className="ml-1 font-medium">
                          {record.check_out_time ? format(utcToTaiwanTime(record.check_out_time), 'HH:mm') : '-'}
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
