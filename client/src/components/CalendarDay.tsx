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
          'min-h-32 border border-border bg-card p-2 transition-colors',
          !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
          isToday && 'ring-2 ring-primary'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              'text-sm font-medium',
              isToday && 'text-primary font-bold'
            )}
          >
            {date.getDate()}
          </span>
          {isCurrentMonth && shifts.length < 3 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleAddShift}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          {shifts.map((shift) => (
            <DropdownMenu key={shift.id}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'text-xs p-1.5 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors w-full text-left',
                    'border border-primary/20'
                  )}
                >
                  <div className="font-medium text-foreground truncate">
                    {shift.doctorName}
                  </div>
                  <div className="text-muted-foreground">
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
