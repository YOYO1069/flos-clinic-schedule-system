import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleBasedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/'
}: RoleBasedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        toast.error('請先登入');
        setLocation('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        if (!user.role) {
          toast.error('無法取得使用者角色');
          setLocation('/login');
          return;
        }

        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          toast.error('您沒有權限訪問此頁面');
          setLocation(redirectTo);
        }
      } catch (error) {
        console.error('檢查權限失敗:', error);
        toast.error('系統錯誤');
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [allowedRoles, redirectTo, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">檢查權限中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
