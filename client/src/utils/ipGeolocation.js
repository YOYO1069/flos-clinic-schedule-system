/**
 * IP 地理位置工具
 * 使用 ipapi.co 免費 API
 */

// 獲取當前 IP 地址
export async function getCurrentIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get current IP:', error);
    return null;
  }
}

// 獲取 IP 地理位置資訊
export async function getIPGeolocation(ipAddress = null) {
  try {
    const url = ipAddress 
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/';
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('IP geolocation error:', data.reason);
      return null;
    }
    
    return {
      ip: data.ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      postalCode: data.postal,
      isp: data.org,
      asn: data.asn,
      // 代理檢測（ipapi.co 不提供，需要其他服務）
      isProxy: false,
      isVpn: false,
      isTor: false
    };
  } catch (error) {
    console.error('Failed to get IP geolocation:', error);
    return null;
  }
}

// 檢測時區是否匹配
export function checkTimezoneMatch(ipTimezone, browserTimezone) {
  if (!ipTimezone || !browserTimezone) {
    return { match: true, suspicious: false };
  }
  
  const match = ipTimezone === browserTimezone;
  return {
    match,
    suspicious: !match,
    ipTimezone,
    browserTimezone
  };
}

// 計算兩個地理位置之間的距離（公里）
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  getCurrentIP,
  getIPGeolocation,
  checkTimezoneMatch,
  calculateDistance
};
