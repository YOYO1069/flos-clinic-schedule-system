import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DoctorShift } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShiftDialog } from './ShiftDialog';
import { useSchedule } from '@/contexts/ScheduleContext';
import { formatDate } from '@/lib/calendar-utils';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  shifts: DoctorShift[];
}

export function CalendarDay({ date, isCurrentMonth, isToday, shifts }: CalendarDayProps) {
  const { addShift, updateShift, deleteShift } = useSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<DoctorShift | undefined>();
  const dateStr = formatDate(date);

  const handleAddShift = () => {
    if (shifts.length >= 3) {
      return; // Already at max
    }
    setEditingShift(undefined);
    setDialogOpen(true);
  };

  const handleEditShift = (shift: DoctorShift) => {
    setEditingShift(shift);
    setDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    await deleteShift(dateStr, shiftId);
  };

  const handleSaveShift = async (shift: Omit<DoctorShift, 'id'>) => {
    if (editingShift) {
      await updateShift(dateStr, editingShift.id, shift);
    } else {
      await addShift(dateStr, shift);
    }
  };

  return (
    <>
      <div
        className={cn(
          'min-h-24 md:min-h-32 border border-border bg-card p-1.5 md:p-2 transition-colors',
          !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
          isToday && 'ring-2 ring-primary'
        )}
      >
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <span
            className={cn(
              'text-xs md:text-sm font-medium',
              isToday && 'text-primary font-bold'
            )}
          >
            {date.getDate()}
          </span>
          {isCurrentMonth && shifts.length < 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 md:h-6 md:w-6"
              onClick={handleAddShift}
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          {shifts.map((shift) => (
            <DropdownMenu key={shift.id}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'text-[10px] md:text-xs p-1 md:p-1.5 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors w-full text-left',
                    'border border-primary/20 min-h-[2.5rem] md:min-h-0'
                  )}
                >
                  <div className="font-medium text-foreground truncate leading-tight">
                    {shift.doctorName}
                  </div>
                  <div className="text-muted-foreground leading-tight mt-0.5">
                    {shift.startTime} - {shift.endTime}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleEditShift(shift)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  編輯
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteShift(shift.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>

      <ShiftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveShift}
        initialData={editingShift}
        date={dateStr}
      />
    </>
  );
}
