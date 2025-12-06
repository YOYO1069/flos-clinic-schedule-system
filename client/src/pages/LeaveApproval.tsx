import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase, tables } from "@/lib/supabase";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, ArrowLeft } from "lucide-react";
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
  employee_name?: string;
  employee_role?: string;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
  menstrual: '生理假',
  marriage: '婚假',
  maternity: '產假',
  paternity: '陪產假',
  bereavement: '喪假',
  compensatory: '補休',
  other: '其他'
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: '已核准', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function LeaveApproval() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
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
    loadLeaveRequests(user);
  }, []);

  const loadLeaveRequests = async (user: any) => {
    try {
      // 先載入所有請假申請
      const { data: leaveData, error: leaveError } = await supabase
        .from(tables.leaveRequests)
        .select('*')
        .order('created_at', { ascending: false });

      if (leaveError) throw leaveError;

      if (!leaveData) {
        setRequests([]);
        setIsLoading(false);
        return;
      }

      // 載入所有使用者資料
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, role');

      if (userError) throw userError;

      // 建立使用者 ID 到資料的對應
      const userMap = new Map(userData?.map(u => [u.id, u]) || []);

      // 合併請假申請和員工資料
      let filteredRequests = leaveData.map(req => ({
        ...req,
        employee_name: userMap.get(req.employee_id)?.name || '未知',
        employee_role: userMap.get(req.employee_id)?.role || 'staff'
      }));

      // 根據權限過濾
      if (user.role === 'supervisor') {
        // 一般主管只能看到員工的請假申請
        filteredRequests = filteredRequests.filter(req => req.employee_role === 'staff');
      } else if (user.role === 'senior_supervisor') {
        // 高階主管可以看到所有員工和一般主管的請假申請
        filteredRequests = filteredRequests.filter(req => 
          ['staff', 'supervisor'].includes(req.employee_role)
        );
      }
      // admin 可以看到所有人的請假申請,不需要過濾

      setRequests(filteredRequests);
    } catch (error) {
      console.error('載入請假申請失敗:', error);
      toast.error("載入請假申請失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalClick = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setRejectionReason('');
    setShowApprovalDialog(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequest || !currentUser) return;

    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast.error("請填寫拒絕原因");
      return;
    }

    setIsProcessing(true);

    try {
      const updateData: any = {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        approved_by: currentUser.id,
        approved_at: new Date().toISOString()
      };

      if (approvalAction === 'reject') {
        updateData.rejection_reason = rejectionReason.trim();
      }

      const { error } = await supabase
        .from(tables.leaveRequests)
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success(approvalAction === 'approve' ? "已核准請假申請" : "已拒絕請假申請");
      setShowApprovalDialog(false);
      loadLeaveRequests(currentUser);
    } catch (error) {
      console.error('審核失敗:', error);
      toast.error("審核失敗,請重試");
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">請假審核</h1>
                <p className="text-sm text-gray-600">
                  {currentUser?.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* 待審核請假 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              待審核請假 ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              需要您審核的請假申請
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">目前沒有待審核的請假申請</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const StatusIcon = STATUS_CONFIG[request.status].icon;
                  return (
                    <div
                      key={request.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-lg">{request.employee_name}</span>
                            <Badge className={STATUS_CONFIG[request.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[request.status].label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">假別:</span>
                              <span className="font-medium">{LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">天數:</span>
                              <span className="font-medium">{request.days} 天</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">期間:</span>
                              <span className="font-medium">
                                {format(new Date(request.start_date), 'yyyy/MM/dd', { locale: zhTW })} - {format(new Date(request.end_date), 'yyyy/MM/dd', { locale: zhTW })}
                              </span>
                            </div>
                          </div>

                          {request.reason && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600">請假事由:</p>
                              <p className="text-sm mt-1">{request.reason}</p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-3">
                            申請時間: {format(new Date(request.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovalClick(request, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            核准
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalClick(request, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            拒絕
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 已處理請假 */}
        <Card>
          <CardHeader>
            <CardTitle>已處理請假 ({processedRequests.length})</CardTitle>
            <CardDescription>
              已審核的請假記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">目前沒有已處理的請假記錄</p>
            ) : (
              <div className="space-y-3">
                {processedRequests.map((request) => {
                  const StatusIcon = STATUS_CONFIG[request.status].icon;
                  return (
                    <div
                      key={request.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">{request.employee_name}</span>
                            <Badge className={STATUS_CONFIG[request.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[request.status].label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {LEAVE_TYPE_LABELS[request.leave_type]} · {request.days}天
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(request.start_date), 'yyyy/MM/dd')} - {format(new Date(request.end_date), 'yyyy/MM/dd')}
                          </p>
                          {request.rejection_reason && (
                            <p className="text-sm text-red-600 mt-2">拒絕原因: {request.rejection_reason}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {request.approved_at && (
                            <p>審核時間: {format(new Date(request.approved_at), 'yyyy/MM/dd HH:mm')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 審核對話框 */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? '核准請假申請' : '拒絕請假申請'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  員工: {selectedRequest.employee_name} | 
                  假別: {LEAVE_TYPE_LABELS[selectedRequest.leave_type]} | 
                  天數: {selectedRequest.days}天
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {approvalAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">拒絕原因 *</label>
              <Textarea
                placeholder="請說明拒絕原因..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {approvalAction === 'approve' && (
            <p className="text-sm text-gray-600">
              確定要核准此請假申請嗎?
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isProcessing}>
              取消
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={isProcessing}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={approvalAction === 'reject' ? 'destructive' : 'default'}
            >
              {isProcessing ? '處理中...' : approvalAction === 'approve' ? '確認核准' : '確認拒絕'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
