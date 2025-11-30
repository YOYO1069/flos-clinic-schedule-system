import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { 
  Clock, 
  Users, 
  FileText, 
  Monitor, 
  Calendar, 
  DollarSign, 
  Settings,
  CheckSquare,
  LogOut,
  UserCog
} from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { permissions } = usePermissions(user?.role as UserRole);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLocation('/login');
  };

  // 功能卡片資料
  const featureCards = [
    // 所有員工都可以使用的功能
    {
      id: 'my-attendance',
      title: '我的打卡',
      description: '查看個人打卡記錄',
      icon: Clock,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => setLocation('/attendance'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'attendance-history',
      title: '打卡記錄',
      description: '查詢歷史打卡明細',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      onClick: () => setLocation('/attendance-history'),
      show: permissions.canAccessAttendance,
    },
    {
      id: 'leave-calendar',
      title: '休假月曆',
      description: '查看員工休假狀況',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/leave-calendar'),
      show: permissions.canAccessLeaveCalendar,
    },
    {
      id: 'leave-request',
      title: '請假管理',
      description: '提交請假申請',
      icon: CheckSquare,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/leave'),
      show: permissions.canAccessLeaveManagement,
    },
    // 護理師和美容師專用
    {
      id: 'operation-fee',
      title: '操作費計算',
      description: '計算個人操作費用',
      icon: DollarSign,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => setLocation('/operation-fee'),
      show: user?.position === '美容師' || user?.position === '護理師',
    },
    // 主管以上權限
    {
      id: 'employee-management',
      title: '員工管理',
      description: '新增、編輯、管理員工資料',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => setLocation('/employee-management'),
      show: permissions.canManageStaffSchedule,
    },
    {
      id: 'leave-approval',
      title: '請假審核',
      description: '審核員工請假申請',
      icon: CheckSquare,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => setLocation('/approval'),
      show: permissions.canAccessLeaveApproval,
    },
    {
      id: 'dashboard',
      title: '電子看板',
      description: '即時顯示今日打卡狀況',
      icon: Monitor,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => setLocation('/attendance-dashboard'),
      show: permissions.canAccessLeaveApproval,
    },
    // 管理員專用
    {
      id: 'attendance-settings',
      title: '打卡設定',
      description: '管理打卡系統設定',
      icon: Settings,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      onClick: () => setLocation('/attendance-settings'),
      show: user?.role === 'admin' || user?.role === 'super_admin',
    },
  ];

  const visibleCards = featureCards.filter(card => card.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 頂部導航 */}
      <div className="bg-white/80 backdrop-blur shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🏥 {APP_TITLE}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.name} ({user?.position || '員工'})
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              登出
            </Button>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎訊息 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            歡迎回來，{user?.name}！
          </h2>
          <p className="text-gray-600">
            請選擇您需要的功能
          </p>
        </div>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className={`${card.bgColor} border-2 hover:shadow-xl transition-all cursor-pointer group`}
                onClick={card.onClick}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full bg-gradient-to-r ${card.color} text-white group-hover:scale-105 transition-transform`}
                  >
                    進入功能
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 使用說明 */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                使用說明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <strong>我的打卡：</strong>點擊「電子看板」即時查看今日打卡狀況，或在「打卡記錄」查看歷史明細
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <strong>休假管理：</strong>在「休假月曆」查看所有員工休假狀況，在「請假管理」提交請假申請
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <strong>操作費計算：</strong>護理師和美容師可使用此功能計算個人操作費用
                </div>
              </div>
              {(user?.role === 'supervisor' || user?.role === 'senior_supervisor' || user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <strong>主管功能：</strong>您可以管理員工資料、審核請假申請，並查看電子看板
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 頁尾 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>FLOS 曜診所 | 診所管理系統</p>
          <p className="mt-1">{new Date().toLocaleDateString('zh-TW')}</p>
        </div>
      </div>
    </div>
  );
}
