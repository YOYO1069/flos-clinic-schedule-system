import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Clock, User, Calendar, ArrowLeft, Edit, Search } from "lucide-react";
import { format } from 'date-fns';

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  check_in_time: string;
  check_out_time?: string;
  date: string;
}

export default function SimpleAttendanceManagement() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState({
    check_in_time: '',
    check_out_time: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 檢查登入狀態和權限
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    // 只有主管以上才能存取
    if (!['admin', 'senior_supervisor', 'supervisor'].includes(user.role)) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }

    setCurrentUser(user);
    loadRecords();
  }, []);

  useEffect(() => {
    // 篩選記錄
    let filtered = records;
    
    // 依日期篩選
    if (selectedDate) {
      filtered = filtered.filter(r => r.date === selectedDate);
    }
    
    // 依姓名搜尋
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRecords(filtered);
  }, [records, searchTerm, selectedDate]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false })
        .order('check_in_time', { ascending: false })
        .limit(500);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('載入打卡記錄失敗:', error);
      toast.error("載入打卡記錄失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditForm({
      check_in_time: record.check_in_time.substring(11, 16), // HH:mm
      check_out_time: record.check_out_time ? record.check_out_time.substring(11, 16) : ''
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingRecord) return;

    setIsProcessing(true);
    try {
      const updateData: any = {
        check_in_time: `${editingRecord.date}T${editForm.check_in_time}:00`,
        updated_at: new Date().toISOString()
      };

      if (editForm.check_out_time) {
        updateData.check_out_time = `${editingRecord.date}T${editForm.check_out_time}:00`;
      }

      const { error } = await supabase
        .from('attendance_records')
        .update(updateData)
        .eq('id', editingRecord.id);
      
      if (error) throw error;
      
      toast.success("已更新打卡記錄");
      setShowEditDialog(false);
      loadRecords();
    } catch (error) {
      console.error('更新失敗:', error);
      toast.error("更新失敗，請重試");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 標題和導航 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首頁
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">打卡記錄查詢</h1>
          <p className="text-gray-600">查看和修改員工打卡記錄（簡化版）</p>
        </div>

        {/* 篩選區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>篩選條件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">日期</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">搜尋員工</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="輸入員工姓名或編號"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 打卡記錄列表 */}
        <Card>
          <CardHeader>
            <CardTitle>打卡記錄 ({filteredRecords.length})</CardTitle>
            <CardDescription>
              {selectedDate} 的打卡記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">載入中...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">沒有找到符合條件的打卡記錄</div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold text-lg">{record.employee_name}</span>
                          <Badge variant="outline">{record.employee_id}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">日期:</span>
                            <span className="font-medium">{record.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">上班:</span>
                            <span className="font-medium text-green-600">
                              {format(new Date(record.check_in_time), 'HH:mm')}
                            </span>
                          </div>
                          {record.check_out_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-red-500" />
                              <span className="text-gray-600">下班:</span>
                              <span className="font-medium text-red-600">
                                {format(new Date(record.check_out_time), 'HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(record)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          編輯
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 編輯對話框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>編輯打卡時間</DialogTitle>
              <DialogDescription>
                {editingRecord && (
                  <>
                    員工: {editingRecord.employee_name} ({editingRecord.employee_id})
                    <br />
                    日期: {editingRecord.date}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">上班時間</label>
                <Input
                  type="time"
                  value={editForm.check_in_time}
                  onChange={(e) => setEditForm({...editForm, check_in_time: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">下班時間（選填）</label>
                <Input
                  type="time"
                  value={editForm.check_out_time}
                  onChange={(e) => setEditForm({...editForm, check_out_time: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isProcessing}>
                取消
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? '更新中...' : '確認更新'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
