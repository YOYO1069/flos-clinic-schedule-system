import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

// 密碼強度檢查
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    checks,
    score,
    strength: score <= 2 ? 'weak' : score === 3 ? 'medium' : 'strong',
  };
};

// 密碼檢查項目元件
function PasswordCheck({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className={checked ? 'text-green-700' : 'text-gray-500'}>{text}</span>
    </div>
  );
}

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
  
  const passwordStrength = checkPasswordStrength(newPassword);
  
  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success('密碼修改成功！將自動登出...');
      // 清除本地儲存
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setTimeout(() => {
        setLocation('/unified-login');
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || '密碼修改失敗');
      setLoading(false);
    },
  });
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

    // 驗證密碼強度
    if (passwordStrength.score < 3) {
      toast.error("密碼強度不足，請至少滿足 3 項要求");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("新密碼不能與舊密碼相同");
      return;
    }

    setLoading(true);

    // 使用 tRPC 修改密碼（會同步到兩個資料庫）
    changePasswordMutation.mutate({
      employee_id: user.employee_id,
      old_password: oldPassword,
      new_password: newPassword,
    });
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

            {/* 密碼強度指示器 */}
            {newPassword && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">密碼強度</span>
                  <span className={`text-sm font-bold ${
                    passwordStrength.strength === 'weak' ? 'text-red-600' :
                    passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.strength === 'weak' ? '弱' :
                     passwordStrength.strength === 'medium' ? '中' : '強'}
                  </span>
                </div>
                <div className="space-y-1">
                  <PasswordCheck checked={passwordStrength.checks.length} text="至少 8 個字元" />
                  <PasswordCheck checked={passwordStrength.checks.uppercase} text="包含大寫字母 (A-Z)" />
                  <PasswordCheck checked={passwordStrength.checks.lowercase} text="包含小寫字母 (a-z)" />
                  <PasswordCheck checked={passwordStrength.checks.number} text="包含數字 (0-9)" />
                </div>
                <p className="text-xs text-gray-500 mt-2">* 請至少滿足 3 項要求</p>
              </div>
            )}

            {/* 按鈕 */}
            <div className="flex gap-4">
              <Button
                onClick={handleChangePassword}
                disabled={loading || (newPassword && passwordStrength.score < 3)}
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
