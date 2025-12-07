import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Users, Clock, Fingerprint, Monitor, ClipboardList } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";

export default function ScheduleHome() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 頭部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            FLOS 曜診所
          </h1>
          <p className="text-slate-600 font-medium">排班管理系統</p>
          <button
            onClick={() => window.location.href = 'https://classy-biscotti-42a418.netlify.app/'}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← 返回主頁
          </button>
        </div>

        {/* 圖文選單 - 2x3 網格 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setLocation(item.path)}
                  className={`
                    group relative aspect-square p-6 
                    flex flex-col items-center justify-center gap-4
                    border-r border-b border-slate-200
                    hover:bg-slate-50 transition-all duration-300
                    ${index % 3 === 2 ? 'md:border-r-0' : ''}
                    ${index % 2 === 1 ? 'border-r-0 md:border-r' : ''}
                    ${index >= menuItems.length - (menuItems.length % 3 || 3) ? 'border-b-0' : ''}
                  `}
                >
                  {/* 圖標容器 */}
                  <div className={`
                    w-20 h-20 rounded-2xl 
                    bg-gradient-to-br ${item.color}
                    flex items-center justify-center
                    transform group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                    shadow-lg group-hover:shadow-xl
                  `}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* 文字標籤 */}
                  <span className="text-slate-700 font-bold text-lg group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </span>

                  {/* 懸停效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 text-center text-sm text-slate-500">
          {user && (
            <p>歡迎回來，<span className="font-semibold text-slate-700">{user.name}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
