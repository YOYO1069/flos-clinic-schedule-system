import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Settings, Save, ArrowLeft, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function AttendanceSettings() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // 檢查登入狀態和權限
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    
    // 只有管理員可以訪問
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      toast.error('您沒有權限訪問此頁面');
      setLocation('/');
      return;
    }
    
    setUser(userData);
  }, []);

  // 載入設定
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('attendance_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        console.error('載入設定失敗:', error);
        toast.error('載入設定失敗');
      } else {
        const settingsObj: Record<string, string> = {};
        data?.forEach((item: Setting) => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        setSettings(settingsObj);
      }
    } catch (err) {
      console.error('載入設定錯誤:', err);
      toast.error('載入設定失敗');
    }
  }

  async function handleSaveSettings() {
    if (!user) return;
    
    setLoading(true);
    try {
      // 更新每個設定
      const updates = Object.entries(settings).map(([key, value]) => 
        supabase
          .from('attendance_settings')
          .update({ 
            setting_value: value,
            updated_by: user.employee_id 
          })
          .eq('setting_key', key)
      );

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);

      if (hasError) {
        toast.error('部分設定儲存失敗');
      } else {
        toast.success('✅ 設定已儲存');
        await loadSettings();
      }
    } catch (err) {
      console.error('儲存設定錯誤:', err);
      toast.error('儲存設定失敗');
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(key: string) {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  }

  function handleInputChange(key: string, value: string) {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function handleLogout() {
    localStorage.removeItem('user');
    setLocation('/login');
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">打卡系統設定</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </Button>
        </div>

        {/* 管理員資訊 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">管理員</div>
                <div className="text-xl font-bold text-gray-800">{user.name}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 打卡方式設定 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>打卡方式設定</CardTitle>
            <CardDescription>設定員工可使用的打卡方式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GPS 定位設定 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="require_gps" className="text-base font-semibold">
                  強制要求 GPS 定位
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  開啟後，員工必須成功取得 GPS 定位才能打卡
                </p>
              </div>
              <Switch
                id="require_gps"
                checked={settings.require_gps === 'true'}
                onCheckedChange={() => handleToggle('require_gps')}
              />
            </div>

            {/* 手動輸入地點 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="allow_manual_location" className="text-base font-semibold">
                  允許手動輸入地點
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  開啟後，員工可以手動輸入打卡地點，不需要 GPS 定位
                </p>
              </div>
              <Switch
                id="allow_manual_location"
                checked={settings.allow_manual_location === 'true'}
                onCheckedChange={() => handleToggle('allow_manual_location')}
              />
            </div>

            {/* 快速打卡 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="allow_quick_checkin" className="text-base font-semibold">
                  允許快速打卡
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  開啟後，員工可以快速打卡，不需要任何地點資訊
                </p>
              </div>
              <Switch
                id="allow_quick_checkin"
                checked={settings.allow_quick_checkin === 'true'}
                onCheckedChange={() => handleToggle('allow_quick_checkin')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 診所位置設定 */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>診所位置設定</CardTitle>
            <CardDescription>設定診所的 GPS 座標和有效打卡距離</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinic_latitude">診所緯度</Label>
                <Input
                  id="clinic_latitude"
                  type="number"
                  step="0.0001"
                  value={settings.clinic_latitude || ''}
                  onChange={(e) => handleInputChange('clinic_latitude', e.target.value)}
                  placeholder="例如：25.0330"
                />
              </div>
              <div>
                <Label htmlFor="clinic_longitude">診所經度</Label>
                <Input
                  id="clinic_longitude"
                  type="number"
                  step="0.0001"
                  value={settings.clinic_longitude || ''}
                  onChange={(e) => handleInputChange('clinic_longitude', e.target.value)}
                  placeholder="例如：121.5654"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="valid_distance">有效打卡距離（公尺）</Label>
              <Input
                id="valid_distance"
                type="number"
                value={settings.valid_distance || ''}
                onChange={(e) => handleInputChange('valid_distance', e.target.value)}
                placeholder="例如：500"
              />
              <p className="text-sm text-gray-600 mt-1">
                員工在此距離範圍內才能成功打卡（目前此功能尚未啟用）
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 儲存按鈕 */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => loadSettings()}
          >
            取消變更
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? '儲存中...' : '儲存設定'}
          </Button>
        </div>

        {/* 設定說明 */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">💡 設定說明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800 space-y-2">
            <p><strong>建議設定：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>如果診所網路環境良好，建議開啟「允許手動輸入地點」和「允許快速打卡」</li>
              <li>如果需要嚴格管控打卡位置，可以開啟「強制要求 GPS 定位」</li>
              <li>GPS 定位可能受到室內環境、裝置設定等因素影響</li>
              <li>快速打卡適合緊急情況或GPS定位不穩定時使用</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
