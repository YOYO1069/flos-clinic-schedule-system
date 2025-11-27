import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Printer, Download, Upload, Loader2, Users, FileSpreadsheet, Plus, Trash2, MoreVertical, Calendar, Clock, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import Tesseract from "tesseract.js";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { useLocation } from 'wouter';

interface LeaveRecord {
  id?: number;
  year: number;
  month: number;
  staff_name: string;
  day: number;
  created_at?: string;
  updated_at?: string;
}

interface StaffMember {
  id: number;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// 取得某月的天數
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 取得某日是星期幾 (0=週日, 6=週六)
function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

// 判斷是否為週末
function isWeekend(year: number, month: number, day: number): boolean {
  const dayOfWeek = getDayOfWeek(year, month, day);
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// 月份名稱
const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月"
];

export default function LeaveCalendar() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 檢查登入狀態
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, []);
  const calendarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 當前選擇的年月
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11);
  
  // 員工名單
  const [staffMembers, setStaffMembers] = useState<string[]>([]);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  
  // 休假狀態
  const [leaveStatus, setLeaveStatus] = useState<Map<string, boolean>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 計算當前月份的天數
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // 載入員工名單
  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data) {
        setStaffMembers(data.map((s: StaffMember) => s.name));
      }
    } catch (error) {
      console.error('載入員工名單失敗:', error);
      toast.error("載入員工名單失敗");
    }
  };

  // 載入休假記錄
  const loadLeaveRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_records')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth);

      if (error) throw error;

      const newMap = new Map<string, boolean>();
      if (data) {
        data.forEach((record: LeaveRecord) => {
          const key = `${record.year}-${record.month}-${record.staff_name}-${record.day}`;
          newMap.set(key, true);
        });
      }
      setLeaveStatus(newMap);
    } catch (error) {
      console.error('載入休假記錄失敗:', error);
      toast.error("載入休假記錄失敗");
    }
  };

  // 初始載入
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadStaffMembers();
      await loadLeaveRecords();
      setIsLoading(false);
    };
    init();
  }, [selectedYear, selectedMonth]);

  // 切換休假狀態
  const toggleLeave = async (staffName: string, day: number) => {
    const key = `${selectedYear}-${selectedMonth}-${staffName}-${day}`;
    const isCurrentlyLeave = leaveStatus.has(key);

    try {
      if (isCurrentlyLeave) {
        // 刪除休假記錄
        const { error } = await supabase
          .from('leave_records')
          .delete()
          .eq('year', selectedYear)
          .eq('month', selectedMonth)
          .eq('staff_name', staffName)
          .eq('day', day);

        if (error) throw error;

        setLeaveStatus(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      } else {
        // 新增休假記錄
        const { error } = await supabase
          .from('leave_records')
          .insert({
            year: selectedYear,
            month: selectedMonth,
            staff_name: staffName,
            day: day
          });

        if (error) throw error;

        setLeaveStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(key, true);
          return newMap;
        });
      }
    } catch (error) {
      console.error('更新休假狀態失敗:', error);
      toast.error("更新休假狀態失敗");
    }
  };

  // 檢查是否為休假
  const isLeave = (staffName: string, day: number): boolean => {
    return leaveStatus.has(`${selectedYear}-${selectedMonth}-${staffName}-${day}`);
  };

  // 列印功能
  const handlePrint = () => {
    window.print();
  };

  // 儲存為圖片
  const handleSaveImage = async () => {
    if (!calendarRef.current) return;
    
    try {
      toast.info("正在生成圖片...");
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `員工休假月曆_${selectedYear}年${selectedMonth}月_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("圖片已儲存!");
    } catch (error) {
      console.error('儲存圖片失敗:', error);
      toast.error("儲存圖片失敗,請重試");
    }
  };

  // 匯出 Excel
  const handleExportExcel = () => {
    try {
      const data: any[][] = [];
      
      const headerRow = ["員工姓名", ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())];
      data.push(headerRow);
      
      staffMembers.forEach(staff => {
        const row = [staff];
        for (let day = 1; day <= daysInMonth; day++) {
          row.push(isLeave(staff, day) ? "OFF" : "");
        }
        data.push(row);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${selectedYear}年${selectedMonth}月`);
      
      XLSX.writeFile(wb, `員工休假月曆_${selectedYear}年${selectedMonth}月.xlsx`);
      toast.success("Excel 檔案已匯出!");
    } catch (error) {
      console.error('匯出 Excel 失敗:', error);
      toast.error("匯出 Excel 失敗,請重試");
    }
  };

  // 處理圖片上傳
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // 處理檔案選擇
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("請上傳圖片檔案");
      return;
    }

    setIsProcessing(true);
    toast.info("正在辨識圖片中的休假資訊...");

    try {
      const result = await Tesseract.recognize(file, 'chi_tra+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`辨識進度: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = result.data.text;
      console.log("辨識結果:", text);

      const newLeaveRecords: any[] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        const staffMatch = staffMembers.find(staff => line.includes(staff));
        
        if (staffMatch) {
          const numberMatches = line.matchAll(/\b([1-9]|[12][0-9]|30|31)\b/g);
          const numbers = Array.from(numberMatches).map(m => parseInt(m[1]));
          
          if (line.includes('OFF') || line.includes('off')) {
            numbers.forEach(day => {
              if (day >= 1 && day <= daysInMonth) {
                newLeaveRecords.push({
                  year: selectedYear,
                  month: selectedMonth,
                  staff_name: staffMatch,
                  day: day
                });
              }
            });
          }
        }
      }

      if (newLeaveRecords.length > 0) {
        const { error } = await supabase
          .from('leave_records')
          .upsert(newLeaveRecords, {
            onConflict: 'year,month,staff_name,day'
          });

        if (error) throw error;

        await loadLeaveRecords();
        toast.success(`成功匯入 ${newLeaveRecords.length} 筆休假記錄!`);
      } else {
        toast.warning("未能辨識到休假資訊,請確認圖片清晰度或手動輸入");
      }

    } catch (error) {
      console.error('圖片辨識失敗:', error);
      toast.error("圖片辨識失敗,請重試或手動輸入");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 清除當前月份的所有休假記錄
  const handleClear = async () => {
    if (confirm(`確定要清除 ${selectedYear} 年 ${selectedMonth} 月的所有休假記錄嗎?`)) {
      try {
        const { error } = await supabase
          .from('leave_records')
          .delete()
          .eq('year', selectedYear)
          .eq('month', selectedMonth);

        if (error) throw error;

        setLeaveStatus(new Map());
        toast.success("已清除當前月份記錄");
      } catch (error) {
        console.error('清除記錄失敗:', error);
        toast.error("清除記錄失敗");
      }
    }
  };

  // 新增員工
  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error("請輸入員工名字");
      return;
    }
    if (staffMembers.includes(newStaffName.trim())) {
      toast.error("員工名字已存在");
      return;
    }

    try {
      const { error } = await supabase
        .from('staff_members')
        .insert({
          name: newStaffName.trim(),
          order_index: staffMembers.length + 1
        });

      if (error) throw error;

      await loadStaffMembers();
      setNewStaffName("");
      toast.success(`已新增員工: ${newStaffName.trim()}`);
    } catch (error) {
      console.error('新增員工失敗:', error);
      toast.error("新增員工失敗");
    }
  };

  // 刪除員工
  const handleRemoveStaff = async (staffName: string) => {
    if (confirm(`確定要刪除員工「${staffName}」嗎?相關的休假記錄也會被清除。`)) {
      try {
        // 刪除員工
        const { error: staffError } = await supabase
          .from('staff_members')
          .delete()
          .eq('name', staffName);

        if (staffError) throw staffError;

        // 刪除該員工的所有休假記錄
        const { error: leaveError } = await supabase
          .from('leave_records')
          .delete()
          .eq('staff_name', staffName);

        if (leaveError) throw leaveError;

        await loadStaffMembers();
        await loadLeaveRecords();
        toast.success(`已刪除員工: ${staffName}`);
      } catch (error) {
        console.error('刪除員工失敗:', error);
        toast.error("刪除員工失敗");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-2">
      <div className="max-w-[1800px] mx-auto">
        {/* 標題和操作按鈕 */}
        <div className="mb-4 space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">員工休假月曆</h1>
            <div className="flex gap-2">
              {/* 導航按鈕 */}
              <Button variant="default" size="sm" onClick={() => setLocation('/doctor-schedule')} className="bg-teal-600 hover:bg-teal-700">
                <Calendar className="w-4 h-4 mr-2" />
                醫師排班
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/schedule')}>
                <Calendar className="w-4 h-4 mr-2" />
                員工排班
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/attendance')}>
                <Clock className="w-4 h-4 mr-2" />
                員工打卡
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/leave')}>
                <FileText className="w-4 h-4 mr-2" />
                請假管理
              </Button>
              
              {currentUser?.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => setLocation('/admin')}>
                  管理者主控台
                </Button>
              )}
              
              {['admin', 'senior_supervisor', 'supervisor'].includes(currentUser?.role) && (
                <Button variant="outline" size="sm" onClick={() => setLocation('/approval')}>
                  審核請假
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem('user');
                  setLocation('/login');
                }}
              >
                登出
              </Button>
              
              {/* 次要功能選單 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4 mr-2" />
                    更多功能
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Dialog open={isEditingStaff} onOpenChange={setIsEditingStaff}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Users className="w-4 h-4 mr-2" />
                        編輯員工
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>編輯員工名單</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* 新增員工 */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="輸入員工名字"
                            value={newStaffName}
                            onChange={(e) => setNewStaffName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                          />
                          <Button onClick={handleAddStaff} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* 員工列表 */}
                        <div className="space-y-2">
                          {staffMembers.map((staff, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>{staff}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStaff(staff)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenuItem onClick={handleImageUpload} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        辨識中...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        匯入圖片
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    匯出 Excel
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    列印
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleSaveImage}>
                    <Download className="w-4 h-4 mr-2" />
                    儲存圖片
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleClear} className="text-red-600">
                    清除記錄
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 月份選擇器 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">選擇月份:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => 2024 + i).map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">共 {daysInMonth} 天</span>
          </div>
        </div>

        {/* 隱藏的檔案輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 月曆表格 - 主要看板 */}
        <div ref={calendarRef} className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
          {/* 列印時顯示的標題 */}
          <div className="hidden print:block p-4 text-center border-b-2 border-gray-800">
            <h1 className="text-xl font-bold">員工休假月曆 - {selectedYear}年{selectedMonth}月</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-800 text-white border border-gray-600 px-3 py-2 text-sm font-bold min-w-[100px]">
                    員工姓名
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <th
                      key={day}
                      className={`border border-gray-600 px-2 py-2 text-sm font-bold min-w-[50px] ${
                        isWeekend(selectedYear, selectedMonth, day)
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff}>
                    <td className="sticky left-0 z-10 bg-gray-100 border border-gray-400 px-3 py-2 text-sm font-medium">
                      {staff}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <td
                        key={day}
                        onClick={() => toggleLeave(staff, day)}
                        className={`border border-gray-400 px-2 py-2 text-center text-xs cursor-pointer transition-colors hover:bg-blue-100 print:cursor-default ${
                          isWeekend(selectedYear, selectedMonth, day) ? 'bg-gray-200' : 'bg-white'
                        }`}
                      >
                        {isLeave(staff, day) && (
                          <span className="font-bold text-red-600">OFF</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 說明文字 */}
        <div className="mt-4 text-sm text-gray-600 print:hidden">
          <p>• 點擊格子可以標記/取消 OFF (休假)</p>
          <p>• 深色背景為週末日期</p>
          <p>• 其他功能(編輯員工、匯入圖片、匯出等)請點擊右上角選單</p>
          <p>• 資料已永久儲存到雲端資料庫,可跨裝置存取</p>
        </div>
      </div>
    </div>
  );
}
