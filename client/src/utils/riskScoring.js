/**
 * 風險評分系統
 * 根據訪客行為和特徵計算風險等級
 */

// 計算風險評分
export function calculateRiskScore(visitorData) {
  let score = 0;
  const flags = [];
  
  // 1. 時區不匹配（+20 分）
  if (visitorData.timezone_mismatch) {
    score += 20;
    flags.push('timezone_mismatch');
  }
  
  // 2. 使用代理/VPN（+25 分）
  if (visitorData.is_proxy || visitorData.is_vpn) {
    score += 25;
    flags.push('proxy_detected');
  }
  
  // 3. 使用 Tor（+30 分）
  if (visitorData.is_tor) {
    score += 30;
    flags.push('tor_detected');
  }
  
  // 4. 閒置 30 秒以上且非員工（+15 分）
  if (visitorData.idle_time >= 30 && !visitorData.is_employee) {
    score += 15;
    flags.push('idle_30s');
  }
  
  // 5. 無痕模式（+10 分）
  if (visitorData.is_incognito) {
    score += 10;
    flags.push('incognito_mode');
  }
  
  // 6. 異常 User Agent（+15 分）
  if (isAbnormalUserAgent(visitorData.user_agent)) {
    score += 15;
    flags.push('abnormal_ua');
  }
  
  // 7. 無互動（+20 分）
  if (visitorData.mouse_movements === 0 && 
      visitorData.keyboard_events === 0 && 
      visitorData.scroll_events === 0 &&
      visitorData.total_time > 10) {
    score += 20;
    flags.push('no_interaction');
  }
  
  // 8. 指紋異常（+15 分）
  if (hasAbnormalFingerprint(visitorData)) {
    score += 15;
    flags.push('abnormal_fingerprint');
  }
  
  // 9. 深夜訪問（+10 分）- 台灣時間 00:00-06:00
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6 && !visitorData.is_employee) {
    score += 10;
    flags.push('late_night_access');
  }
  
  // 10. 多次失敗登入嘗試（+25 分）
  if (visitorData.failed_login_attempts >= 3) {
    score += 25;
    flags.push('multiple_failed_logins');
  }
  
  // 確定風險等級
  let riskLevel = 'low';
  if (score >= 70) riskLevel = 'critical';
  else if (score >= 50) riskLevel = 'high';
  else if (score >= 30) riskLevel = 'medium';
  
  return {
    score: Math.min(score, 100), // 最高 100 分
    riskLevel,
    flags
  };
}

// 檢查是否為異常 User Agent
function isAbnormalUserAgent(userAgent) {
  if (!userAgent) return true;
  
  const abnormalPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /phantom/i,
    /selenium/i
  ];
  
  return abnormalPatterns.some(pattern => pattern.test(userAgent));
}

// 檢查指紋是否異常
function hasAbnormalFingerprint(visitorData) {
  // 檢查是否有錯誤的指紋
  const errorFingerprints = [
    'canvas_error',
    'webgl_error',
    'audio_error',
    'fonts_error',
    'webgl_not_supported'
  ];
  
  return errorFingerprints.some(error => 
    visitorData.canvas_hash === error ||
    visitorData.webgl_hash === error ||
    visitorData.audio_hash === error ||
    visitorData.fonts_hash === error
  );
}

// 獲取風險等級顏色
export function getRiskLevelColor(riskLevel) {
  const colors = {
    low: '#10b981', // 綠色
    medium: '#f59e0b', // 黃色
    high: '#ef4444', // 紅色
    critical: '#dc2626' // 深紅色
  };
  return colors[riskLevel] || colors.low;
}

// 獲取風險等級圖標
export function getRiskLevelIcon(riskLevel) {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '🚨'
  };
  return icons[riskLevel] || icons.low;
}

// 獲取風險等級文字
export function getRiskLevelText(riskLevel) {
  const texts = {
    low: '低風險',
    medium: '中風險',
    high: '高風險',
    critical: '極高風險'
  };
  return texts[riskLevel] || texts.low;
}

// 獲取可疑標記的描述
export function getFlagDescription(flag) {
  const descriptions = {
    timezone_mismatch: '時區不匹配（可能使用 VPN）',
    proxy_detected: '檢測到代理伺服器',
    tor_detected: '檢測到 Tor 網路',
    idle_30s: '閒置超過 30 秒',
    incognito_mode: '使用無痕模式',
    abnormal_ua: '異常的 User Agent',
    no_interaction: '無任何互動行為',
    abnormal_fingerprint: '異常的設備指紋',
    late_night_access: '深夜訪問（00:00-06:00）',
    multiple_failed_logins: '多次登入失敗'
  };
  return descriptions[flag] || flag;
}

export default {
  calculateRiskScore,
  getRiskLevelColor,
  getRiskLevelIcon,
  getRiskLevelText,
  getFlagDescription
};
