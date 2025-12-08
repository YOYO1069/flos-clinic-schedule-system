import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId.trim() || !password.trim()) {
      toast.error("請輸入員工編號和密碼");
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 開始登入:', employeeId.trim());
      
      // 呼叫後端 API 進行登入
      const response = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log('📊 登入回應:', data);

      if (!response.ok || !data.success) {
        toast.error(data.message || "員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 儲存 token 和使用者資訊到 localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('✅ 登入成功，用戶資訊:', data.user.name, data.user.role);
      console.log('✅ Token 已儲存');
      
      toast.success(`歡迎回來, ${data.user.name}!`);
      
      // 添加延遲確保 localStorage 完全寫入
      setTimeout(() => {
        console.log('🔄 準備跳轉頁面...');
        
        // 使用 window.location.href 強制刷新頁面
        if (data.user.role === 'admin') {
          console.log('🔄 管理員跳轉到 /admin');
          window.location.href = '/admin';
        } else {
          console.log('🔄 員工跳轉到 /');
          window.location.href = '/';
        }
      }, 500);
    } catch (error) {
      console.error('❌ 登入錯誤:', error);
      toast.error("登入失敗，請稍後再試");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            FLOS 診所系統
          </CardTitle>
          <CardDescription className="text-base">
            請使用您的員工編號登入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium">
                員工編號
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="例如: flosHBH012"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密碼
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            忘記密碼?請聯絡管理者
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
