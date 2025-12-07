import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, FileText, Calendar, Users, Shield, Settings, 
  DollarSign, TrendingUp, Award, MessageSquare, BookOpen, Gift, Heart,
  LogOut, User
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

  const features = [
    { icon: Clock, label: '我的打卡', description: '查看打卡記錄', path: '/attendance', color: 'text-teal-400' },
    { icon: FileText, label: '請假管理', description: '申請與查詢假單', path: '/leave-management', color: 'text-blue-400' },
    { icon: FileText, label: '請假審核', description: '查看員工請假申請', path: '/leave-approval', color: 'text-green-400' },
    { icon: Calendar, label: '休假日曆', description: '員工休假系統', path: '/leave-calendar', color: 'text-rose-400' },
    { icon: FileText, label: '打卡記錄', description: '查看全員打卡記錄', path: '/attendance-management', color: 'text-purple-400' },
    { icon: Users, label: '員工管理', description: '管理員工資料', path: '/staff-management', color: 'text-amber-400' },
    { icon: Shield, label: '電子看板', description: '即時監控員工狀態', path: '/security-dashboard', color: 'text-fuchsia-400' },
    { icon: Settings, label: '打卡設定', description: '設定打卡規則', path: '/attendance-settings', color: 'text-slate-400' },
  ];

  const upcomingFeatures = [
    { icon: DollarSign, label: '薪資查詢', description: '查看薪資明細與歷史記錄' },
    { icon: TrendingUp, label: '績效考核', description: '查看個人績效與目標達成' },
    { icon: Award, label: '獎懲記錄', description: '查看獎勵與懲處記錄' },
    { icon: MessageSquare, label: '內部公告', description: '查看公司最新消息與公告' },
    { icon: BookOpen, label: '教育訓練', description: '線上課程與訓練記錄' },
    { icon: Gift, label: '福利專區', description: '員工福利與優惠資訊' },
    { icon: Heart, label: '健康管理', description: '健康檢查與體檢記錄' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 頂部導航 */}
      <div className="border-b border-gray-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500"></div>
              <div>
                <h1 className="text-xl font-light tracking-wide text-white">FLOS 曜診所</h1>
                <p className="text-xs text-gray-500 mt-0.5">排班管理系統</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-2.5 border border-gray-800 rounded-sm">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-white">{currentUser?.name}</div>
                  <div className="text-xs text-gray-500">{currentUser?.employee_id}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-800 rounded-sm hover:border-gray-700 transition-colors text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
        {/* 歡迎區 */}
        <div className="border-l-2 border-violet-500 pl-6 py-2">
          <h2 className="text-2xl font-light text-white mb-1">
            歡迎回來，{currentUser?.name}
          </h2>
          <p className="text-sm text-gray-500">今天也要加油喔</p>
        </div>

        {/* 本週醫師排班 */}
        {doctorSchedules.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Calendar className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-light text-white">本週醫師排班</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorSchedules.map((schedule, index) => (
                <div key={index} className="border border-gray-800 rounded-sm p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-violet-400">{schedule.employee_name}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(schedule.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 常用功能 */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-violet-500"></div>
            <h2 className="text-lg font-light text-white">常用功能</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className="border border-gray-800 rounded-sm p-8 hover:border-gray-700 transition-all duration-200 group text-left"
                >
                  <Icon className={`w-7 h-7 ${item.color} mb-6 group-hover:scale-110 transition-transform`} />
                  <h3 className="text-base font-light text-white mb-2">{item.label}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 即將推出 */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-6 bg-gray-700"></div>
            <h2 className="text-lg font-light text-white">即將推出</h2>
            <Badge variant="outline" className="border-gray-800 text-gray-600 text-xs font-light">
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
                  className="border border-gray-900 rounded-sm p-8 hover:border-gray-800 transition-all duration-200 group text-left opacity-50"
                >
                  <Icon className="w-7 h-7 text-gray-700 mb-6" />
                  <h3 className="text-base font-light text-gray-500 mb-2">{item.label}</h3>
                  <p className="text-xs text-gray-700 leading-relaxed">{item.description}</p>
                  <div className="mt-4">
                    <span className="text-xs text-gray-800">開發中</span>
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
