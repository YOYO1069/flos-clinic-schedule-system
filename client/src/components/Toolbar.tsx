import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet, Trash2, Image } from 'lucide-react';
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
  onExportImage?: () => void;
}

export function Toolbar({ onExportImage }: ToolbarProps) {
  const { clearAllSchedules } = useSchedule();

  return (
    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-4">
      {onExportImage && (
        <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={onExportImage}>
          <Image className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">匯出 </span>圖片
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive text-xs md:text-sm">
            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">清空所有</span>排班
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
