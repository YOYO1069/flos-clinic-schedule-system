import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // 檢查登入狀態和首次登入
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    
    // 檢查是否為首次登入
    const params = new URLSearchParams(window.location.search);
    setIsFirstLogin(params.get('first') === 'true');
  }, []);

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("請先登入");
      return;
    }

    // 驗證輸入
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("請填寫所有欄位");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("新密碼與確認密碼不一致");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密碼至少需要 6 個字元");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("新密碼不能與舊密碼相同");
      return;
    }

    setLoading(true);

    try {
      // 驗證舊密碼
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', user.employee_id)
        .single();

      if (fetchError) throw fetchError;

      if (userData.password !== oldPassword) {
        toast.error("舊密碼錯誤");
        setLoading(false);
        return;
      }

      // 更新密碼和 password_changed 標記
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          password_changed: true
        })
        .eq('employee_id', user.employee_id);

      if (updateError) throw updateError;

      // 更新 localStorage 中的用戶資料
      const updatedUser = { ...user, password: newPassword, password_changed: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("密碼修改成功!");
      
      // 如果是首次登入，導向主頁面
      if (isFirstLogin) {
        setTimeout(() => {
          if (user.role === 'admin') {
            setLocation('/admin');
          } else {
            setLocation('/');
          }
        }, 1000);
      } else {
        // 清空輸入框
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

    } catch (error) {
      console.error('修改密碼失敗:', error);
      toast.error("修改密碼失敗,請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* 返回按鈕（首次登入時不顯示） */}
        {!isFirstLogin && (
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Button>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              <CardTitle>{isFirstLogin ? "首次登入 - 修改密碼" : "修改密碼"}</CardTitle>
            </div>
            <CardDescription>
              {user && `${user.name} (${user.employee_id})`}
              {isFirstLogin && " - 為了您的帳號安全，請設定新密碼"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 舊密碼 */}
            <div className="space-y-2">
              <Label htmlFor="oldPassword">舊密碼</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="請輸入舊密碼"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* 新密碼 */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密碼</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="請輸入新密碼(至少 6 個字元)"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* 確認新密碼 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認新密碼</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="請再次輸入新密碼"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleChangePassword();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* 提示訊息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">密碼要求:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>至少 6 個字元</li>
                <li>不能與舊密碼相同</li>
                <li>建議包含英文字母和數字</li>
              </ul>
            </div>

            {/* 按鈕 */}
            <div className="flex gap-4">
              <Button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "處理中..." : "確認修改"}
              </Button>
              {!isFirstLogin && (
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  disabled={loading}
                >
                  取消
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
