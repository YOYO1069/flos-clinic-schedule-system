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
  // 台灣時區是 UTC+8
  const taiwanOffset = 8 * 60; // 8小時 = 480分鐘
  const localOffset = utcDate.getTimezoneOffset(); // 本地時區偏移(分鐘)
  
  // 計算需要調整的時間差
  const offsetDiff = taiwanOffset + localOffset;
  
  // 返回調整後的時間
  return new Date(utcDate.getTime() + offsetDiff * 60 * 1000);
}

/**
 * 取得當前台灣時間
 * @returns 台灣時間的 Date 物件
 */
export function getTaiwanNow(): Date {
  const now = new Date();
  const taiwanOffset = 8 * 60; // 8小時 = 480分鐘
  const localOffset = now.getTimezoneOffset(); // 本地時區偏移(分鐘)
  
  // 計算需要調整的時間差
  const offsetDiff = taiwanOffset + localOffset;
  
  // 返回調整後的時間
  return new Date(now.getTime() + offsetDiff * 60 * 1000);
}

/**
 * 將台灣時間轉換為 UTC 時間字串 (用於儲存到資料庫)
 * @param taiwanTime - 台灣時間的 Date 物件
 * @returns UTC 時間字串 (ISO 8601 格式)
 */
export function taiwanTimeToUTC(taiwanTime: Date): string {
  const taiwanOffset = 8 * 60; // 8小時 = 480分鐘
  const localOffset = taiwanTime.getTimezoneOffset(); // 本地時區偏移(分鐘)
  
  // 計算需要調整的時間差
  const offsetDiff = taiwanOffset + localOffset;
  
  // 返回調整為 UTC 的時間字串
  const utcTime = new Date(taiwanTime.getTime() - offsetDiff * 60 * 1000);
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
