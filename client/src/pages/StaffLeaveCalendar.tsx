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
import { Printer, Download, Upload, Loader2, Users, FileSpreadsheet, Plus, Trash2, MoreVertical, ArrowLeft } from "lucide-react";
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

// 有編輯權限的員工編號列表
const EDIT_PERMISSION_IDS = [
  'ADMIN-HBH012',    // 黃柏翰 - 管理者
  'SUPER-LDX011',    // 劉道玄 - 高階主管
  'SUPER-ZYR016',    // 鍾曜任 - 高階主管
  'SUPER-WQ001',     // 萬晴 - 一般主管
  'SUPER-CYA002',    // 陳韻安 - 一般主管
];

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

export default function StaffLeaveCalendar() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);

  // 檢查登入狀態和權限
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    // 檢查是否有編輯權限(不顯示給使用者)
    const hasPermission = EDIT_PERMISSION_IDS.includes(user.employee_id);
    setHasEditPermission(hasPermission);
  }, []);

  const calendarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 當前選擇的年月
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(1);
  
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

  // 切換休假狀態(只有有權限的人可以操作)
  const toggleLeave = async (staffName: string, day: number) => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }

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
        backgroundColor: '#0f172a'
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

  // 處理圖片上傳(只有有權限的人可以操作)
  const handleImageUpload = () => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }
    fileInputRef.current?.click();
  };

  // 處理檔案選擇
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }

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

      const newLeaveRecords: LeaveRecord[] = [];
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

  // 清除當前月份的所有休假記錄(只有有權限的人可以操作)
  const handleClear = async () => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }

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

  // 新增員工(只有有權限的人可以操作)
  const handleAddStaff = async () => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }

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

  // 刪除員工(只有有權限的人可以操作)
  const handleRemoveStaff = async (staffName: string) => {
    if (!hasEditPermission) {
      toast.error("您沒有編輯權限");
      return;
    }

    if (confirm(`確定要刪除員工「${staffName}」嗎?相關的休假記錄也會被清除。`)) {
      try {
        const { error: deleteError } = await supabase
          .from('staff_members')
          .delete()
          .eq('name', staffName);

        if (deleteError) throw deleteError;

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

  // 載入中畫面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-blue-200 text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 print:p-2 print:bg-white">
      <div className="max-w-[1800px] mx-auto">
        {/* 標題和操作按鈕 */}
        <div className="mb-6 space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="bg-slate-800/50 border-blue-500/30 text-blue-200 hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                員工休假月曆
              </h1>
            </div>
            
            <div className="flex gap-2">
              {/* 只有有權限的人才能看到編輯員工按鈕 */}
              {hasEditPermission && (
                <Dialog open={isEditingStaff} onOpenChange={setIsEditingStaff}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-slate-800/50 border-blue-500/30 text-blue-200 hover:bg-slate-700/50">
                      <Users className="w-4 h-4 mr-2" />
                      編輯員工
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-slate-800 border-blue-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-blue-200">編輯員工名單</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="輸入員工名字"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                          className="bg-slate-700/50 border-blue-500/30 text-blue-100"
                        />
                        <Button onClick={handleAddStaff} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {staffMembers.map((staff, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-blue-500/20">
                            <span className="text-blue-100">{staff}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStaff(staff)}
                              className="hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* 功能選單 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-slate-800/50 border-blue-500/30 text-blue-200 hover:bg-slate-700/50">
                    <MoreVertical className="w-4 h-4 mr-2" />
                    更多功能
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-blue-500/30">
                  {hasEditPermission && (
                    <>
                      <DropdownMenuItem 
                        onClick={handleImageUpload}
                        disabled={isProcessing}
                        className="text-blue-200 hover:bg-slate-700"
                      >
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
                      <DropdownMenuItem 
                        onClick={handleClear}
                        className="text-blue-200 hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        清除記錄
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-blue-500/20" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleExportExcel}
                    className="text-blue-200 hover:bg-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    匯出 Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handlePrint}
                    className="text-blue-200 hover:bg-slate-700"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    列印
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSaveImage}
                    className="text-blue-200 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    儲存圖片
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 月份選擇器 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-blue-200">選擇月份:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-800/50 border border-blue-500/30 rounded-md text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => 2024 + i).map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-800/50 border border-blue-500/30 rounded-md text-sm text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
            <span className="text-sm text-blue-300">共 {daysInMonth} 天</span>
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

        {/* 月曆表格 */}
        <div ref={calendarRef} className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-blue-500/20 print:shadow-none print:bg-white print:border-gray-300">
          {/* 列印時顯示的標題 */}
          <div className="hidden print:block p-4 text-center border-b-2 border-gray-800">
            <h1 className="text-xl font-bold text-gray-900">員工休假月曆 - {selectedYear}年{selectedMonth}月</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/30 px-3 py-3 text-sm font-bold min-w-[100px] print:bg-gray-800">
                    員工姓名
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <th
                      key={day}
                      className={`border border-blue-500/30 px-2 py-3 text-sm font-bold min-w-[50px] print:border-gray-600 ${
                        isWeekend(selectedYear, selectedMonth, day)
                          ? 'bg-gradient-to-b from-slate-700 to-slate-800 text-cyan-300 print:bg-gray-700' 
                          : 'bg-gradient-to-b from-blue-700 to-blue-800 text-white print:bg-gray-800'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff} className="hover:bg-blue-500/5 transition-colors">
                    <td className="sticky left-0 z-10 bg-slate-700/80 backdrop-blur-sm border border-blue-500/30 px-3 py-2 text-sm font-medium text-blue-100 print:bg-gray-100 print:text-gray-900">
                      {staff}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <td
                        key={day}
                        onClick={() => toggleLeave(staff, day)}
                        className={`border border-blue-500/30 px-2 py-2 text-center text-xs transition-all print:border-gray-400 print:bg-white ${
                          hasEditPermission 
                            ? 'cursor-pointer hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20' 
                            : 'cursor-not-allowed'
                        } ${
                          isWeekend(selectedYear, selectedMonth, day) 
                            ? 'bg-slate-700/30 print:bg-gray-200' 
                            : 'bg-slate-800/20'
                        }`}
                      >
                        {isLeave(staff, day) && (
                          <span className="font-bold text-sm bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent animate-pulse print:text-red-600">
                            OFF
                          </span>
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
        <div className="mt-6 text-sm text-blue-200/80 space-y-1 print:hidden">
          {hasEditPermission ? (
            <>
              <p>• 點擊格子可以標記/取消 OFF (休假)</p>
              <p>• 深色背景為週末日期</p>
              <p>• 可以編輯員工名單、切換不同月份、匯出 Excel、列印或儲存為圖片</p>
              <p>• 可以上傳之前儲存的月曆圖片,系統會自動辨識並還原休假記錄</p>
            </>
          ) : (
            <>
              <p>• 深色背景為週末日期</p>
              <p>• 您目前為檢視模式,無法編輯休假記錄</p>
              <p>• 可以匯出 Excel、列印或儲存為圖片</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
