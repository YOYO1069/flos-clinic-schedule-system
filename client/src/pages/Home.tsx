import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, FileText, Calendar, Users, Shield, Settings, 
  DollarSign, TrendingUp, Award, MessageSquare, BookOpen, Gift, Heart,
  LogOut, User, UserCog, Key
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    loadDoctorSchedules();
  }, [setLocation]);

  const loadDoctorSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('role', 'doctor')
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date');

      if (error) throw error;
      setDoctorSchedules(data || []);
    } catch (error: any) {
      console.error('載入醫師排班失敗:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('已登出');
    setLocation('/login');
  };

  // 所有功能定義
  const allFeatures = [
    { icon: Clock, label: '我的打卡', description: '查看打卡記錄', path: '/attendance', color: 'text-cyan-600', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'] },
    { icon: FileText, label: '請假管理', description: '申請與查詢假單', path: '/leave-management', color: 'text-blue-600', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'] },
    { icon: FileText, label: '請假審核', description: '查看員工請假申請', path: '/leave-approval', color: 'text-green-600', roles: ['admin', 'senior_supervisor', 'supervisor'] },
    { icon: Calendar, label: '休假日曆', description: '員工休假系統', path: '/leave-calendar', color: 'text-pink-600', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'] },
    { icon: FileText, label: '打卡記錄', description: '查看全員打卡記錄', path: '/attendance-management', color: 'text-purple-600', roles: ['admin', 'senior_supervisor', 'supervisor'] },
    { icon: Users, label: '員工管理', description: '管理員工資料', path: '/staff-management', color: 'text-orange-600', roles: ['admin', 'senior_supervisor'] },
    { icon: Shield, label: '電子看板', description: '即時監控員工狀態', path: '/security-dashboard', color: 'text-fuchsia-600', roles: ['admin', 'senior_supervisor', 'supervisor'] },
    { icon: Settings, label: '打卡設定', description: '設定打卡規則', path: '/attendance-settings', color: 'text-slate-600', roles: ['admin'] },
    { icon: UserCog, label: '權限分配', description: '管理員工權限', path: '/admin-panel', color: 'text-indigo-600', roles: ['admin'] },
    { icon: Key, label: '帳號管理', description: '重設員工密碼', path: '/admin-panel', color: 'text-violet-600', roles: ['admin'] },
  ];

  const upcomingFeatures = [
    { icon: DollarSign, label: '薪資查詢', description: '查看薪資明細與歷史記錄', color: 'text-green-500' },
    { icon: TrendingUp, label: '績效考核', description: '查看個人績效與目標達成', color: 'text-blue-500' },
    { icon: Award, label: '獎懲記錄', description: '查看獎勵與懲處記錄', color: 'text-amber-500' },
    { icon: MessageSquare, label: '內部公告', description: '查看公司最新消息與公告', color: 'text-purple-500' },
    { icon: BookOpen, label: '教育訓練', description: '線上課程與訓練記錄', color: 'text-indigo-500' },
    { icon: Gift, label: '福利專區', description: '員工福利與優惠資訊', color: 'text-rose-500' },
    { icon: Heart, label: '健康管理', description: '健康檢查與體檢記錄', color: 'text-red-500' },
  ];

  // 根據角色篩選功能
  const features = allFeatures.filter(feature => 
    feature.roles.includes(currentUser?.role || 'staff')
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 頂部導航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center" style={{
                boxShadow: '0 2px 8px rgba(168,85,247,0.3)'
              }}>
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  FLOS 曜診所
                </h1>
                <p className="text-xs text-gray-500">排班管理系統</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200" style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
                  <div className="text-xs text-gray-500">{currentUser?.employee_id}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* 歡迎區 */}
        <div className="bg-white rounded-xl p-8 border border-gray-200" style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
        }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            今天也要加油喔！
          </h2>
          <p className="text-gray-600">歡迎回來，{currentUser?.name}</p>
        </div>

        {/* 本週醫師排班 */}
        {doctorSchedules.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">本週醫師排班</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorSchedules.map((schedule, index) => (
                <div key={index} className="bg-white rounded-lg p-5 border border-gray-200" style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-purple-600">{schedule.employee_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(schedule.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 常用功能 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">常用功能</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className="bg-white rounded-xl p-6 hover:bg-gray-50 transition-all duration-200 group border border-gray-200"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className={`w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-200 ${item.color}`} style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">{item.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 即將推出 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-gray-300 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">即將推出</h2>
            <Badge variant="outline" className="border-amber-300 text-amber-600 text-xs font-medium bg-amber-50">
              開發中
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {upcomingFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => toast.info('功能開發中，敬請期待！', {
                    description: `${item.label} 功能即將上線`,
                    duration: 3000
                  })}
                  className="bg-gray-50 rounded-xl p-6 transition-all duration-200 group border border-gray-200 cursor-pointer"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 border border-gray-200 ${item.color} opacity-60`} style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-500 mb-1">{item.label}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                  <div className="mt-3">
                    <span className="text-xs text-amber-600 font-medium">開發中</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
