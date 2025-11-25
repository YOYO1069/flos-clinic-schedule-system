import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Upload, Download, Home, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useLocation } from "wouter";
import LeaveApprovalDialog from "@/components/LeaveApprovalDialog";

// 班別類型
type ShiftType = "work" | "off";

// 排班資料結構
interface ScheduleEntry {
  id?: string;
  date: string;
  employee_id: string;
  employee_name: string;
  shift_type: ShiftType;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

// 請假資料結構
interface LeaveRequest {
  id: number;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

// 員工資料
interface Employee {
  id: number;
  employee_id: string;
  name: string;
  role: string;
}

// 班別顏色配置
const shiftColors: Record<ShiftType, string> = {
  work: "bg-blue-100 text-blue-800 border-blue-300",
  off: "bg-gray-100 text-gray-600 border-gray-300",
};

// 班別名稱
const shiftNames: Record<ShiftType, string> = {
  work: "上班",
  off: "休假",
};

// 班別時間(彈性,由打卡決定)
const shiftTimes: Record<ShiftType, { start: string; end: string }> = {
  work: { start: "", end: "" }, // 實際時間由打卡記錄
  off: { start: "", end: "" },
};

export default function CalendarSchedule() {
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
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

  // 請假審核對話框
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalDate, setApprovalDate] = useState<Date | null>(null);

  // 獲取當月第一天和最後一天
  const getMonthBounds = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // 獲取月曆顯示的所有日期(包含前後月份補齊)
  const getCalendarDates = () => {
    const { firstDay, lastDay } = getMonthBounds(currentDate);
    const dates: Date[] = [];
    
    // 補齊月初的日期(從週日開始)
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
    
    // 補齊月末的日期(到週六結束)
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(lastDay);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // 載入員工資料
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("載入員工失敗:", error);
        toast.error("載入員工資料失敗");
        return;
      }
      
      setEmployees(data || []);
    } catch (err) {
      console.error("載入員工錯誤:", err);
      toast.error("載入員工時發生錯誤");
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
        toast.error("載入排班資料失敗");
        return;
      }
      
