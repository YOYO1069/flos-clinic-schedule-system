import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getFullDeviceInfo, detectIncognito } from '../utils/deviceFingerprint';
import { getIPGeolocation, checkTimezoneMatch } from '../utils/ipGeolocation';
import { calculateRiskScore } from '../utils/riskScoring';

/**
 * 訪客追蹤 Hook
 * 追蹤所有訪客行為，包括閒置時間、互動次數等
 */
export function useVisitorTracking(isEmployee = false, employeeId = null) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [visitorData, setVisitorData] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // 行為計數器
  const behaviorRef = useRef({
    mouseMovements: 0,
    keyboardEvents: 0,
    scrollEvents: 0,
    idleTime: 0,
    totalTime: 0,
    lastActivity: Date.now()
  });

  // 閒置計時器
  const idleTimerRef = useRef(null);
  const updateTimerRef = useRef(null);

  useEffect(() => {
    initializeTracking();
    
    return () => {
      stopTracking();
    };
  }, []);

  // 初始化追蹤
  const initializeTracking = async () => {
    try {
      setIsTracking(true);
      
      // 1. 獲取設備資訊
      const deviceInfo = getFullDeviceInfo();
      
      // 2. 檢測無痕模式
      const isIncognito = await detectIncognito();
      
      // 3. 獲取 IP 地理位置
      const geoData = await getIPGeolocation();
      
      // 4. 檢查時區匹配
      const timezoneCheck = checkTimezoneMatch(
        geoData?.timezone,
        deviceInfo.timezone
      );
      
      // 5. 組合訪客資料
      const visitor = {
        visitor_fingerprint: deviceInfo.fingerprint,
        session_id: sessionId,
        
        // 網路資訊
        ip_address: geoData?.ip,
        country: geoData?.country,
        region: geoData?.region,
        city: geoData?.city,
        latitude: geoData?.latitude,
        longitude: geoData?.longitude,
        isp: geoData?.isp,
        timezone: geoData?.timezone,
        postal_code: geoData?.postalCode,
        
        // 設備指紋
        canvas_hash: deviceInfo.canvas_hash,
        webgl_hash: deviceInfo.webgl_hash,
        audio_hash: deviceInfo.audio_hash,
        fonts_hash: deviceInfo.fonts_hash,
        
        // 瀏覽器資訊
        user_agent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        os: deviceInfo.os,
        os_version: deviceInfo.osVersion,
        device_vendor: deviceInfo.deviceVendor,
        
        // 硬體資訊
        screen_resolution: deviceInfo.resolution,
        color_depth: deviceInfo.colorDepth,
        hardware_concurrency: deviceInfo.hardwareConcurrency,
        device_memory: deviceInfo.deviceMemory,
        touch_support: deviceInfo.maxTouchPoints > 0,
        
        // 軟體資訊
        languages: deviceInfo.languages,
        timezone_offset: deviceInfo.timezoneOffset,
        do_not_track: deviceInfo.doNotTrack,
        cookie_enabled: deviceInfo.cookieEnabled,
        javascript_enabled: true,
        
        // 代理檢測
        is_proxy: geoData?.isProxy || false,
        is_vpn: geoData?.isVpn || false,
        is_tor: geoData?.isTor || false,
        is_incognito: isIncognito,
        
        // 行為分析
        page_url: window.location.href,
        referrer: document.referrer,
        idle_time: 0,
        total_time: 0,
        mouse_movements: 0,
        keyboard_events: 0,
        scroll_events: 0,
        
        // 狀態
        is_employee: isEmployee,
        employee_id: employeeId,
        is_blocked: false,
        
        // 時區匹配
        timezone_mismatch: !timezoneCheck.match
      };
      
      // 6. 計算風險評分
      const riskAssessment = calculateRiskScore(visitor);
      visitor.risk_score = riskAssessment.score;
      visitor.risk_level = riskAssessment.riskLevel;
      visitor.suspicious_flags = riskAssessment.flags;
      
      setVisitorData(visitor);
      
      // 7. 記錄到資料庫
      await recordVisitor(visitor);
      
      // 8. 啟動行為監控
      startBehaviorTracking();
      
      // 9. 啟動閒置檢測
      startIdleDetection();
      
      // 10. 定期更新訪客資料
      startPeriodicUpdate();
      
    } catch (error) {
      console.error('Failed to initialize visitor tracking:', error);
    }
  };

  // 記錄訪客到資料庫
  const recordVisitor = async (visitor) => {
    try {
      const { error } = await supabase
        .from('visitor_tracking')
        .insert(visitor);

      if (error) {
        console.error('Error recording visitor:', error);
      }
    } catch (error) {
      console.error('Failed to record visitor:', error);
    }
  };

  // 啟動行為追蹤
  const startBehaviorTracking = () => {
    // 滑鼠移動
    window.addEventListener('mousemove', handleMouseMove);
    
    // 鍵盤事件
    window.addEventListener('keydown', handleKeyboard);
    
    // 滾動事件
    window.addEventListener('scroll', handleScroll);
    
    // 觸控事件
    window.addEventListener('touchstart', handleTouch);
  };

  // 處理滑鼠移動
  const handleMouseMove = () => {
    behaviorRef.current.mouseMovements++;
    behaviorRef.current.lastActivity = Date.now();
    resetIdleTimer();
  };

  // 處理鍵盤事件
  const handleKeyboard = () => {
    behaviorRef.current.keyboardEvents++;
    behaviorRef.current.lastActivity = Date.now();
    resetIdleTimer();
  };

  // 處理滾動事件
  const handleScroll = () => {
    behaviorRef.current.scrollEvents++;
    behaviorRef.current.lastActivity = Date.now();
    resetIdleTimer();
  };

  // 處理觸控事件
  const handleTouch = () => {
    behaviorRef.current.mouseMovements++;
    behaviorRef.current.lastActivity = Date.now();
    resetIdleTimer();
  };

  // 啟動閒置檢測
  const startIdleDetection = () => {
    resetIdleTimer();
  };

  // 重置閒置計時器
  const resetIdleTimer = () => {
    behaviorRef.current.idleTime = 0;
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // 30 秒後標記為閒置
    idleTimerRef.current = setTimeout(() => {
      behaviorRef.current.idleTime = 30;
      
      // 如果是陌生訪客且閒置 30 秒，觸發可疑事件
      if (!isEmployee) {
        reportSuspiciousVisitor();
      }
    }, 30000);
  };

  // 報告可疑訪客
  const reportSuspiciousVisitor = async () => {
    try {
      // 重新計算風險評分
      const updatedVisitor = {
        ...visitorData,
        idle_time: 30,
        mouse_movements: behaviorRef.current.mouseMovements,
        keyboard_events: behaviorRef.current.keyboardEvents,
        scroll_events: behaviorRef.current.scrollEvents
      };
      
      const riskAssessment = calculateRiskScore(updatedVisitor);
      
      // 如果風險等級達到 medium 以上，記錄安全事件
      if (riskAssessment.riskLevel !== 'low') {
        await supabase.from('security_events').insert({
          event_type: 'suspicious_visitor',
          severity: riskAssessment.riskLevel,
          ip_address: visitorData.ip_address,
          visitor_fingerprint: visitorData.visitor_fingerprint,
          title: '可疑訪客偵測',
          description: `陌生訪客閒置 30 秒，風險等級：${riskAssessment.riskLevel}`,
          metadata: {
            risk_score: riskAssessment.score,
            flags: riskAssessment.flags,
            session_id: sessionId
          }
        });
      }
    } catch (error) {
      console.error('Failed to report suspicious visitor:', error);
    }
  };

  // 啟動定期更新
  const startPeriodicUpdate = () => {
    updateTimerRef.current = setInterval(() => {
      updateVisitorData();
    }, 60000); // 每分鐘更新一次
  };

  // 更新訪客資料
  const updateVisitorData = async () => {
    try {
      const totalTime = Math.floor((Date.now() - behaviorRef.current.lastActivity) / 1000);
      
      const updatedData = {
        idle_time: behaviorRef.current.idleTime,
        total_time: totalTime,
        mouse_movements: behaviorRef.current.mouseMovements,
        keyboard_events: behaviorRef.current.keyboardEvents,
        scroll_events: behaviorRef.current.scrollEvents,
        last_activity_at: new Date(behaviorRef.current.lastActivity).toISOString()
      };
      
      // 重新計算風險評分
      const riskAssessment = calculateRiskScore({
        ...visitorData,
        ...updatedData
      });
      
      updatedData.risk_score = riskAssessment.score;
      updatedData.risk_level = riskAssessment.riskLevel;
      updatedData.suspicious_flags = riskAssessment.flags;
      
      // 更新資料庫
      await supabase
        .from('visitor_tracking')
        .update(updatedData)
        .eq('session_id', sessionId);
      
      setVisitorData(prev => ({ ...prev, ...updatedData }));
    } catch (error) {
      console.error('Failed to update visitor data:', error);
    }
  };

  // 停止追蹤
  const stopTracking = () => {
    setIsTracking(false);
    
    // 移除事件監聽
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('keydown', handleKeyboard);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('touchstart', handleTouch);
    
    // 清除計時器
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current);
    }
    
    // 最後一次更新
    updateVisitorData();
  };

  return {
    sessionId,
    visitorData,
    isTracking,
    behavior: behaviorRef.current
  };
}

export default useVisitorTracking;
