import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";

interface LeaveRequest {
  id: number;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

interface LeaveApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  onApprovalComplete: () => void;
}

export default function LeaveApprovalDialog({ 
  open, 
  onOpenChange, 
  date,
  onApprovalComplete 
}: LeaveApprovalDialogProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && date) {
      loadLeaveRequests();
    }
  }, [open, date]);

  const loadLeaveRequests = async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("status", "pending")
        .lte("start_date", dateStr)
        .gte("end_date", dateStr)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("載入請假申請失敗:", error);
        toast.error("載入請假申請失敗");
        return;
      }

      setLeaveRequests(data || []);
    } catch (err) {
      console.error("載入請假申請錯誤:", err);
      toast.error("載入請假申請時發生錯誤");
    }
    setLoading(false);
  };

  const handleApprove = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        console.error("核准失敗:", error);
        toast.error("核准失敗");
        return;
      }

      toast.success("已核准請假");
      loadLeaveRequests();
      onApprovalComplete();
    } catch (err) {
      console.error("核准錯誤:", err);
      toast.error("核准時發生錯誤");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        console.error("拒絕失敗:", error);
        toast.error("拒絕失敗");
        return;
      }

      toast.success("已拒絕請假");
      loadLeaveRequests();
      onApprovalComplete();
    } catch (err) {
      console.error("拒絕錯誤:", err);
      toast.error("拒絕時發生錯誤");
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "病假": "bg-red-100 text-red-800",
      "事假": "bg-yellow-100 text-yellow-800",
      "特休": "bg-green-100 text-green-800",
      "婚假": "bg-pink-100 text-pink-800",
      "喪假": "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-blue-100 text-blue-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            審核請假申請 - {date?.toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>此日期沒有待審核的請假申請</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {request.employee_name}
                      </h3>
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {request.employee_id}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">請假期間:</span>
                        <span>
                          {new Date(request.start_date).toLocaleDateString("zh-TW")}
                          {" ~ "}
                          {new Date(request.end_date).toLocaleDateString("zh-TW")}
                        </span>
                      </div>
                      
                      {request.reason && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium">請假原因:</span>
                          <span className="flex-1">{request.reason}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>申請時間:</span>
                        <span>
                          {new Date(request.created_at).toLocaleString("zh-TW")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      核准
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      拒絕
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
