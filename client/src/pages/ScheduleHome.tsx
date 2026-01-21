import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Users, Clock, Fingerprint, Monitor, ClipboardList, MapPin, Settings } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";

export default function ScheduleHome() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  
  // 判斷是否為管理者（admin 或 senior_supervisor）
  const isAdmin = user?.role === 'admin' || user?.role === 'senior_supervisor';
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const menuItems = [
    {
      icon: Fingerprint,
      label: '員工打卡',
      color: 'from-teal-500 to-cyan-600',
      path: '/attendance',
      show: true
    },
    {
      icon: Monitor,
      label: '電子看板',
      color: 'from-blue-500 to-indigo-600',
      path: '/attendance-dashboard',
      show: permissions.canAccessAttendanceDashboard
    },
    {
      icon: Calendar,
      label: '醫師排班',
      color: 'from-emerald-500 to-teal-600',
      path: '/doctor-schedule',
      show: true
    },
    {
      icon: Users,
      label: '員工排班',
      color: 'from-violet-500 to-purple-600',
      path: '/leave-calendar',
      show: permissions.canAccessLeaveCalendar
    },
    {
      icon: ClipboardList,
      label: '排班總覽',
      color: 'from-amber-500 to-orange-600',
      path: '/doctor-schedule',
      show: true
    },
    {
      icon: Clock,
      label: '打卡記錄',
      color: 'from-rose-500 to-pink-600',
      path: '/attendance',
      show: true
    }
  ].filter(item => item.show);

  // 管理者專屬功能
  const adminItems = [
    {
      icon: MapPin,
      label: '打卡地點總覽',
      color: 'from-red-500 to-rose-600',
      path: '/admin-attendance-overview',
      show: isAdmin
    },
    {
      icon: Settings,
      label: '打卡設定',
      color: 'from-gray-500 to-slate-600',
      path: '/attendance-settings',
      show: isAdmin && permissions.canAccessAttendanceSettings
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* 頭部 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-800 mb-1">
            FLOS 曜診所
          </h1>
          <p className="text-slate-600 font-medium text-sm">排班管理系統</p>
          <button
            onClick={() => setLocation('/')}
            className="mt-3 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← 返回主頁
          </button>
        </div>

        {/* 圖文選單 - 緊湊版 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
          <div className="grid grid-cols-3 md:grid-cols-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className={`
                    group relative aspect-square p-3 
                    flex flex-col items-center justify-center gap-2
                    border-r border-b border-slate-100
                    hover:bg-slate-50 transition-all duration-300
                    last:border-r-0
                  `}
                >
                  {/* 圖標容器 - 縮小版 */}
                  <div className={`
                    w-12 h-12 rounded-xl 
                    bg-gradient-to-br ${item.color}
                    flex items-center justify-center
                    transform group-hover:scale-110
                    transition-all duration-300
                    shadow-md group-hover:shadow-lg
                  `}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* 文字標籤 - 縮小版 */}
                  <span className="text-slate-700 font-semibold text-xs group-hover:text-slate-900 transition-colors text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 管理者專區 - 只有 admin 或 senior_supervisor 可見 */}
        {adminItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs">Admin Only</span>
                管理者專區
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 p-2 gap-2">
              {adminItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setLocation(item.path)}
                    className={`
                      group p-3 rounded-xl
                      flex flex-col items-center justify-center gap-2
                      hover:bg-slate-50 transition-all duration-300
                      border border-slate-100
                    `}
                  >
                    {/* 圖標容器 */}
                    <div className={`
                      w-10 h-10 rounded-lg 
                      bg-gradient-to-br ${item.color}
                      flex items-center justify-center
                      transform group-hover:scale-110
                      transition-all duration-300
                      shadow-md
                    `}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    
                    {/* 文字標籤 */}
                    <span className="text-slate-700 font-semibold text-xs group-hover:text-slate-900 transition-colors text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-4 text-center text-xs text-slate-500">
          {user && (
            <p>歡迎回來，<span className="font-semibold text-slate-700">{user.name}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
