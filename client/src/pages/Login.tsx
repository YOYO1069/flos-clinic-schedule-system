import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
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
      // 查詢使用者
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId.trim())
        .single();

      if (error || !data) {
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 驗證密碼 (實際應用中應使用加密比對)
      if (data.password !== password) {
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 儲存登入資訊到 localStorage
      localStorage.setItem('employee', JSON.stringify({
        id: data.id,
        employee_id: data.employee_id,
        name: data.name,
        role: data.role
      }));

      toast.success(`歡迎回來, ${data.name}!`);
      
      // 根據角色導向不同頁面
      if (data.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    } catch (error) {
      console.error('登入失敗:', error);
      toast.error("登入失敗,請重試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">FLOS 診所系統</CardTitle>
          <CardDescription className="text-center">
            請使用您的員工編號登入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">員工編號</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="例如: flosHBH012"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>忘記密碼?請聯絡管理者</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
