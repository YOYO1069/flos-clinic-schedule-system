import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// 班別類型
type ShiftType = "morning" | "afternoon" | "evening" | "off" | "leave";

// 排班資料結構
interface ScheduleEntry {
  id?: number;
  date: string;
  employee_id: string;
  employee_name: string;
  shift_type: ShiftType;
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

// 班別顏色配置
const shiftColors: Record<ShiftType, string> = {
  morning: "bg-blue-100 text-blue-800 border-blue-300",
  afternoon: "bg-green-100 text-green-800 border-green-300",
  evening: "bg-purple-100 text-purple-800 border-purple-300",
  off: "bg-gray-100 text-gray-600 border-gray-300",
  leave: "bg-red-100 text-red-800 border-red-300",
};

// 班別名稱
const shiftNames: Record<ShiftType, string> = {
  morning: "早班",
  afternoon: "中班",
  evening: "晚班",
  off: "休假",
  leave: "請假",
};

export default function CalendarSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
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
  };

  // 載入排班資料
  const loadSchedules = async () => {
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
  };

  // 載入請假資料
  const loadLeaveRequests = async () => {
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

  // 獲取指定日期的排班
  const getSchedulesForDate = (date: Date): ScheduleEntry[] => {
    const dateStr = date.toISOString().split("T")[0];
    return schedules.filter(s => s.date === dateStr);
  };

  // 獲取指定日期的請假
  const getLeaveForDate = (date: Date): LeaveRequest[] => {
    const dateStr = date.toISOString().split("T")[0];
    return leaveRequests.filter(lr => {
      return dateStr >= lr.start_date && dateStr <= lr.end_date;
    });
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
          </div>
          
          <div className="flex items-center gap-3">
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
                  className={`min-h-[120px] border-r border-b p-2 ${
                    isOtherMonth ? "bg-gray-50" : "bg-white"
                  } ${isTodayDate ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                >
                  {/* 日期數字 */}
                  <div className={`text-sm font-semibold mb-2 ${
                    isOtherMonth ? "text-gray-400" : 
                    index % 7 === 0 ? "text-red-600" : 
                    index % 7 === 6 ? "text-blue-600" : 
                    "text-gray-700"
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* 排班資訊 */}
                  <div className="space-y-1">
                    {daySchedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded border ${
                          shiftColors[schedule.shift_type]
                        }`}
                      >
                        <div className="font-medium truncate">
                          {schedule.employee_name}
                        </div>
                        <div className="text-[10px]">
                          {shiftNames[schedule.shift_type]}
                        </div>
                      </div>
                    ))}

                    {/* 請假資訊 */}
                    {dayLeaves.map((leave, idx) => (
                      <div
                        key={`leave-${idx}`}
                        className="text-xs px-2 py-1 rounded border bg-orange-100 text-orange-800 border-orange-300"
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
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
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
      </div>
    </div>
  );
}
