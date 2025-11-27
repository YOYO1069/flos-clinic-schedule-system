import * as XLSX from 'xlsx';
import { MonthSchedule } from '@/types/schedule';
import { getMonthDays, formatDate, isSameMonth, getMonthName } from './calendar-utils';

export function exportToExcel(scheduleData: MonthSchedule) {
  const { year, month, schedules } = scheduleData;
  const days = getMonthDays(year, month);

  // Prepare data for Excel
  const data: any[] = [];

  // Header row
  data.push([`${year} 年 ${getMonthName(month)} 醫生排班表`]);
  data.push([]); // Empty row

  // Column headers
  data.push(['日期', '星期', '醫師姓名', '開始時間', '結束時間']);

  // Data rows
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  
  days.forEach((date) => {
    if (!isSameMonth(date, year, month)) {
      return; // Skip days from other months
    }

    const dateStr = formatDate(date);
    const daySchedule = schedules[dateStr];
    const weekday = weekdays[date.getDay()];

    if (daySchedule && daySchedule.shifts.length > 0) {
      daySchedule.shifts.forEach((shift, index) => {
        if (index === 0) {
          data.push([
            `${date.getMonth() + 1}/${date.getDate()}`,
            weekday,
            shift.doctorName,
            shift.startTime,
            shift.endTime,
          ]);
        } else {
          data.push([
            '', // Empty date cell for subsequent shifts
            '',
            shift.doctorName,
            shift.startTime,
            shift.endTime,
          ]);
        }
      });
    } else {
      // Empty day
      data.push([
        `${date.getMonth() + 1}/${date.getDate()}`,
        weekday,
        '-',
        '-',
        '-',
      ]);
    }
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // 日期
    { wch: 8 },  // 星期
    { wch: 15 }, // 醫師姓名
    { wch: 12 }, // 開始時間
    { wch: 12 }, // 結束時間
  ];

  // Merge title cell
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${month}月排班表`);

  // Generate filename
  const filename = `醫生排班表_${year}年${month}月.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}
