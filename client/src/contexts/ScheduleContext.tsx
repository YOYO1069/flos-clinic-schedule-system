import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DaySchedule, DoctorShift, MonthSchedule } from '@/types/schedule';
import { supabase, DoctorSchedule, SCHEDULE_TABLE } from '@/lib/supabase';
import { toast } from 'sonner';

interface ScheduleContextType {
  currentYear: number;
  currentMonth: number;
  schedules: Record<string, DaySchedule>;
  setMonth: (year: number, month: number) => void;
  addShift: (date: string, shift: Omit<DoctorShift, 'id'>) => Promise<void>;
  updateShift: (date: string, shiftId: string, shift: Omit<DoctorShift, 'id'>) => Promise<void>;
  deleteShift: (date: string, shiftId: string) => Promise<void>;
  getShiftsForDate: (date: string) => DoctorShift[];
  clearAllSchedules: () => Promise<void>;
  importSchedules: (data: MonthSchedule) => void;
  exportSchedules: () => MonthSchedule;
  isLoading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 從 Supabase 載入資料
  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(SCHEDULE_TABLE)
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // 轉換 Supabase 資料為本地格式
      const schedulesMap: Record<string, DaySchedule> = {};
      
      console.log('[ScheduleContext] Loaded data from Supabase:', data);
      
      data?.forEach((schedule: DoctorSchedule) => {
        const dateStr = schedule.date;
        if (!schedulesMap[dateStr]) {
          schedulesMap[dateStr] = { date: dateStr, shifts: [] };
        }
        schedulesMap[dateStr].shifts.push({
          id: schedule.id,
          doctorName: schedule.doctor_name,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
        });
      });

      console.log('[ScheduleContext] Converted schedules:', schedulesMap);
      setSchedules(schedulesMap);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('載入排班資料失敗,請檢查網路連線');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    loadSchedules();
  }, []);

  const setMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const addShift = async (date: string, shift: Omit<DoctorShift, 'id'>) => {
    const daySchedule = schedules[date] || { date, shifts: [] };
    
    // Check if already has 3 shifts
    if (daySchedule.shifts.length >= 3) {
      toast.error('每天最多只能排三位醫師');
      return;
    }

    try {
      const { data, error } = await supabase
        .from(SCHEDULE_TABLE)
        .insert({
          date: date,
          doctor_name: shift.doctorName,
          start_time: shift.startTime,
          end_time: shift.endTime,
        })
        .select()
        .single();

      if (error) throw error;

      // 更新本地狀態
      setSchedules((prev) => {
        const daySchedule = prev[date] || { date, shifts: [] };
        const newShift: DoctorShift = {
          id: data.id,
          doctorName: data.doctor_name,
          startTime: data.start_time,
          endTime: data.end_time,
        };

        return {
          ...prev,
          [date]: {
            ...daySchedule,
            shifts: [...daySchedule.shifts, newShift],
          },
        };
      });

      toast.success('排班已新增並同步至雲端');
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error('新增排班失敗,請稍後再試');
      throw error;
    }
  };

  const updateShift = async (date: string, shiftId: string, shift: Omit<DoctorShift, 'id'>) => {
    try {
      const { error } = await supabase
        .from(SCHEDULE_TABLE)
        .update({
          doctor_name: shift.doctorName,
          start_time: shift.startTime,
          end_time: shift.endTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shiftId);

      if (error) throw error;

      // 更新本地狀態
      setSchedules((prev) => {
        const daySchedule = prev[date];
        if (!daySchedule) return prev;

        return {
          ...prev,
          [date]: {
            ...daySchedule,
            shifts: daySchedule.shifts.map((s) =>
              s.id === shiftId ? { id: shiftId, ...shift } : s
            ),
          },
        };
      });

      toast.success('排班已更新並同步至雲端');
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('更新排班失敗,請稍後再試');
      throw error;
    }
  };

  const deleteShift = async (date: string, shiftId: string) => {
    try {
      const { error } = await supabase
        .from(SCHEDULE_TABLE)
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      // 更新本地狀態
      setSchedules((prev) => {
        const daySchedule = prev[date];
        if (!daySchedule) return prev;

        const newShifts = daySchedule.shifts.filter((s) => s.id !== shiftId);

        if (newShifts.length === 0) {
          const { [date]: _, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [date]: {
            ...daySchedule,
            shifts: newShifts,
          },
        };
      });

      toast.success('排班已刪除並同步至雲端');
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('刪除排班失敗,請稍後再試');
      throw error;
    }
  };

  const getShiftsForDate = (date: string): DoctorShift[] => {
    return schedules[date]?.shifts || [];
  };

  const clearAllSchedules = async () => {
    try {
      const { error } = await supabase
        .from(SCHEDULE_TABLE)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 刪除所有記錄

      if (error) throw error;

      setSchedules({});
      toast.success('所有排班已清空並同步至雲端');
    } catch (error) {
      console.error('Error clearing schedules:', error);
      toast.error('清空排班失敗,請稍後再試');
      throw error;
    }
  };

  const importSchedules = (data: MonthSchedule) => {
    setCurrentYear(data.year);
    setCurrentMonth(data.month);
    setSchedules(data.schedules);
  };

  const exportSchedules = (): MonthSchedule => {
    return {
      year: currentYear,
      month: currentMonth,
      schedules,
    };
  };

  return (
    <ScheduleContext.Provider
      value={{
        currentYear,
        currentMonth,
        schedules,
        setMonth,
        addShift,
        updateShift,
        deleteShift,
        getShiftsForDate,
        clearAllSchedules,
        importSchedules,
        exportSchedules,
        isLoading,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return context;
}
