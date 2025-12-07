import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, FileText, Calendar, Users, Shield, Settings, 
  DollarSign, TrendingUp, Award, MessageSquare, BookOpen, Gift, Heart,
  Sparkles, LogOut, User
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
    {
      icon: Clock,
      label: '我的打卡',
      description: '查看打卡記錄',
      path: '/attendance',
      gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      iconColor: 'text-emerald-400',
      available: true
    },
    {
      icon: FileText,
      label: '請假管理',
      description: '申請與查詢假單',
      path: '/leave-management',
      gradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
      iconColor: 'text-blue-400',
      available: true
    },
    {
      icon: FileText,
      label: '請假審核',
      description: '查看員工請假申請',
      path: '/leave-approval',
      gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      iconColor: 'text-green-400',
      available: true
    },
    {
      icon: Calendar,
      label: '休假日曆',
      description: '員工休假系統',
      path: '/leave-calendar',
      gradient: 'from-rose-500/20 via-pink-500/20 to-red-500/20',
      iconColor: 'text-rose-400',
      available: true
    },
    {
      icon: FileText,
      label: '打卡記錄',
      description: '查看全員打卡記錄',
      path: '/attendance-management',
      gradient: 'from-purple-500/20 via-violet-500/20 to-indigo-500/20',
      iconColor: 'text-purple-400',
      available: true
    },
    {
      icon: Users,
      label: '員工管理',
      description: '管理員工資料',
      path: '/staff-management',
      gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
      iconColor: 'text-amber-400',
      available: true
    },
    {
      icon: Shield,
      label: '電子看板',
      description: '即時監控員工狀態',
      path: '/security-dashboard',
      gradient: 'from-fuchsia-500/20 via-pink-500/20 to-rose-500/20',
      iconColor: 'text-fuchsia-400',
      available: true
    },
    {
      icon: Settings,
      label: '打卡設定',
      description: '設定打卡規則',
      path: '/attendance-settings',
      gradient: 'from-slate-500/20 via-gray-500/20 to-zinc-500/20',
      iconColor: 'text-slate-400',
      available: true
    },
  ];

  const upcomingFeatures = [
    {
      icon: DollarSign,
      label: '薪資查詢',
      description: '查看薪資明細與歷史記錄',
      gradient: 'from-green-500/10 via-emerald-500/10 to-teal-500/10',
      iconColor: 'text-green-400/60'
    },
    {
      icon: TrendingUp,
      label: '績效考核',
      description: '查看個人績效與目標達成',
      gradient: 'from-blue-500/10 via-cyan-500/10 to-sky-500/10',
      iconColor: 'text-blue-400/60'
    },
    {
      icon: Award,
      label: '獎懲記錄',
      description: '查看獎勵與懲處記錄',
      gradient: 'from-amber-500/10 via-orange-500/10 to-red-500/10',
      iconColor: 'text-amber-400/60'
    },
    {
      icon: MessageSquare,
      label: '內部公告',
      description: '查看公司最新消息與公告',
      gradient: 'from-purple-500/10 via-fuchsia-500/10 to-pink-500/10',
      iconColor: 'text-purple-400/60'
    },
    {
      icon: BookOpen,
      label: '教育訓練',
      description: '線上課程與訓練記錄',
      gradient: 'from-indigo-500/10 via-violet-500/10 to-purple-500/10',
      iconColor: 'text-indigo-400/60'
    },
    {
      icon: Gift,
      label: '福利專區',
      description: '員工福利與優惠資訊',
      gradient: 'from-rose-500/10 via-pink-500/10 to-red-500/10',
      iconColor: 'text-rose-400/60'
    },
    {
      icon: Heart,
      label: '健康管理',
      description: '健康檢查與體檢記錄',
      gradient: 'from-red-500/10 via-rose-500/10 to-pink-500/10',
      iconColor: 'text-red-400/60'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 頂部導航 */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FLOS 曜診所</h1>
                <p className="text-xs text-slate-400">排班管理系統</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-white">{currentUser?.name}</div>
                  <div className="text-xs text-slate-400">{currentUser?.employee_id}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-all duration-300 text-slate-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 歡迎卡片 */}
        <div className="bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-violet-500/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              歡迎回來，{currentUser?.name}
            </h2>
          </div>
          <p className="text-slate-400">今天也要加油喔！</p>
        </div>

        {/* 本週醫師排班 */}
        {doctorSchedules.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">本週醫師排班</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorSchedules.map((schedule, index) => (
                <div key={index} className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {schedule.employee_name}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(schedule.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
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
            <span className="w-1 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-white">常用功能</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className={`bg-gradient-to-br ${item.gradient} backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50
                    flex flex-col items-center justify-center gap-4 min-h-[180px]
                    hover:border-slate-600/50 hover:shadow-2xl hover:shadow-violet-500/10
                    transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300 border border-slate-700/50`}>
                    <Icon className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-white mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 即將推出 */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              即將推出
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                開發中
              </Badge>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {upcomingFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => toast.info('功能開發中，敬請期待！', {
                    description: `${item.label} 功能即將上線`,
                    duration: 3000
                  })}
                  className={`bg-gradient-to-br ${item.gradient} backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50
                    flex flex-col items-center justify-center gap-4 min-h-[180px]
                    hover:border-slate-700/50 hover:shadow-xl hover:shadow-amber-500/5
                    transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}
                >
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      開發中
                    </Badge>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-slate-800/30 flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300 border border-slate-700/30`}>
                    <Icon className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-300 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.description}
                    </p>
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
