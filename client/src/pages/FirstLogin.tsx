import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Lock, Key, CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function FirstLogin() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 從 localStorage 取得使用者資訊
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    setLocation('/login');
    return null;
  }

  // 檢查密碼強度
  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) {
      setPasswordStrength("");
      return false;
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (password.length >= 8 && hasLetter && hasNumber) {
      setPasswordStrength("strong");
      return true;
    } else if (password.length >= 6) {
      setPasswordStrength("medium");
      return true;
    }
    
    setPasswordStrength("weak");
    return false;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("請輸入新密碼和確認密碼");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("密碼長度至少需要 6 個字元");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("兩次輸入的密碼不一致");
      return;
    }

    setIsLoading(true);

    try {
      // 更新密碼和 password_changed 標記
      const { error } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          password_changed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("密碼修改成功！正在導向首頁...");
      
      // 等待 1.5 秒後導向首頁
      setTimeout(() => {
        setLocation('/');
      }, 1500);
      
    } catch (error) {
      console.error('修改密碼失敗:', error);
      toast.error("修改密碼失敗，請重試");
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "strong": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "weak": return "text-red-600";
      default: return "text-gray-400";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case "strong": return "強度: 強";
      case "medium": return "強度: 中等";
      case "weak": return "強度: 弱";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">首次登入</CardTitle>
          <CardDescription>
            請設定您的新密碼
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="請輸入新密碼（至少6個字元）"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {passwordStrength && (
                <p className={`text-sm ${getStrengthColor()}`}>
                  {getStrengthText()}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="請再次輸入密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-purple-900">密碼強度建議：</p>
              <RadioGroup value={passwordStrength} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weak" id="weak" disabled />
                  <label htmlFor="weak" className="text-sm text-gray-600">
                    至少 6 個字元
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" disabled />
                  <label htmlFor="medium" className="text-sm text-gray-600">
                    包含字母和數字 (A-Z)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strong" id="strong" disabled />
                  <label htmlFor="strong" className="text-sm text-gray-600">
                    包含數字和字母 (a-z)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strongest" id="strongest" disabled />
                  <label htmlFor="strongest" className="text-sm text-gray-600">
                    包含數字 (0-9)
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700" 
              disabled={isLoading || !passwordStrength}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  處理中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  確認修改
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
