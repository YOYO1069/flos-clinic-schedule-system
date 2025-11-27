import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoctorShift } from '@/types/schedule';

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shift: Omit<DoctorShift, 'id'>) => Promise<void>;
  initialData?: DoctorShift;
  date: string;
}

export function ShiftDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  date,
}: ShiftDialogProps) {
  const [doctorName, setDoctorName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setDoctorName(initialData.doctorName);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    } else {
      setDoctorName('');
      setStartTime('');
      setEndTime('');
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!doctorName.trim() || !startTime || !endTime) {
      return;
    }

    try {
      await onSave({
        doctorName: doctorName.trim(),
        startTime,
        endTime,
      });

      // Reset form
      setDoctorName('');
      setStartTime('');
      setEndTime('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in ScheduleContext
      console.error('Failed to save shift:', error);
    }
  };

  const handleCancel = () => {
    setDoctorName('');
    setStartTime('');
    setEndTime('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? '編輯排班' : '新增排班'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">日期</Label>
            <Input id="date" value={date} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorName">醫師姓名</Label>
            <Input
              id="doctorName"
              placeholder="請輸入醫師姓名"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">結束時間</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!doctorName.trim() || !startTime || !endTime}
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
