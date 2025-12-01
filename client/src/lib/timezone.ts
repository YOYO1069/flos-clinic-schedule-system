/**
 * 台灣時區工具函數
 * 確保所有時間都正確顯示為台灣時間 (UTC+8)
 */

/**
 * 將 UTC 時間字串轉換為台灣時間的 Date 物件
 * @param utcTimeString - UTC 時間字串 (ISO 8601 格式)
 * @returns 台灣時間的 Date 物件
 */
export function utcToTaiwanTime(utcTimeString: string): Date {
  const utcDate = new Date(utcTimeString);
  // 台灣時區是 UTC+8，直接加上 8 小時
  return new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
}

/**
 * 取得當前台灣時間
 * @returns 台灣時間的 Date 物件
 */
export function getTaiwanNow(): Date {
  const now = new Date();
  // 取得當前 UTC 時間，然後加上 8 小時
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + 8 * 60 * 60 * 1000);
}

/**
 * 將台灣時間轉換為 UTC 時間字串 (用於儲存到資料庫)
 * @param taiwanTime - 台灣時間的 Date 物件
 * @returns UTC 時間字串 (ISO 8601 格式)
 */
export function taiwanTimeToUTC(taiwanTime: Date): string {
  // 台灣時間減去 8 小時得到 UTC 時間
  const utcTime = new Date(taiwanTime.getTime() - 8 * 60 * 60 * 1000);
  return utcTime.toISOString();
}

/**
 * 格式化台灣時間為字串
 * @param utcTimeString - UTC 時間字串
 * @param formatStr - 格式字串 (使用 date-fns 格式)
 * @returns 格式化後的台灣時間字串
 */
export function formatTaiwanTime(utcTimeString: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const taiwanTime = utcToTaiwanTime(utcTimeString);
  
  // 手動格式化 (避免依賴 date-fns)
  const year = taiwanTime.getFullYear();
  const month = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const date = String(taiwanTime.getDate()).padStart(2, '0');
  const hours = String(taiwanTime.getHours()).padStart(2, '0');
  const minutes = String(taiwanTime.getMinutes()).padStart(2, '0');
  const seconds = String(taiwanTime.getSeconds()).padStart(2, '0');
  
  // 簡單的格式替換
  return formatStr
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', date)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}
