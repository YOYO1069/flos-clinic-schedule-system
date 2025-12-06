import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface VisitorLogData {
  ip_address?: string;
  user_agent?: string;
  page_url?: string;
  referrer?: string;
  screen_resolution?: string;
  language?: string;
  platform?: string;
  is_authorized: boolean;
  employee_id?: string;
  employee_name?: string;
  employee_role?: string;
}

export const useVisitorLog = () => {
  const logVisit = async (userData?: { employee_id: string; name: string; role: string }) => {
    try {
      // 收集瀏覽器和系統資訊
      const logData: VisitorLogData = {
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        referrer: document.referrer || undefined,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        platform: navigator.platform,
        is_authorized: !!userData,
      };

      // 如果有使用者資料，加入員工資訊
      if (userData) {
        logData.employee_id = userData.employee_id;
        logData.employee_name = userData.name;
        logData.employee_role = userData.role;
      }

      // 嘗試獲取 IP 位址（透過第三方服務）
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        logData.ip_address = ipData.ip;
      } catch (error) {
        console.warn('無法獲取 IP 位址:', error);
      }

      // 插入訪客記錄到 Supabase
      const { error } = await supabase
        .from('visitor_logs')
        .insert([logData]);

      if (error) {
        console.error('訪客記錄失敗:', error);
      }
    } catch (error) {
      console.error('記錄訪客資訊時發生錯誤:', error);
    }
  };

  return { logVisit };
};

// 自動記錄頁面訪問的 Hook
export const useAutoVisitorLog = (user?: { employee_id: string; name: string; role: string } | null) => {
  const { logVisit } = useVisitorLog();

  useEffect(() => {
    // 記錄頁面訪問
    logVisit(user || undefined);
  }, [user]); // 當使用者狀態改變時重新記錄

  return { logVisit };
};
