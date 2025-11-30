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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useSchedule } from '@/contexts/ScheduleContext';
import { getMonthDays } from '@/lib/calendar-utils';

export default function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setLocation] = useLocation();
  const calendarRef = useRef<HTMLDivElement>(null);
  const { schedules, getShiftsForDate } = useSchedule();

  const handleExportExcel = () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const days = getMonthDays(year, month);
      
      // 準備 Excel 資料
      const excelData: any[] = [];
      
      // 標題行
      excelData.push([`${year}年${month}月醫師排班表`]);
      excelData.push([]);
      excelData.push(['日期', '星期', '醫師姓名', '開始時間', '結束時間']);
      
      // 資料行
      days.forEach(date => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const shifts = getShiftsForDate(dateStr);
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekday = weekdays[date.getDay()];
        
        if (shifts.length > 0) {
          shifts.forEach((shift, index) => {
            if (index === 0) {
              excelData.push([
                `${date.getMonth() + 1}/${date.getDate()}`,
                weekday,
                shift.doctorName,
                shift.startTime,
                shift.endTime
              ]);
            } else {
              excelData.push([
                '',
                '',
                shift.doctorName,
                shift.startTime,
                shift.endTime
              ]);
            }
          });
        } else {
          excelData.push([
            `${date.getMonth() + 1}/${date.getDate()}`,
            weekday,
            '',
            '',
            ''
          ]);
        }
      });
      
      // 建立工作簿
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${month}月排班表`);
      
      // 下載檔案
      XLSX.writeFile(wb, `醫師排班表_${year}年${month}月.xlsx`);
      toast.success('Excel 檔案已下載');
    } catch (error) {
      console.error('匯出 Excel 失敗:', error);
      toast.error('匯出失敗');
    }
  };

  const handleExportPDF = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const days = getMonthDays(year, month);
      
      // 建立 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // 設定字體（使用內建字體，中文可能無法正確顯示）
      pdf.setFontSize(16);
      pdf.text(`${year}年${month}月醫師排班表`, 105, 20, { align: 'center' });
      
      // 表格標題
      pdf.setFontSize(10);
      let y = 35;
      const lineHeight = 7;
      const colWidths = [20, 15, 40, 30, 30];
      const startX = 20;
      
      // 繪製表頭
      pdf.text('日期', startX, y);
      pdf.text('星期', startX + colWidths[0], y);
      pdf.text('醫師姓名', startX + colWidths[0] + colWidths[1], y);
      pdf.text('開始時間', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
      pdf.text('結束時間', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
      
      y += lineHeight;
      pdf.line(startX, y, startX + 135, y);
      y += lineHeight;
      
      // 繪製資料
      days.forEach(date => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const shifts = getShiftsForDate(dateStr);
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekday = weekdays[date.getDay()];
        
        if (shifts.length > 0) {
          shifts.forEach((shift, index) => {
            if (y > 270) {
              pdf.addPage();
              y = 20;
            }
            
            if (index === 0) {
              pdf.text(`${date.getMonth() + 1}/${date.getDate()}`, startX, y);
              pdf.text(weekday, startX + colWidths[0], y);
            }
            
            pdf.text(shift.doctorName, startX + colWidths[0] + colWidths[1], y);
            pdf.text(shift.startTime, startX + colWidths[0] + colWidths[1] + colWidths[2], y);
            pdf.text(shift.endTime, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
            
            y += lineHeight;
          });
        } else {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          
          pdf.text(`${date.getMonth() + 1}/${date.getDate()}`, startX, y);
          pdf.text(weekday, startX + colWidths[0], y);
          y += lineHeight;
        }
      });
      
      // 下載 PDF
      pdf.save(`醫師排班表_${year}年${month}月.pdf`);
      toast.success('PDF 檔案已下載');
    } catch (error) {
      console.error('匯出 PDF 失敗:', error);
      toast.error('匯出失敗');
    }
  };

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
              currentDate={currentDate} 
              onExportExcel={handleExportExcel} 
              onExportPDF={handleExportPDF} 
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