      setSchedules(data || []);
    } catch (err) {
      console.error("載入排班錯誤:", err);
      toast.error("載入排班時發生錯誤");
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
        // 不顯示錯誤訊息,因為表可能還沒建立
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
      await Promise.all([
        loadEmployees(),
        loadSchedules(),
        loadLeaveRequests(),
      ]);
      setLoading(false);
    };
    init();
  }, [currentDate]);

  // 切換到上個月
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // 切換到下個月
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // 切換到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 獲取某日的排班
  const getSchedulesForDate = (date: Date): ScheduleEntry[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return schedules.filter(s => s.date === dateStr);
  };

  // 獲取某日的請假
  const getLeaveForDate = (date: Date): LeaveRequest[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return leaveRequests.filter(l => 
      l.status === "approved" && 
      l.start_date <= dateStr && 
      l.end_date >= dateStr
    );
  };

  // 檢查是否為當月
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 檢查是否為今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 打開新增排班對話框
  const handleAddSchedule = (date: Date, e: React.MouseEvent) => {
    // 如果按下 Ctrl/Cmd 鍵,打開審核對話框
    if (e.ctrlKey || e.metaKey) {
      setApprovalDate(date);
      setShowApprovalDialog(true);
      return;
    }
    
    setSelectedDate(date);
    setSelectedEmployee("");
    setSelectedShift("work");
    setShowEditDialog(true);
  };

  // 檢查排班衝突
  const checkScheduleConflict = (employeeId: string, date: string, shiftType: ShiftType): boolean => {
    if (!employeeId || !date) return false;
    const dateSchedules = schedules.filter(s => s.date === date && s.employee_id === employeeId);
    
    // 如果已有任何排班,不能重複排班
    if (dateSchedules.length > 0) {
      return true;
    }
    
    return false;
  };

  // 儲存排班
  const handleSaveSchedule = async () => {
    if (!selectedDate || !selectedEmployee) {
      toast.error("請選擇員工");
      return;
    }

    const employee = employees.find(e => e.employee_id === selectedEmployee);
    if (!employee) {
      toast.error("找不到員工資料");
      return;
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    
    // 檢查衝突
    if (checkScheduleConflict(selectedEmployee, dateStr, selectedShift)) {
      toast.error("排班衝突!該員工在此時段已有排班或休假");
      return;
    }
    
    const times = shiftTimes[selectedShift];

    try {
      const { error } = await supabase
        .from("staff_schedules")
        .insert({
          date: dateStr,
          employee_id: employee.employee_id,
          employee_name: employee.name,
          shift_type: selectedShift,
          start_time: times.start,
          end_time: times.end,
        });

      if (error) {
        console.error("新增排班失敗:", error);
        toast.error("新增排班失敗");
        return;
      }

      toast.success("排班已新增");
      setShowEditDialog(false);
      loadSchedules();
    } catch (err) {
      console.error("新增排班錯誤:", err);
      toast.error("新增排班時發生錯誤");
    }
  };

  // 刪除排班
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from("staff_schedules")
        .delete()
        .eq("id", scheduleId);

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

  // 批量補做排班
  const handleBatchImport = async () => {
    if (!batchData.trim()) {
      toast.error("請輸入排班資料");
      return;
    }

    try {
      // 解析 CSV 格式: 日期,員工編號,員工姓名,班別
      const lines = batchData.trim().split("\n");
      const schedules = [];

      for (const line of lines) {
        const [date, employeeId, employeeName, shiftType] = line.split(",").map(s => s.trim());
        
        if (!date || !employeeId || !employeeName || !shiftType) {
          continue;
        }

        const times = shiftTimes[shiftType as ShiftType] || shiftTimes.morning;
        
        schedules.push({
          date,
          employee_id: employeeId,
          employee_name: employeeName,
          shift_type: shiftType,
          start_time: times.start,
          end_time: times.end,
        });
      }

      if (schedules.length === 0) {
        toast.error("沒有有效的排班資料");
        return;
      }

      const { error } = await supabase
        .from("staff_schedules")
        .insert(schedules);

      if (error) {
        console.error("批量新增失敗:", error);
        toast.error("批量新增失敗");
        return;
      }

      toast.success(`成功新增 ${schedules.length} 筆排班`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">員工排班月曆</h1>
            <p className="text-gray-600 mt-1">
              {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
            </p>
            <p className="text-xs text-gray-500 mt-1">
              提示: 按住 Ctrl/Cmd + 點擊日期可快速審核請假
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation('/admin')}>
              <Home className="w-4 h-4 mr-2" />
              返回主控台
            </Button>
            <Button variant="outline" onClick={() => setShowBatchDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              批量補做
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              匯出
            </Button>
            <Button variant="outline" onClick={goToToday}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              今天
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 月曆表格 */}
        <Card className="overflow-hidden">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center font-semibold text-sm ${
                  index === 0 ? "text-red-600" : index === 6 ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7">
            {calendarDates.map((date, index) => {
              const daySchedules = getSchedulesForDate(date);
              const dayLeaves = getLeaveForDate(date);
              const isOtherMonth = !isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-[140px] border-r border-b p-2 relative group cursor-pointer hover:bg-gray-50 ${
                    isOtherMonth ? "bg-gray-50" : "bg-white"
                  } ${isTodayDate ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                  onClick={(e) => !isOtherMonth && handleAddSchedule(date, e)}
                >
                  {/* 日期數字與新增按鈕 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-semibold ${
                      isOtherMonth ? "text-gray-400" : 
                      index % 7 === 0 ? "text-red-600" : 
                      index % 7 === 6 ? "text-blue-600" : 
                      "text-gray-700"
                    }`}>
                      {date.getDate()}
                    </div>
                    {!isOtherMonth && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        className={`text-xs px-2 py-1 rounded border relative group/item ${
                          shiftColors[schedule.shift_type]
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {schedule.employee_name}
                            </div>
                            <div className="text-[10px]">
                              {shiftNames[schedule.shift_type] || "未知"}
                            </div>
                          </div>
                          <button
                            className="opacity-0 group-hover/item:opacity-100 ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              schedule.id && handleDeleteSchedule(schedule.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* 請假資訊 */}
                    {dayLeaves.map((leave, idx) => (
                      <div
                        key={`leave-${idx}`}
                        className="text-xs px-2 py-1 rounded border bg-orange-100 text-orange-800 border-orange-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-medium truncate">
                          {leave.employee_name}
                        </div>
                        <div className="text-[10px]">
                          {leave.leave_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 圖例 */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(shiftNames).map(([type, name]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${shiftColors[type as ShiftType]}`}></div>
                <span className="text-sm text-gray-700">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border bg-orange-100 border-orange-300"></div>
              <span className="text-sm text-gray-700">請假</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500">
            說明: 上班時間由員工打卡記錄決定,無固定班別時間限制
          </p>
        </div>
      </div>

      {/* 新增/編輯排班對話框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增排班</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>日期</Label>
              <div className="text-sm text-gray-600">
                {selectedDate?.toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>員工</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇員工" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.employee_id}>
                      {emp.name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>班別</Label>
              <Select value={selectedShift} onValueChange={(v) => setSelectedShift(v as ShiftType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(shiftNames).map(([type, name]) => (
                    <SelectItem key={type} value={type}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSchedule}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量補做對話框 */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批量補做排班</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>排班資料 (CSV 格式)</Label>
              <p className="text-sm text-gray-600">
                格式: 日期,員工編號,員工姓名,班別<br/>
                班別: work (上班), off (休假)<br/>
                範例: 2025-11-24,ADMIN-HBH012,黃柏翰,work<br/>
                說明: 上班時間由打卡記錄決定,不需設定固定時間
              </p>
              <Textarea
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                placeholder="2025-11-24,ADMIN-HBH012,黃柏翰,work&#10;2025-11-25,SUPER-LDX011,劉道玄,work&#10;2025-11-26,STAFF-LZX003,劉哲軒,off"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBatchImport}>
              匯入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 請假審核對話框 */}
      <LeaveApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        date={approvalDate}
        onApprovalComplete={() => {
          loadLeaveRequests();
          loadSchedules();
        }}
      />
    </div>
  );
}
