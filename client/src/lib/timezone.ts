/**
 * 台灣時區工具函數
 * 確保所有時間都正確顯示為台灣時間 (Asia/Taipei, UTC+8)
 */

/**
 * 取得當前台灣時間
 * @returns 台灣時間的 Date 物件
 */
export function getTaiwanNow(): Date {
  // 使用 toLocaleString 搭配 Asia/Taipei 時區取得正確的台灣時間
  const now = new Date();
  const taiwanTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  return new Date(taiwanTimeStr);
}

/**
 * 將 UTC 時間字串轉換為台灣時間的 Date 物件
 * @param utcTimeString - UTC 時間字串或任何時間字串
 * @returns 台灣時間的 Date 物件
 */
export function utcToTaiwanTime(timeString: string): Date {
  const date = new Date(timeString);
  const taiwanTimeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  return new Date(taiwanTimeStr);
}

/**
 * 將台灣時間轉換為資料庫儲存格式 (timestamp without timezone)
 * @param taiwanTime - 台灣時間的 Date 物件
 * @returns 格式化的時間字串 'yyyy-MM-dd HH:mm:ss'
 */
export function taiwanTimeToUTC(taiwanTime: Date): string {
  // 直接格式化為 timestamp without timezone 格式
  // 資料庫會將此視為台灣本地時間
  const year = taiwanTime.getFullYear();
  const month = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const date = String(taiwanTime.getDate()).padStart(2, '0');
  const hours = String(taiwanTime.getHours()).padStart(2, '0');
  const minutes = String(taiwanTime.getMinutes()).padStart(2, '0');
  const seconds = String(taiwanTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化台灣時間為字串
 * @param timeString - 時間字串
 * @param formatStr - 格式字串
 * @returns 格式化後的台灣時間字串
 */
export function formatTaiwanTime(timeString: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const taiwanTime = utcToTaiwanTime(timeString);
  
  const year = taiwanTime.getFullYear();
  const month = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const date = String(taiwanTime.getDate()).padStart(2, '0');
  const hours = String(taiwanTime.getHours()).padStart(2, '0');
  const minutes = String(taiwanTime.getMinutes()).padStart(2, '0');
  const seconds = String(taiwanTime.getSeconds()).padStart(2, '0');
  
  return formatStr
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', date)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}
