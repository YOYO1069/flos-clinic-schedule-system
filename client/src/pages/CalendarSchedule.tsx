import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Home,
  Plus,
  X,
  Upload,
  Download
} from "lucide-react";

type ShiftType = "work" | "off";

interface Schedule {
  id?: number;
  date: string;
  employee_id: string;
  employee_name: string;
  shift_type: ShiftType;
}

interface LeaveRequest {
  id: number;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  role: string;
}

export default function CalendarSchedule() {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 編輯對話框狀態
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<ShiftType>("work");

  // 批量補做對話框
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchData, setBatchData] = useState("");

  // 班別配置
  const shiftNames: Record<ShiftType, string> = {
    work: "上班",
    off: "休假"
  };

  const shiftColors: Record<ShiftType, string> = {
    work: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-900 border-blue-300",
    off: "bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-800 border-gray-400"
  };

  // 獲取當月第一天和最後一天
  const getMonthBounds = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // 獲取月曆顯示的所有日期
  const getCalendarDates = (): Date[] => {
    try {
      const { firstDay, lastDay } = getMonthBounds(currentDate);
      const dates: Date[] = [];
      
      // 補齊月初
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek; i > 0; i--) {
        const date = new Date(firstDay);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }
      
      // 當月所有日期
      for (let d = 1; d <= lastDay.getDate(); d++) {
        dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
      }
      
      // 補齊月末
      const lastDayOfWeek = lastDay.getDay();
      for (let i = 1; i < 7 - lastDayOfWeek; i++) {
        const date = new Date(lastDay);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
      
      return dates;
    } catch (error) {
      console.error("獲取日期錯誤:", error);
      return [];
    }
  };

  // 載入員工資料
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("role", "staff")
        .order("name");
      
      if (error) {
        console.error("載入員工失敗:", error);
        return;
      }
      
      setEmployees(data || []);
    } catch (err) {
      console.error("載入員工錯誤:", err);
    }
  };

  // 載入排班資料
  const loadSchedules = async () => {
    try {
      const { firstDay, lastDay } = getMonthBounds(currentDate);
      
      const { data, error } = await supabase
        .from("staff_schedules")
        .select("*")
        .gte("date", firstDay.toISOString().split("T")[0])
        .lte("date", lastDay.toISOString().split("T")[0]);
      
      if (error) {
        console.error("載入排班失敗:", error);
        return;
      }
      
      setSchedules(data || []);
    } catch (err) {
      console.error("載入排班錯誤:", err);
    }
  };

  // 載入請假資料
  const loadLeaveRequests = async () => {
    try {
      const { firstDay, lastDay } = getMonthBounds(currentDate);
      
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("status", "approved")
        .gte("start_date", firstDay.toISOString().split("T")[0])
        .lte("end_date", lastDay.toISOString().split("T")[0]);
      
      if (error) {
        console.error("載入請假資料失敗:", error);
        return;
      }
      
      setLeaveRequests(data || []);
    } catch (err) {
      console.error("載入請假錯誤:", err);
    }
  };

  // 初始化載入
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadEmployees(),
          loadSchedules(),
          loadLeaveRequests()
        ]);
      } catch (error) {
        console.error("初始化失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [currentDate]);

  // 月份切換
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 判斷是否為當月日期
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 判斷是否為今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 獲取指定日期的排班
  const getSchedulesForDate = (date: Date | null): Schedule[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return schedules.filter(s => s.date === dateStr);
  };

  // 獲取指定日期的請假
  const getLeaveForDate = (date: Date | null): LeaveRequest[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return leaveRequests.filter(lr => {
      return dateStr >= lr.start_date && dateStr <= lr.end_date;
    });
  };

  // 新增排班
  const handleAddSchedule = (date: Date) => {
    setSelectedDate(date);
    setSelectedEmployee("");
    setSelectedShift("work");
    setShowEditDialog(true);
  };

  // 儲存排班
  const handleSaveSchedule = async () => {
    if (!selectedDate || !selectedEmployee) {
      toast.error("請選擇員工");
      return;
    }

    try {
      const employee = employees.find(e => e.employee_id === selectedEmployee);
      if (!employee) {
        toast.error("找不到員工資料");
        return;
      }

      const dateStr = selectedDate.toISOString().split("T")[0];

      // 檢查衝突
      const existing = schedules.find(
        s => s.date === dateStr && s.employee_id === selectedEmployee
      );

      if (existing) {
        toast.error("該員工當天已有排班");
        return;
      }

      const { error } = await supabase.from("staff_schedules").insert({
        date: dateStr,
        employee_id: employee.employee_id,
        employee_name: employee.name,
        shift_type: selectedShift
      });

      if (error) {
        console.error("新增排班失敗:", error);
        toast.error("新增排班失敗");
        return;
      }

      toast.success("排班新增成功");
      setShowEditDialog(false);
      loadSchedules();
    } catch (err) {
      console.error("新增排班錯誤:", err);
      toast.error("新增排班時發生錯誤");
    }
  };

  // 刪除排班
  const handleDeleteSchedule = async (id: number) => {
    try {
      const { error } = await supabase
        .from("staff_schedules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("刪除排班失敗:", error);
        toast.error("刪除排班失敗");
        return;
      }

      toast.success("排班已刪除");
      loadSchedules();
    } catch (err) {
      console.error("刪除排班錯誤:", err);
      toast.error("刪除排班時發生錯誤");
    }
  };

  // 批量新增
  const handleBatchImport = async () => {
    try {
      const lines = batchData.trim().split("\n");
      const newSchedules: any[] = [];

      for (const line of lines) {
        const [date, employeeId, employeeName, shiftType] = line.split(",").map(s => s.trim());
        if (date && employeeId && employeeName && shiftType) {
          newSchedules.push({
            date,
            employee_id: employeeId,
            employee_name: employeeName,
            shift_type: shiftType as ShiftType
          });
        }
      }

      if (newSchedules.length === 0) {
        toast.error("沒有有效的資料");
        return;
      }

      const { error } = await supabase.from("staff_schedules").insert(newSchedules);

      if (error) {
        console.error("批量新增失敗:", error);
        toast.error("批量新增失敗");
        return;
      }

      toast.success(`成功新增 ${newSchedules.length} 筆排班`);
      setShowBatchDialog(false);
      setBatchData("");
      loadSchedules();
    } catch (err) {
      console.error("批量新增錯誤:", err);
      toast.error("批量新增時發生錯誤");
    }
  };

  // 匯出排班資料
  const handleExport = () => {
    if (schedules.length === 0) {
      toast.error("沒有排班資料可匯出");
      return;
    }

    const csv = schedules.map(s => 
      `${s.date},${s.employee_id},${s.employee_name},${s.shift_type}`
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `排班表_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("匯出成功");
  };

  const calendarDates = getCalendarDates();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300 text-lg font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              員工排班月曆
            </h1>
            <p className="text-cyan-300 mt-2 text-lg">
              {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin')}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
            >
              <Home className="w-4 h-4 mr-2" />
              返回主控台
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowBatchDialog(true)}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              批量補做
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
            >
              <Download className="w-4 h-4 mr-2" />
              匯出
            </Button>
            <Button 
              variant="outline" 
              onClick={goToToday}
              className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              今天
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-700/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 月曆表格 */}
        <Card className="overflow-hidden bg-slate-800/30 backdrop-blur-sm border-cyan-500/20">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-slate-800/80 to-blue-900/80 border-b border-cyan-500/20">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center font-bold text-base ${
                  index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-cyan-300"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7">
            {calendarDates.length > 0 ? (
              calendarDates.map((date, index) => {
                const daySchedules = getSchedulesForDate(date);
                const dayLeaves = getLeaveForDate(date);
                const isOtherMonth = !isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[140px] border-r border-b border-cyan-500/10 p-3 relative group cursor-pointer transition-all duration-200 ${
                      isOtherMonth ? "bg-slate-900/30" : "bg-slate-800/20 hover:bg-slate-700/30"
                    } ${isTodayDate ? "ring-2 ring-cyan-400 ring-inset" : ""}`}
                    onClick={() => !isOtherMonth && handleAddSchedule(date)}
                  >
                    {/* 日期數字 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-sm font-bold ${
                        isOtherMonth ? "text-slate-600" : 
                        index % 7 === 0 ? "text-red-400" : 
                        index % 7 === 6 ? "text-blue-400" : 
                        "text-cyan-300"
                      }`}>
                        {date.getDate()}
                      </div>
                      {!isOtherMonth && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 hover:bg-cyan-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSchedule(date);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* 排班資訊 */}
                    <div className="space-y-1">
                      {daySchedules.map((schedule, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-2 py-1.5 rounded-lg border backdrop-blur-sm relative group/item transition-all ${
                            shiftColors[schedule.shift_type]
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">
                                {schedule.employee_name}
                              </div>
                              <div className="text-[10px] opacity-80">
                                {shiftNames[schedule.shift_type]}
                              </div>
                            </div>
                            <button
                              className="opacity-0 group-hover/item:opacity-100 ml-1 hover:bg-red-500/20 rounded p-0.5 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                schedule.id && handleDeleteSchedule(schedule.id);
                              }}
                            >
                              <X className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* 請假資訊 */}
                      {dayLeaves.map((leave, idx) => (
                        <div
                          key={`leave-${idx}`}
                          className="text-xs px-2 py-1.5 rounded-lg border bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="font-semibold truncate">
                            {leave.employee_name}
                          </div>
                          <div className="text-[10px] opacity-80">
                            {leave.leave_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-7 p-12 text-center text-slate-500">
                無法載入月曆資料
              </div>
            )}
          </div>
        </Card>

        {/* 圖例 */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500/40 to-cyan-500/40 border border-blue-400/50"></div>
            <span className="text-cyan-300">上班</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-500/40 to-gray-600/40 border border-gray-500/50"></div>
            <span className="text-cyan-300">休假</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500/40 to-red-500/40 border border-orange-500/50"></div>
            <span className="text-cyan-300">請假</span>
          </div>
        </div>
      </div>

      {/* 新增/編輯排班對話框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-cyan-500/30 text-cyan-100">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">新增排班</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-cyan-300 mb-2 block">日期</label>
              <div className="text-lg font-semibold text-white">
                {selectedDate?.toLocaleDateString('zh-TW')}
              </div>
            </div>
            <div>
              <label className="text-sm text-cyan-300 mb-2 block">員工</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-white">
                  <SelectValue placeholder="選擇員工" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.employee_id} className="text-white hover:bg-slate-700">
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-cyan-300 mb-2 block">班別</label>
              <Select value={selectedShift} onValueChange={(v) => setSelectedShift(v as ShiftType)}>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="work" className="text-white hover:bg-slate-700">上班</SelectItem>
                  <SelectItem value="off" className="text-white hover:bg-slate-700">休假</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveSchedule} 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
              >
                儲存
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1 bg-slate-700/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-600/50"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 批量補做對話框 */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="bg-slate-800 border-cyan-500/30 text-cyan-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">批量補做排班</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-cyan-300 mb-2 block">CSV 格式資料</label>
              <Textarea
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                placeholder="2025-11-24,STAFF-003,劉哲軒,work&#10;2025-11-25,STAFF-004,李文華,work&#10;2025-11-26,STAFF-005,張耿齊,off"
                rows={10}
                className="font-mono text-sm bg-slate-700/50 border-cyan-500/30 text-white"
              />
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>格式: 日期,員工編號,員工姓名,班別</p>
              <p>班別: work (上班) 或 off (休假)</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleBatchImport}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
              >
                匯入
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBatchDialog(false)}
                className="flex-1 bg-slate-700/50 border-cyan-500/30 text-cyan-300 hover:bg-slate-600/50"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
