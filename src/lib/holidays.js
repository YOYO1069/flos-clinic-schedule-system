/**
 * 2025年台灣國定假日列表
 * 資料來源: 中華民國人事行政總處
 */

export const TAIWAN_HOLIDAYS_2025 = [
  // 元旦連假 (1/1-1/4, 週三至週六)
  { date: '2025-01-01', name: '元旦' },
  
  // 農曆春節 (1/25-2/2, 週六至週日)
  { date: '2025-01-25', name: '除夕前一日(彈性放假)' },
  { date: '2025-01-26', name: '農曆除夕(週日)' },
  { date: '2025-01-27', name: '春節初一(週一)' },
  { date: '2025-01-28', name: '春節初二(週二)' },
  { date: '2025-01-29', name: '春節初三(週三)' },
  { date: '2025-01-30', name: '春節初四(週四)' },
  { date: '2025-01-31', name: '春節初五(週五)' },
  { date: '2025-02-01', name: '春節初六(週六)' },
  { date: '2025-02-02', name: '春節初七(週日)' },
  
  // 228和平紀念日 (2/28-3/2, 週五至週日)
  { date: '2025-02-28', name: '和平紀念日' },
  { date: '2025-03-01', name: '和平紀念日補假' },
  
  // 兒童節及清明節 (4/3-4/6, 週四至週日)
  { date: '2025-04-03', name: '兒童節補假' },
  { date: '2025-04-04', name: '兒童節' },
  { date: '2025-04-05', name: '清明節' },
  
  // 端午節 (5/31-6/2, 週六至週一)
  { date: '2025-05-31', name: '端午節' },
  { date: '2025-06-02', name: '端午節補假' },
  
  // 中秋節 (10/6-10/8, 週一至週三)
  { date: '2025-10-06', name: '中秋節' },
  { date: '2025-10-07', name: '中秋節補假' },
  
  // 國慶日 (10/10-10/12, 週五至週日)
  { date: '2025-10-10', name: '國慶日' },
  { date: '2025-10-11', name: '國慶日補假' },
  
  // 同志大遊行 (診所特別休診日)
  { date: '2024-10-24', name: '同志大遊行' },
  { date: '2024-10-25', name: '同志大遊行' },
  { date: '2025-10-24', name: '同志大遊行' },
  { date: '2025-10-25', name: '同志大遊行' },
]

/**
 * 檢查指定日期是否為國定假日
 * @param {string} dateString - 日期字串 (格式: YYYY-MM-DD)
 * @returns {Object|null} - 如果是假日則返回假日資訊,否則返回 null
 */
export function isHoliday(dateString) {
  return TAIWAN_HOLIDAYS_2025.find(holiday => holiday.date === dateString) || null
}

/**
 * 檢查指定日期是否為週日
 * @param {Date} date - 日期物件
 * @returns {boolean}
 */
export function isSunday(date) {
  return date.getDay() === 0
}

/**
 * 檢查指定日期是否為休診日 (週日或國定假日)
 * @param {Date} date - 日期物件
 * @returns {Object|null} - 如果是休診日則返回原因,否則返回 null
 */
export function isClosedDay(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  
  // 檢查是否為週日
  if (isSunday(date)) {
    return { type: 'sunday', name: '週日休診' }
  }
  
  // 檢查是否為國定假日
  const holiday = isHoliday(dateString)
  if (holiday) {
    return { type: 'holiday', name: `${holiday.name}(休診)` }
  }
  
  return null
}
