import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Search, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { utcToTaiwanTime } from '@/lib/timezone';

interface AttendanceRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  work_date: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_address: string | null;
  check_out_address: string | null;
  total_hours: number | null;
  check_in_method: string;
  status: string;
  notes: string | null;
}

export default function AttendanceManagement() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    check_in_time: '',
    check_out_time: '',
    check_in_address: '',
    check_out_address: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, dateFilter]);

  async function loadRecords() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('work_date', { ascending: false })
        .order('check_in_time', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error: any) {
      console.error('載入打卡記錄失敗:', error);
      toast.error('載入打卡記錄失敗');
    } finally {
      setLoading(false);
    }
  }

  function filterRecords() {
    let filtered = [...records];

    // 日期篩選
    if (dateFilter) {
      filtered = filtered.filter(record => record.work_date === dateFilter);
    }

    // 員工名稱或ID篩選
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.employee_name.toLowerCase().includes(term) ||
        record.employee_id.toLowerCase().includes(term)
      );
    }

    setFilteredRecords(filtered);
  }

  function handleEdit(record: AttendanceRecord) {
    setEditingRecord(record);
    setEditForm({
      check_in_time: record.check_in_time ? format(utcToTaiwanTime(record.check_in_time), 'yyyy-MM-dd HH:mm:ss') : '',
      check_out_time: record.check_out_time ? format(utcToTaiwanTime(record.check_out_time), 'yyyy-MM-dd HH:mm:ss') : '',
      check_in_address: record.check_in_address || '',
      check_out_address: record.check_out_address || '',
      notes: record.notes || ''
    });
    setShowEditDialog(true);
  }

  async function handleSaveEdit() {
    if (!editingRecord) return;

    setLoading(true);
    try {
      // 直接使用輸入的台灣時間，不做時區轉換
      const checkInTime = editForm.check_in_time;
      const checkOutTime = editForm.check_out_time || null;

      // 計算工時
      let totalHours = null;
      if (checkOutTime) {
        const checkInDate = new Date(checkInTime);
        const checkOutDate = new Date(checkOutTime);
        totalHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
        totalHours = Math.round(totalHours * 100) / 100;
      }

      const updateData: any = {
        check_in_time: checkInTime,
        check_in_address: editForm.check_in_address || null,
        notes: editForm.notes || null
      };

      if (editForm.check_out_time) {
        updateData.check_out_time = checkOutTime;
        updateData.check_out_address = editForm.check_out_address || null;
        updateData.total_hours = totalHours;
      }

      const { error } = await supabase
        .from('attendance_records')
        .update(updateData)
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast.success('打卡記錄已更新');
      setShowEditDialog(false);
      loadRecords();
    } catch (error: any) {
      console.error('更新打卡記錄失敗:', error);
      toast.error('更新打卡記錄失敗');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(record: AttendanceRecord) {
    if (!confirm(`確定要刪除 ${record.employee_name} 在 ${record.work_date} 的打卡記錄嗎？`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      toast.success('打卡記錄已刪除');
      loadRecords();
    } catch (error: any) {
      console.error('刪除打卡記錄失敗:', error);
      toast.error('刪除打卡記錄失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="container max-w-7xl mx-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              員工打卡記錄管理
            </h1>
          </div>
        </div>

        {/* 篩選區域 */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">
                搜尋員工
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="輸入員工姓名或ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date" className="mb-2 block">
                篩選日期
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="w-full"
              >
                清除篩選
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            顯示 {filteredRecords.length} 筆記錄 (共 {records.length} 筆)
          </div>
        </Card>

        {/* 打卡記錄表格 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>員工ID</TableHead>
                  <TableHead>員工姓名</TableHead>
                  <TableHead>上班時間</TableHead>
                  <TableHead>下班時間</TableHead>
                  <TableHead>工時</TableHead>
                  <TableHead>打卡方式</TableHead>
                  <TableHead>上班地點</TableHead>
                  <TableHead>下班地點</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      載入中...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      沒有找到打卡記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.work_date}</TableCell>
                      <TableCell>{record.employee_id}</TableCell>
                      <TableCell>{record.employee_name}</TableCell>
                      <TableCell>
                        {record.check_in_time
                          ? format(utcToTaiwanTime(record.check_in_time), 'HH:mm:ss')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time
                          ? format(utcToTaiwanTime(record.check_out_time), 'HH:mm:ss')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.total_hours ? `${record.total_hours.toFixed(2)} 小時` : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_in_method === 'gps' && 'GPS'}
                        {record.check_in_method === 'quick' && '快速'}
                        {record.check_in_method === 'bluetooth' && '藍牙'}
                        {record.check_in_method === 'manual' && '手動'}
                        {record.check_in_method === 'line' && 'LINE'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.check_in_address || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.check_out_address || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(record)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* 編輯對話框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>編輯打卡記錄</DialogTitle>
            </DialogHeader>
            {editingRecord && (
              <div className="space-y-4">
                <div>
                  <Label>員工</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {editingRecord.employee_name} ({editingRecord.employee_id})
                  </div>
                </div>
                <div>
                  <Label>日期</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {editingRecord.work_date}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-check-in">上班時間 (台灣時間)</Label>
                    <Input
                      id="edit-check-in"
                      type="text"
                      placeholder="yyyy-MM-dd HH:mm:ss"
                      value={editForm.check_in_time}
                      onChange={(e) => setEditForm({ ...editForm, check_in_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-check-out">下班時間 (台灣時間)</Label>
                    <Input
                      id="edit-check-out"
                      type="text"
                      placeholder="yyyy-MM-dd HH:mm:ss"
                      value={editForm.check_out_time}
                      onChange={(e) => setEditForm({ ...editForm, check_out_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-in-address">上班地點</Label>
                    <Input
                      id="edit-in-address"
                      value={editForm.check_in_address}
                      onChange={(e) => setEditForm({ ...editForm, check_in_address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-out-address">下班地點</Label>
                    <Input
                      id="edit-out-address"
                      value={editForm.check_out_address}
                      onChange={(e) => setEditForm({ ...editForm, check_out_address: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-notes">備註</Label>
                  <Input
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                儲存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
