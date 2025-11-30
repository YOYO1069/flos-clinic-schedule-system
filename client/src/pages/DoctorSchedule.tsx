import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { CalendarView } from "@/components/CalendarView";
import { MonthNavigation } from "@/components/MonthNavigation";
import { Toolbar } from "@/components/Toolbar";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import domtoimage from 'dom-to-image-more';
import { toast } from "sonner";

export default function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setLocation] = useLocation();
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!calendarRef.current) {
      toast.error('找不到月曆元素');
      return;
    }
    
    try {
      toast.info('正在生成圖片...');
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const filename = `醫師排班表_${year}年${month}月.png`;
      
      // 使用 dom-to-image-more 生成圖片
      const blob = await domtoimage.toBlob(calendarRef.current, {
        quality: 1,
        bgcolor: '#ffffff',
        scale: 2,
      });
      
      // 下載圖片
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('圖片已下載');
    } catch (error) {
      console.error('匯出圖片失敗:', error);
      toast.error(`匯出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  return (
    <ScheduleProvider>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4 md:mb-8">
              <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                  返回首頁
                </Button>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-teal-900 mb-1 md:mb-2">
                醫生排班表系統
              </h1>
              <p className="text-xs md:text-base text-teal-700">
                點擊日期右上角的 + 號新增排班,點擊排班卡片可編輯或刪除
              </p>
            </div>

            {/* Month Navigation */}
            <MonthNavigation
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />

            {/* Toolbar */}
            <Toolbar 
              onExportImage={handleExportImage} 
            />

            {/* Calendar */}
            <div ref={calendarRef}>
              <CalendarView />
            </div>
          </div>
        </div>
      </div>
    </ScheduleProvider>
  );
}
