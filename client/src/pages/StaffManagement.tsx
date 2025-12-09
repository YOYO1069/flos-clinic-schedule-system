import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, UserPlus, Users, Edit, ArrowLeft } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/permissions";
import { canModifyUser, filterManageableUsers } from "@/lib/roleHierarchy";

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
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { permissions } = usePermissions(currentUser?.role as UserRole);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("staff");
  const [newPassword, setNewPassword] = useState("Staff@2025");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmploymentStatus, setEditEmploymentStatus] = useState("在職");
  const [editResignationDate, setEditResignationDate] = useState("");
  const [editRole, setEditRole] = useState("staff");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("全部");
  const [filterRole, setFilterRole] = useState("全部");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    // 檢查登入狀態
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
  }, [setLocation]);

  useEffect(() => {
    if (!currentUser) return;
    if (!permissions.canAccessEmployeeManagement) {
      toast.error("您沒有權限存取此頁面");
      setLocation('/');
      return;
    }
    loadStaff();
  }, [currentUser, permissions.canAccessEmployeeManagement, setLocation]);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
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
        .from("employees")
        .insert({
          employee_id: newEmployeeId,
          name: newStaffName.trim(),
          password: newPassword,
          role: newRole,
          position: newPosition.trim() || null,
          phone: newPhone.trim() || null,
          employment_status: "在職"
        });

      if (error) throw error;

      toast.success(`員工 ${newStaffName} 新增成功！初始密碼：${newPassword}`);
      setNewStaffName("");
      setNewPosition("");
      setNewPhone("");
      setNewRole("staff");
      setNewPassword("Staff@2025");
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
    setEditRole(staff.role || "staff");
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
        resignation_date: editEmploymentStatus === "離職" && editResignationDate 
          ? editResignationDate 
          : null
      };
      
      // 只有管理員可以修改角色
      if (currentUser?.role === 'admin') {
        updateData.role = editRole;
      }

      const { error } = await supabase
        .from("employees")
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
      setEditRole("staff");
      loadStaff();
    } catch (error: any) {
      toast.error("更新員工失敗: " + error.message);
    }
  };

  // 篩選和排序員工
  const filteredAndSortedStaff = staff
    .filter(s => {
      // 角色層級篩選 - 只顯示可管理的員工
      if (currentUser && currentUser.role !== 'admin') {
        if (!canModifyUser(currentUser.role as UserRole, s.role as UserRole)) {
          return false;
        }
      }
      
      // 搜尋篩選
      const matchSearch = searchTerm === "" || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 在職狀態篩選
      const matchStatus = filterStatus === "全部" || 
        (filterStatus === "未設定" && !s.employment_status) ||
        s.employment_status === filterStatus;
      
      // 角色篩選
      const matchRole = filterRole === "全部" || s.role === filterRole;
      
      return matchSearch && matchStatus && matchRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, 'zh-TW');
        case "employee_id":
          return a.employee_id.localeCompare(b.employee_id);
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "employment_status":
          return (a.employment_status || "").localeCompare(b.employment_status || "");
        default:
          return 0;
      }
    });

  // 統計資訊
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.employment_status === "在職" || !s.employment_status).length,
    trial: staff.filter(s => s.employment_status === "試用期").length,
    leave: staff.filter(s => s.employment_status === "留職停薪").length,
    resigned: staff.filter(s => s.employment_status === "離職").length,
    byRole: {
      admin: staff.filter(s => s.role === "admin").length,
      senior_supervisor: staff.filter(s => s.role === "senior_supervisor").length,
      supervisor: staff.filter(s => s.role === "supervisor").length,
      staff: staff.filter(s => s.role === "staff").length,
    }
  };

  const handleDeleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`確定要刪除員工 ${staffName} 嗎?`)) return;

    try {
      const { error } = await supabase
        .from("employees")
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
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">員工管理</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            新增員工
          </Button>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-500">總人數</div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">在職</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">試用期</div>
            <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">留職停薪</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.leave}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">離職</div>
            <div className="text-2xl font-bold text-red-600">{stats.resigned}</div>
          </Card>
        </div>

        {/* 搜尋和篩選 */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="搜尋姓名或編號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="全部">全部狀態</option>
                <option value="在職">在職</option>
                <option value="試用期">試用期</option>
                <option value="留職停薪">留職停薪</option>
                <option value="離職">離職</option>
                <option value="未設定">未設定</option>
              </select>
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="全部">全部角色</option>
                <option value="admin">管理員</option>
                <option value="senior_supervisor">高階主管</option>
                <option value="supervisor">一般主管</option>
                <option value="staff">員工</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">按姓名排序</option>
                <option value="employee_id">按編號排序</option>
                <option value="created_at">按加入時間排序</option>
                <option value="employment_status">按在職狀態排序</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            顯示 {filteredAndSortedStaff.length} / {stats.total} 位員工
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-3">
            {filteredAndSortedStaff.map((s) => (
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

          {filteredAndSortedStaff.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {staff.length === 0 ? "目前沒有員工" : "沒有符合篩選條件的員工"}
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
              <Label>員工姓名 *</Label>
              <Input
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="請輸入員工姓名"
              />
            </div>
            <div>
              <Label>職位</Label>
              <Input
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="例：護理師、美容師、櫃檯人員"
              />
            </div>
            <div>
              <Label>聯絡電話</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0912-345-678"
              />
            </div>
            {currentUser?.role === 'admin' && (
              <div>
                <Label>角色權限</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">員工</option>
                  <option value="supervisor">一般主管</option>
                  <option value="senior_supervisor">高階主管</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">管理員權限僅限系統管理</p>
              </div>
            )}
            <div>
              <Label>初始密碼</Label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="請輸入初始密碼"
              />
              <p className="text-xs text-gray-500 mt-1">預設為 Staff@2025，可自行修改</p>
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
                  setNewPosition("");
                  setNewPhone("");
                  setNewRole("staff");
                  setNewPassword("Staff@2025");
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
            {currentUser?.role === 'admin' && (
              <div>
                <Label>角色權限</Label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">員工</option>
                  <option value="supervisor">一般主管</option>
                  <option value="senior_supervisor">高階主管</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">管理員權限僅限系統管理</p>
              </div>
            )}
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
            <div className="border-t pt-4 mt-4">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!editingStaff) return;
                  if (!confirm(`確定要重設 ${editingStaff.name} 的密碼嗎？新密碼將設定為 Staff@2025`)) return;
                  
                  try {
                    const { error } = await supabase
                      .from("employees")
                      .update({ password: "Staff@2025" })
                      .eq("id", editingStaff.id);
                    
                    if (error) throw error;
                    toast.success(`密碼已重設為 Staff@2025`);
                  } catch (error: any) {
                    toast.error("重設密碼失敗: " + error.message);
                  }
                }}
                className="w-full mb-3"
              >
                🔑 重設密碼為 Staff@2025
              </Button>
            </div>
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
                  setEditRole("staff");
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
