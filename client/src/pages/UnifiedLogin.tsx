import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function UnifiedLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();


  const unifiedLoginMutation = trpc.auth.unifiedLogin.useMutation({
    onSuccess: (data) => {
      // 儲存登入資訊
      localStorage.setItem('user', JSON.stringify(data.user));

      // 檢查是否需要修改密碼
      if (!data.user.password_changed) {
        toast.info('首次登入，請修改您的密碼');
        setLocation('/change-password');
        return;
      }

      // 根據角色跳轉
      if (data.user.role === 'admin') {
        // 管理員跳轉到預約系統儀表板
        toast.success(`歡迎回來，${data.user.name}（管理員）`);
        setLocation('/admin');
      } else {
        // 一般員工跳轉到員工系統
        toast.success(`歡迎回來，${data.user.name}`);
        // 跳轉到 flosclass 系統
        window.location.href = 'https://effulgent-dasik-9e082a.netlify.app/';
      }
    },
    onError: (error) => {
      setError(error.message || '登入失敗，請檢查您的帳號密碼');
      toast.error(error.message || '請檢查您的帳號密碼');
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    unifiedLoginMutation.mutate({
      employee_id: employeeId,
      password: password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FLOS 曜診所
          </CardTitle>
          <CardDescription className="text-base">
            員工統一登入入口
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="employeeId" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                員工編號
              </Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="例如：flosHBH012"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={unifiedLoginMutation.isPending}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                密碼
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={unifiedLoginMutation.isPending}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={unifiedLoginMutation.isPending}
            >
              {unifiedLoginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登入中...
                </>
              ) : (
                '登入'
              )}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>首次登入請使用員工編號作為密碼</p>
              <p className="mt-1">登入後系統將要求您修改密碼</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
