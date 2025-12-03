import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, UserPlus, Users, Edit } from "lucide-react";

interface Staff {
  id: number;
  employee_id: string;
  name: string;
  role: string;
  position?: string;
  phone?: string;
  employment_status?: string;
  resignation_date?: string;
  created_at: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmploymentStatus, setEditEmploymentStatus] = useState("在職");
  const [editResignationDate, setEditResignationDate] = useState("");

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

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditPosition(staff.position || "");
    setEditPhone(staff.phone || "");
    setEditEmploymentStatus(staff.employment_status || "在職");
    setEditResignationDate(staff.resignation_date || "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStaff) return;
    if (!editStaffName.trim()) {
      toast.error("請輸入員工姓名");
      return;
    }

    try {
      const updateData: any = {
        name: editStaffName.trim(),
        position: editPosition.trim() || null,
        phone: editPhone.trim() || null,
        employment_status: editEmploymentStatus,
        resignation_date: editResignationDate || null
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", editingStaff.id);

      if (error) throw error;

      toast.success(`員工資料已更新`);
      setShowEditDialog(false);
      setEditingStaff(null);
      setEditStaffName("");
      setEditPosition("");
      setEditPhone("");
      setEditEmploymentStatus("在職");
      setEditResignationDate("");
      loadStaff();
    } catch (error: any) {
      toast.error("更新員工失敗: " + error.message);
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-medium text-lg">{s.name}</div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {s.employee_id}
                    </div>
                    {s.employment_status && (
                      <div className={`text-xs px-2 py-1 rounded ${
                        s.employment_status === '在職' ? 'bg-green-100 text-green-700' :
                        s.employment_status === '試用期' ? 'bg-blue-100 text-blue-700' :
                        s.employment_status === '留職停薪' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {s.employment_status}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {s.position && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">💼</span>
                        <span>{s.position}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">📞</span>
                        <span>{s.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">📅</span>
                      <span>加入: {new Date(s.created_at).toLocaleDateString("zh-TW")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStaff(s)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStaff(s.id, s.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯員工資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>員工編號</Label>
              <Input
                value={editingStaff?.employee_id || ""}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label>員工姓名</Label>
              <Input
                value={editStaffName}
                onChange={(e) => setEditStaffName(e.target.value)}
                placeholder="請輸入員工姓名"
              />
            </div>
            <div>
              <Label>職位</Label>
              <Input
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                placeholder="例：護理師、美容師、櫃檯人員"
              />
            </div>
            <div>
              <Label>聯絡電話</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="0912-345-678"
              />
            </div>
            <div>
              <Label>在職狀態</Label>
              <select
                value={editEmploymentStatus}
                onChange={(e) => setEditEmploymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="在職">在職</option>
                <option value="試用期">試用期</option>
                <option value="留職停薪">留職停薪</option>
                <option value="離職">離職</option>
              </select>
            </div>
            {editEmploymentStatus === "離職" && (
              <div>
                <Label>離職日期</Label>
                <Input
                  type="date"
                  value={editResignationDate}
                  onChange={(e) => setEditResignationDate(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                確認修改
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingStaff(null);
                  setEditStaffName("");
                  setEditPosition("");
                  setEditPhone("");
                  setEditEmploymentStatus("在職");
                  setEditResignationDate("");
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
