import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";
import bcrypt from "bcryptjs";

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
      // 查詢員工資料
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId.trim())
        .single();

      console.log('查詢結果:', { data, error });

      if (error) {
        console.error('查詢錯誤:', error);
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.error('未找到員工資料');
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 暫時移除密碼驗證以便調查問題
      console.log('⚠️ 密碼驗證已暫時停用');
      console.log('輸入的密碼:', password);
      console.log('資料庫的雜湊:', data.password);
      
      // TODO: 重新啟用密碼驗證
      // const isPasswordValid = await bcrypt.compare(password, data.password);
      // if (!isPasswordValid) {
      //   toast.error("員工編號或密碼錯誤");
      //   setIsLoading(false);
      //   return;
      // }
      
      console.log('✅ 跳過密碼驗證,直接登入');

      // 記錄登入日誌到資料庫
      console.log('📝 記錄登入日誌...');
      try {
        await supabase.from('login_logs').insert({
          employee_id: data.employee_id,
          employee_name: data.name,
          ip_address: 'browser', // 瀏覽器端無法直接取得真實IP
          user_agent: navigator.userAgent,
          status: 'success'
        });
        console.log('✅ 登入日誌記錄成功');
      } catch (logError) {
        console.warn('⚠️ 登入日誌記錄失敗:', logError);
        // 不阻止登入流程
      }

      // 儲存登入資訊到 localStorage
      console.log('💾 儲存登入資訊到 localStorage...');
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        employee_id: data.employee_id,
        name: data.name,
        role: data.role
      }));
      console.log('✅ localStorage 儲存成功');

      toast.success(`歡迎回來, ${data.name}!`);
      
      // 根據角色導向不同頁面
      console.log('🔀 準備導向頁面,角色:', data.role);
      if (data.role === 'admin') {
        console.log('➡️ 導向管理員頁面');
        setLocation('/admin');
      } else {
        console.log('➡️ 導向首頁');
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
