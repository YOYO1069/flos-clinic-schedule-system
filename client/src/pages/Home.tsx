import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, FileText, Calendar, Users, Shield, Settings, 
  DollarSign, TrendingUp, Award, MessageSquare, BookOpen, Gift, Heart,
  LogOut, User, UserCog, Key, Stethoscope, FileHeart, PenTool, ExternalLink,
  Activity, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { doctorScheduleClient, SCHEDULE_TABLE, supabase } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  
  // 修改密碼對話框狀態
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("請填寫所有欄位");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密碼長度至少需要 6 個字元");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("兩次輸入的新密碼不一致");
      return;
    }

    setIsChangingPassword(true);

    try {
      // 驗證舊密碼
      const { data: userData, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', currentUser.employee_id)
        .single();

      if (fetchError) throw fetchError;

      // 驗證舊密碼
      const isPasswordValid = await verifyPassword(oldPassword, userData.password);
      if (!isPasswordValid) {
        toast.error("舊密碼錯誤");
        setIsChangingPassword(false);
        return;
      }

      // 加密新密碼
      const hashedPassword = await hashPassword(newPassword);

      // 更新密碼
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          password: hashedPassword,
          password_changed: true
        })
        .eq('employee_id', currentUser.employee_id);

      if (updateError) throw updateError;

      toast.success("密碼修改成功！");
      setChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('修改密碼失敗:', error);
      toast.error("修改密碼失敗，請重試");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const loadDoctorSchedules = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await doctorScheduleClient
        .from(SCHEDULE_TABLE)
        .select('*')
        .gte('date', today)
        .lte('date', weekLater)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // 轉換資料格式
      const formattedData = (data || []).map(schedule => ({
        employee_name: schedule.doctor_name,
        date: schedule.date,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      }));
      
      setDoctorSchedules(formattedData);
    } catch (error: any) {
      console.error('載入醫師排班失敗:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('已登出');
    setLocation('/login');
  };

  // warm-pika 網站 URL
  const WARM_PIKA_URL = 'https://warm-pika-efe152.netlify.app';

  // 所有功能定義
  const allFeatures = [
    { icon: Clock, label: '我的打卡', description: '查看打卡記錄', path: `${WARM_PIKA_URL}/attendance`, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
    { icon: FileText, label: '請假管理', description: '申請與查詢假單', path: `${WARM_PIKA_URL}/leave-management`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
    { icon: FileText, label: '請假審核', description: '查看員工請假申請', path: `${WARM_PIKA_URL}/approval`, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', roles: ['admin', 'senior_supervisor', 'supervisor'], isExternal: true },
    { icon: Calendar, label: '休假日曆', description: '員工休假系統', path: `${WARM_PIKA_URL}/leave-calendar`, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
    { icon: FileText, label: '打卡記錄', description: '查看全員打卡記錄', path: `${WARM_PIKA_URL}/attendance-management`, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', roles: ['admin', 'senior_supervisor', 'supervisor'], isExternal: true },
    { icon: Users, label: '員工管理', description: '管理員工資料', path: `${WARM_PIKA_URL}/staff-management`, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', roles: ['admin'], isExternal: true },
    { icon: Shield, label: '電子看板', description: '即時監控員工狀態', path: `${WARM_PIKA_URL}/attendance-dashboard`, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200', roles: ['admin', 'senior_supervisor', 'supervisor'], isExternal: true },
    { icon: Settings, label: '打卡設定', description: '設定打卡規則', path: `${WARM_PIKA_URL}/attendance-settings`, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', roles: ['admin'], isExternal: true },
    { icon: UserCog, label: '權限分配', description: '管理員工權限', path: `${WARM_PIKA_URL}/permission-management`, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', roles: ['admin'], isExternal: true },
    { icon: Key, label: '帳號管理', description: '重設員工密碼', path: `${WARM_PIKA_URL}/account-management`, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', roles: ['admin'], isExternal: true },
  ];

  // 職能專區功能
  const professionalFeatures = [
    { icon: Stethoscope, label: '醫生專區', description: '病例操作與醫療工具', path: `${WARM_PIKA_URL}/doctor-portal`, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
    { icon: Activity, label: '護理師守則', description: '護理標準作業流程', path: `${WARM_PIKA_URL}/nurse-sop`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
    { icon: Sparkles, label: '美容師守則', description: '美容操作規範指南', path: `${WARM_PIKA_URL}/beautician-sop`, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', roles: ['admin', 'senior_supervisor', 'supervisor', 'staff'], isExternal: true },
  ];

  // 未來功能
  const upcomingFeatures = [
    { icon: FileHeart, label: '病例操作', description: '醫生病例管理系統', color: 'text-teal-600', bgColor: 'bg-teal-50', url: 'https://deft-heliotrope-9157ff.netlify.app/', isExternal: true },
    { icon: BookOpen, label: '操作守則', description: '標準作業流程查詢', color: 'text-blue-600', bgColor: 'bg-blue-50', isExternal: false },
    { icon: PenTool, label: '電子病歷繪圖', description: '病歷圖示繪製工具', color: 'text-purple-600', bgColor: 'bg-purple-50', isExternal: false },
    { icon: Users, label: '回頭客系統', description: '客戶關係管理與回訪追蹤', color: 'text-indigo-600', bgColor: 'bg-indigo-50', isExternal: false },
    { icon: TrendingUp, label: '行銷數據統計', description: '客戶流量與轉換率分析', color: 'text-cyan-600', bgColor: 'bg-cyan-50', isExternal: false },
    { icon: MessageSquare, label: '客戶回饋系統', description: '收集與分析客戶滿意度', color: 'text-violet-600', bgColor: 'bg-violet-50', isExternal: false },
    { icon: Gift, label: '會員紅利管理', description: '會員等級與優惠方案', color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50', isExternal: false },
    { icon: DollarSign, label: '薪資查詢', description: '查看薪資明細與歷史記錄', color: 'text-green-500', bgColor: 'bg-green-50', isExternal: false },
    { icon: TrendingUp, label: '績效考核', description: '查看個人績效與目標達成', color: 'text-blue-500', bgColor: 'bg-blue-50', isExternal: false },
    { icon: Award, label: '獎懲記錄', description: '查看獎勵與懲處記錄', color: 'text-amber-500', bgColor: 'bg-amber-50', isExternal: false },
    { icon: MessageSquare, label: '內部公告', description: '查看公司最新消息與公告', color: 'text-purple-500', bgColor: 'bg-purple-50', isExternal: false },
    { icon: Gift, label: '福利專區', description: '員工福利與優惠資訊', color: 'text-rose-500', bgColor: 'bg-rose-50', isExternal: false },
    { icon: Heart, label: '健康管理', description: '健康檢查與體檢記錄', color: 'text-red-500', bgColor: 'bg-red-50', isExternal: false },
  ];

  // 根據角色篩選功能
  const features = allFeatures.filter(feature => 
    feature.roles.includes(currentUser?.role || 'staff')
  );

  // 根據角色篩選職能專區功能
  const professionalPortalFeatures = professionalFeatures.filter(feature => 
    feature.roles.includes(currentUser?.role || 'staff')
  );

  return (
    <div className="min-h-screen bg-gray-100" style={{
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(200,200,200,0.2) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(220,220,220,0.25) 0%, transparent 50%),
        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),
        repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px, 20px 20px'
    }}>
      {/* 頂部導航 - 典雅設計 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(8px)'
      }}>
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center" style={{
                  boxShadow: '0 4px 12px rgba(168,85,247,0.25)'
                }}>
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                  FLOS 曜診所
                </h1>
                <p className="text-xs text-gray-500 font-medium">Employee Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-lg border border-gray-200" style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
              }}>
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{currentUser?.name}</div>
                  <div className="text-xs text-gray-500">{currentUser?.employee_id}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-gray-700"
                style={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* 歡迎區 - 典雅設計 */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200" style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{
                letterSpacing: '-0.02em'
              }}>
                今天也要加油喔！
              </h2>
              <p className="text-gray-500 font-medium">歡迎回來，{currentUser?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Key className="w-4 h-4" />
                    修改密碼
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>修改密碼</DialogTitle>
                    <DialogDescription>
                      請輸入您的舊密碼和新密碼
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">舊密碼</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="請輸入舊密碼"
                        disabled={isChangingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密碼</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="請輸入新密碼（至少 6 個字元）"
                        disabled={isChangingPassword}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">確認新密碼</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="請再次輸入新密碼"
                        disabled={isChangingPassword}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setChangePasswordOpen(false)}
                      disabled={isChangingPassword}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "處理中..." : "確認修改"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">當前時間</div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 本週醫師排班 - 按日期分組 */}
        {doctorSchedules.length > 0 && (() => {
          // 按日期分組
          const schedulesByDate = doctorSchedules.reduce((acc: any, schedule: any) => {
            const date = schedule.date;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(schedule);
            return acc;
          }, {});
          
          return (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900">本週醫師排班</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {Object.entries(schedulesByDate).map(([date, schedules]: [string, any]) => (
                  <div key={date} className="bg-white rounded-lg p-3 border border-gray-200" style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      <span className="text-sm font-bold text-gray-900">
                        {new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {schedules.map((schedule: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-purple-600 truncate flex-1">{schedule.employee_name}</span>
                          <span className="text-gray-500 ml-2 flex-shrink-0">
                            {schedule.start_time.substring(0, 5)}-{schedule.end_time.substring(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 職能專區 - 根據角色顯示 */}
        {professionalPortalFeatures.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">職能專區</h2>
              <Badge variant="outline" className="border-indigo-400 text-indigo-700 text-xs font-bold bg-indigo-50 px-2.5 py-0.5">
                專業資源
              </Badge>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {professionalPortalFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (item.isExternal) {
                        window.location.href = item.path;
                      } else {
                        setLocation(item.path);
                      }
                    }}
                    className={`bg-white rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 group border ${item.borderColor}`}
                    style={{
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mb-2.5 border border-gray-100`} style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                      }}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-0.5 text-center w-full">{item.label}</h3>
                      <p className="text-xs text-gray-500 leading-tight text-center w-full">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 常用功能 - 密集功能格 */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">常用功能</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.isExternal) {
                      window.location.href = item.path;
                    } else {
                      setLocation(item.path);
                    }
                  }}
                  className={`bg-white rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 group border-2 ${item.borderColor}`}
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex flex-col items-center relative">
                    {item.isExternal && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-14 h-14 ${item.bgColor} rounded-xl flex items-center justify-center mb-3 border-2 ${item.borderColor || 'border-gray-200'}`} style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                    }}>
                      <Icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1 text-center w-full">{item.label}</h3>
                    <p className="text-xs text-gray-600 leading-tight text-center w-full">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 未來功能 - 密集功能格 */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-gray-300 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">未來功能</h2>
            <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-0.5">
              規劃中
            </Badge>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {upcomingFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.isExternal && item.url) {
                      window.open(item.url, '_blank');
                    } else {
                      toast.info('功能開發中，敬請期待！', {
                        description: `${item.label} 功能即將上線`,
                        duration: 3000
                      });
                    }
                  }}
                  className="bg-gray-50 rounded-xl p-4 transition-all duration-200 group border border-gray-200 cursor-pointer opacity-60 hover:opacity-80"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mb-2.5 border border-gray-100 opacity-70`} style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                    }}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-600 mb-0.5 text-center w-full">{item.label}</h3>
                    <p className="text-xs text-gray-400 leading-tight text-center w-full">{item.description}</p>
                    <div className="mt-2 text-center w-full">
                      <span className="text-xs text-amber-600 font-bold">開發中</span>
                    </div>
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
