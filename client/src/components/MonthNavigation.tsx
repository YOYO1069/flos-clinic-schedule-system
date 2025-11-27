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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold min-w-48 text-center">
          {currentYear} 年 {getMonthName(currentMonth)}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" onClick={handleToday}>
        今天
      </Button>
    </div>
  );
}
