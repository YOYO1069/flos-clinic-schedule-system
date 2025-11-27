import { useSchedule } from '@/contexts/ScheduleContext';
import { getMonthDays, isSameMonth, isToday } from '@/lib/calendar-utils';
import { CalendarDay } from './CalendarDay';
import { formatDate } from '@/lib/calendar-utils';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarView() {
  const { currentYear, currentMonth, getShiftsForDate } = useSchedule();
  const days = getMonthDays(currentYear, currentMonth);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-muted-foreground border-b border-border"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const shifts = getShiftsForDate(dateStr);
          const isCurrentMonthDay = isSameMonth(date, currentYear, currentMonth);
          const isTodayDay = isToday(date);

          return (
            <CalendarDay
              key={`${dateStr}-${index}`}
              date={date}
              isCurrentMonth={isCurrentMonthDay}
              isToday={isTodayDay}
              shifts={shifts}
            />
          );
        })}
      </div>
    </div>
  );
}
