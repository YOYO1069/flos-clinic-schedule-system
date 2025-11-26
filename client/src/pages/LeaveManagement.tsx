import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, tables } from "@/lib/supabase";
import { Calendar, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

const leaveTypes = [
  { value: 'special', label: '特休假', noDeduct: true },
  { value: 'marriage', label: '婚假', noDeduct: true },
  { value: 'bereavement', label: '喪假', noDeduct: true },
  { value: 'maternity', label: '產假', noDeduct: true },
  { value: 'job_seeking', label: '謀職假', noDeduct: true },
  { value: 'miscarriage', label: '流產假', noDeduct: true },
  { value: 'prenatal_care', label: '安胎假', noDeduct: true },
  { value: 'prenatal_checkup', label: '產檢假', noDeduct: true },
  { value: 'paternity_checkup', label: '陪產檢假', noDeduct: true },
  { value: 'official_injury', label: '公假工傷假', noDeduct: true },
  { value: 'breastfeeding', label: '哺乳假', noDeduct: true },
  { value: 'typhoon', label: '颱風假', noDeduct: true },
  { value: 'menstrual', label: '生理假', noDeduct: true },
  { value: 'family_care', label: '家庭照顧假', noDeduct: true }
];

export default function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // 表單狀態
  const [leaveType, setLeaveType] = useState('special');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [noDeductAttendance, setNoDeductAttendance] = useState(true);

  // 模擬員工 ID
  const employeeId = 1;

  useEffect(() => {
    loadRequests();
  }, []);

  // 載入請假記錄
  async function loadRequests() {
    try {
      const { data, error } = await supabase
        .from(tables.leaveRequests)
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入請假記錄失敗:', error);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('載入請假記錄錯誤:', err);
    }
  }

  // 計算請假天數
  function calculateDays(start: string, end: string): number {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const days = (endTime - startTime) / (1000 * 60 * 60 * 24) + 1;
    return Math.max(0, days);
  }

  // 提交請假申請
  async function submitRequest() {
    if (!startDate || !endDate) {
      alert('請選擇請假日期');
      return;
    }

    const days = calculateDays(startDate, endDate);
    if (days <= 0) {
      alert('結束日期必須大於或等於開始日期');
      return;
    }

    setLoading(true);
    try {
      // 檢查是否不扣全勤
      const selectedType = leaveTypes.find(t => t.value === leaveType);
      const noDeduct = selectedType?.noDeduct || false;

      const { error } = await supabase
        .from(tables.leaveRequests)
        .insert([{
          employee_id: employeeId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          days: days,
          reason: '', // 不需要理由
          no_deduct_attendance: noDeduct,
          status: 'pending'
        }]);

      if (error) throw error;

      alert('✅ 請假申請已提交!');
      setShowForm(false);
      setLeaveType('special');
      setStartDate('');
      setEndDate('');
      setReason('');
      await loadRequests();
    } catch (err: any) {
      alert('❌ 提交失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 取消請假
  async function cancelRequest(id: number) {
    if (!confirm('確定要取消這筆請假申請嗎?')) return;

    try {
      const { error } = await supabase
        .from(tables.leaveRequests)
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      alert('✅ 已取消請假申請');
      await loadRequests();
    } catch (err: any) {
      alert('❌ 取消失敗: ' + err.message);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      pending: '待審核',
      approved: '已核准',
      rejected: '已拒絕',
      cancelled: '已取消'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            請假管理系統
          </h1>
          <p className="text-gray-600 mt-2">線上請假申請 · 即時審核狀態</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 請假申請表單 */}
          <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-600" />
                請假申請
              </CardTitle>
              <CardDescription>填寫請假資訊並提交審核</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>請假類型</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {startDate && endDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    請假天數: <span className="font-semibold">{calculateDays(startDate, endDate)}</span> 天
                  </p>
                </div>
              )}

              {/* 不需要填寫請假理由 */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  ✅ 所有假別均不扣全勤，且不需填寫請假理由
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                onClick={submitRequest}
                disabled={loading}
              >
                {loading ? '提交中...' : '提交申請'}
              </Button>
            </CardContent>
          </Card>

          {/* 請假記錄列表 */}
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                請假記錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {requests.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">尚無請假記錄</p>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">
                              {leaveTypes.find(t => t.value === request.leave_type)?.label}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(request.start_date), 'yyyy/MM/dd')} - {format(new Date(request.end_date), 'yyyy/MM/dd')}
                            <span className="ml-2 text-purple-600 font-medium">({request.days} 天)</span>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelRequest(request.id)}
                          >
                            取消申請
                          </Button>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded p-3 mb-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">事由:</span> {request.reason}
                        </p>
                      </div>

                      {request.rejection_reason && (
                        <div className="bg-red-50 rounded p-3 mb-2">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">拒絕原因:</span> {request.rejection_reason}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          申請時間: {format(new Date(request.created_at), 'yyyy/MM/dd HH:mm')}
                        </div>
                        {request.approved_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            審核時間: {format(new Date(request.approved_at), 'yyyy/MM/dd HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
