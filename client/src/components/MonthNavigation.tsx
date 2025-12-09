import { useSchedule } from '@/contexts/ScheduleContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '@/lib/calendar-utils';

export function MonthNavigation() {
  const { currentYear, currentMonth, setMonth } = useSchedule();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setMonth(currentYear - 1, 12);
    } else {
      setMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setMonth(currentYear + 1, 1);
    } else {
      setMonth(currentYear, currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setMonth(today.getFullYear(), today.getMonth() + 1);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={handlePrevMonth}>
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
        <h2 className="text-base md:text-2xl font-bold min-w-32 md:min-w-48 text-center">
          {currentYear} 年 {getMonthName(currentMonth)}
        </h2>
        <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={handleNextMonth}>
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={handleToday}>
        今天
      </Button>
    </div>
  );
}
