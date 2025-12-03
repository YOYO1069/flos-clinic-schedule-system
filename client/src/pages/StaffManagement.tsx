import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, UserPlus, Users } from "lucide-react";

interface Staff {
  id: number;
  employee_id: string;
  name: string;
  role: string;
  created_at: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "staff")
        .order("name");

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error("載入員工失敗: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error("請輸入員工姓名");
      return;
    }

    try {
      // 生成新的員工編號
      const maxId = staff.length > 0 
        ? Math.max(...staff.map(s => parseInt(s.employee_id.split("-")[1]) || 0))
        : 0;
      const newEmployeeId = `STAFF-${String(maxId + 1).padStart(3, "0")}`;

      const { error } = await supabase
        .from("users")
        .insert({
          employee_id: newEmployeeId,
          name: newStaffName.trim(),
          password: "Staff@2025",
          role: "staff"
        });

      if (error) throw error;

      toast.success(`員工 ${newStaffName} 新增成功!`);
      setNewStaffName("");
      setShowAddDialog(false);
      loadStaff();
    } catch (error: any) {
      toast.error("新增員工失敗: " + error.message);
    }
  };

  const handleDeleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`確定要刪除員工 ${staffName} 嗎?`)) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", staffId);

      if (error) throw error;

      toast.success(`員工 ${staffName} 已刪除`);
      loadStaff();
    } catch (error: any) {
      toast.error("刪除員工失敗: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">員工管理</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            新增員工
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-lg">{s.name}</div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      帳號: {s.employee_id}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    加入時間: {new Date(s.created_at).toLocaleDateString("zh-TW")}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteStaff(s.id, s.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              目前沒有員工
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增員工</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>員工姓名</Label>
              <Input
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="請輸入員工姓名"
                onKeyDown={(e) => e.key === "Enter" && handleAddStaff()}
              />
            </div>
            <div className="text-sm text-gray-500">
              * 預設密碼為 Staff@2025
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStaff} className="flex-1">
                確認新增
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewStaffName("");
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
