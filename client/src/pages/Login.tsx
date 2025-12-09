import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Lock, User } from "lucide-react";
import { verifyPassword } from "@/lib/crypto";

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
      console.log('🔍 開始查詢員工資料:', employeeId.trim());
      
      // 查詢員工資料（從 employees 表）
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId.trim())
        .single();
      
      console.log('📊 查詢結果:', { data, error });

      if (error || !data) {
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 驗證密碼（使用 SHA-256）
      console.log('🔑 開始驗證密碼...');
      const isPasswordValid = await verifyPassword(password, data.password);
      console.log('✅ 密碼驗證結果:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ 密碼錯誤');
        toast.error("員工編號或密碼錯誤");
        setIsLoading(false);
        return;
      }

      // 記錄登入日誌
      try {
        // 獲取客戶端 IP（透過第三方服務）
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const clientIp = ipData.ip;

        await supabase
          .from('flosclass_login_logs')
          .insert({
            employee_id: data.employee_id,
            employee_name: data.name,
            ip_address: clientIp,
            success: true,
            login_time: new Date().toISOString()
          });
        
        console.log('📝 登入日誌已記錄');
      } catch (logError) {
        console.error('記錄登入日誌失敗:', logError);
        // 不影響登入流程
      }

      // 儲存登入資訊到 localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        employee_id: data.employee_id,
        name: data.name,
        position: data.position,
        role: data.role
      }));

      console.log('✅ 登入成功，用戶資訊:', data.name, data.position);
      console.log('✅ localStorage 已存儲');

      toast.success(`歡迎回來,${data.name}!`);
      
      // 添加延遲確保 localStorage 完全寫入，然後使用 window.location.href 強制刷新頁面
      setTimeout(() => {
        console.log('🔄 準備跳轉頁面...');
        
        // 使用 window.location.href 強制刷新頁面
        if (data.employee_id === 'flosHBH012') {
          console.log('🔄 管理員跳轉到 /admin');
          window.location.href = '/admin';
        } else {
          console.log('🔄 員工跳轉到 /');
          window.location.href = '/';
        }
      }, 100);
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
