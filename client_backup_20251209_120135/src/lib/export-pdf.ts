import jsPDF from 'jspdf';
import { MonthSchedule } from '@/types/schedule';
import { getMonthDays, formatDate, isSameMonth, getMonthName } from './calendar-utils';

export async function exportToPDF(scheduleData: MonthSchedule) {
  const { year, month, schedules } = scheduleData;
  const days = getMonthDays(year, month);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Title
    pdf.setFontSize(18);
    pdf.setTextColor(13, 148, 136); // Teal color
    const title = `${year} 年 ${getMonthName(month)} 醫生排班表`;
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yPos);
    yPos += 15;

    // Table headers
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(13, 148, 136);
    pdf.setTextColor(255, 255, 255);
    
    const colWidths = [25, 20, 50, 40, 40];
    const headers = ['日期', '星期', '醫師姓名', '開始時間', '結束時間'];
    let xPos = margin;
    
    headers.forEach((header, i) => {
      pdf.rect(xPos, yPos, colWidths[i], 8, 'F');
      pdf.text(header, xPos + colWidths[i] / 2, yPos + 6, { align: 'center' });
      xPos += colWidths[i];
    });
    yPos += 8;

    // Table content
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(249, 250, 251);
    
    let rowIndex = 0;
    days.forEach((date) => {
      if (!isSameMonth(date, year, month)) {
        return;
      }

      const dateStr = formatDate(date);
      const daySchedule = schedules[dateStr];
      const weekday = weekdays[date.getDay()];
      const dateDisplay = `${date.getMonth() + 1}/${date.getDate()}`;

      // Check if we need a new page
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }

      if (daySchedule && daySchedule.shifts.length > 0) {
        daySchedule.shifts.forEach((shift, index) => {
          if (yPos > pageHeight - 20) {
            pdf.addPage();
            yPos = margin;
          }

          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.rect(margin, yPos, contentWidth, 7, 'F');
          }

          xPos = margin;
          if (index === 0) {
            pdf.text(dateDisplay, xPos + colWidths[0] / 2, yPos + 5, { align: 'center' });
            xPos += colWidths[0];
            pdf.text(weekday, xPos + colWidths[1] / 2, yPos + 5, { align: 'center' });
            xPos += colWidths[1];
          } else {
            xPos += colWidths[0] + colWidths[1];
          }
          
          pdf.text(shift.doctorName, xPos + 2, yPos + 5);
          xPos += colWidths[2];
          pdf.text(shift.startTime, xPos + colWidths[3] / 2, yPos + 5, { align: 'center' });
          xPos += colWidths[3];
          pdf.text(shift.endTime, xPos + colWidths[4] / 2, yPos + 5, { align: 'center' });

          yPos += 7;
          rowIndex++;
        });
      } else {
        if (rowIndex % 2 === 0) {
          pdf.rect(margin, yPos, contentWidth, 7, 'F');
        }

        xPos = margin;
        pdf.text(dateDisplay, xPos + colWidths[0] / 2, yPos + 5, { align: 'center' });
        xPos += colWidths[0];
        pdf.text(weekday, xPos + colWidths[1] / 2, yPos + 5, { align: 'center' });
        xPos += colWidths[1];
        
        pdf.setTextColor(150, 150, 150);
        pdf.text('-', xPos + colWidths[2] / 2, yPos + 5, { align: 'center' });
        xPos += colWidths[2];
        pdf.text('-', xPos + colWidths[3] / 2, yPos + 5, { align: 'center' });
        xPos += colWidths[3];
        pdf.text('-', xPos + colWidths[4] / 2, yPos + 5, { align: 'center' });
        pdf.setTextColor(0, 0, 0);

        yPos += 7;
        rowIndex++;
      }
    });

    // Footer
    yPos += 10;
    if (yPos > pageHeight - 20) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    const footer = `匯出時間: ${new Date().toLocaleString('zh-TW')}`;
    pdf.text(footer, pageWidth / 2, yPos, { align: 'center' });

    // Download
    const filename = `醫生排班表_${year}年${month}月.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}
