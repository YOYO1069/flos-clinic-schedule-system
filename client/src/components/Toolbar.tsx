import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSchedule } from '@/contexts/ScheduleContext';

interface ToolbarProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function Toolbar({ onExportExcel, onExportPDF }: ToolbarProps) {
  const { clearAllSchedules } = useSchedule();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onExportExcel}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        匯出 Excel
      </Button>
      <Button variant="outline" onClick={onExportPDF}>
        <FileDown className="h-4 w-4 mr-2" />
        匯出 PDF
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            清空所有排班
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認清空所有排班?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將刪除所有排班資料,且無法復原。請確認是否繼續。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={async () => await clearAllSchedules()}>
              確認清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
