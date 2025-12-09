import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 檢查 localStorage 中的用戶信息
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        // 記錄未授權訪問嘗試
        await logUnauthorizedAccess();
        setLocation('/login');
        return;
      }

      const user = JSON.parse(userStr);
      
      // 驗證用戶是否仍然存在於數據庫中
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, name, role')
        .eq('employee_id', user.employee_id)
        .single();

      if (error || !data) {
        // 用戶不存在，清除 localStorage 並重定向
        localStorage.removeItem('user');
        await logUnauthorizedAccess();
        setLocation('/login');
        return;
      }

      // 更新 localStorage 確保包含最新的 role 資訊
      const updatedUser = {
        ...user,
        role: data.role,
        name: data.name
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 記錄授權訪問
      await logAuthorizedAccess(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('認證檢查失敗:', error);
      await logUnauthorizedAccess();
      setLocation('/login');
    } finally {
      setIsChecking(false);
    }
  };

  const logUnauthorizedAccess = async () => {
    try {
      // 記錄未授權訪問嘗試到控制台
      console.warn('未授權訪問嘗試:', {
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('記錄未授權訪問失敗:', error);
    }
  };

  const logAuthorizedAccess = async (user: any) => {
    try {
      // 記錄授權訪問到控制台
      console.log('員工登入:', {
        employee_id: user.employee_id,
        employee_name: user.name,
        employee_role: user.role,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('記錄授權訪問失敗:', error);
    }
  };



  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
